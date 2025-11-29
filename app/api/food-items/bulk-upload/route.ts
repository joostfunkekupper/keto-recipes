import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST bulk upload food items from CSV
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to upload food items' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    // Skip header row if it exists
    const dataLines = lines[0].toLowerCase().includes('item') ? lines.slice(1) : lines

    const foodItems = []
    const errors = []

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim()
      if (!line) continue

      try {
        // Parse CSV line - handle quoted strings
        const parsed = parseCSVLine(line)

        if (parsed.length < 4) {
          errors.push(`Line ${i + 1}: Invalid format - expected 4 columns`)
          continue
        }

        const [item, protein, fat, carbs] = parsed

        // Remove quotes from item name if present
        const name = item.replace(/^["']|["']$/g, '').trim()

        if (!name) {
          errors.push(`Line ${i + 1}: Missing item name`)
          continue
        }

        const proteinValue = parseFloat(protein)
        const fatValue = parseFloat(fat)
        const carbsValue = parseFloat(carbs)

        if (isNaN(proteinValue) || isNaN(fatValue) || isNaN(carbsValue)) {
          errors.push(`Line ${i + 1}: Invalid numeric values`)
          continue
        }

        foodItems.push({
          name,
          protein: proteinValue,
          fat: fatValue,
          carbs: carbsValue,
        })
      } catch (error) {
        errors.push(`Line ${i + 1}: Parse error - ${error}`)
      }
    }

    if (foodItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid food items found in CSV', errors },
        { status: 400 }
      )
    }

    // Bulk insert food items
    const result = await prisma.foodItem.createMany({
      data: foodItems,
      skipDuplicates: true,
    })

    return NextResponse.json({
      success: true,
      imported: result.count,
      total: dataLines.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    )
  }
}

// Simple CSV parser that handles quoted strings
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  // Add the last field
  if (current) {
    result.push(current.trim())
  }

  return result
}
