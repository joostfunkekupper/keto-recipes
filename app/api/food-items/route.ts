import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all food items
export async function GET() {
  try {
    const foodItems = await prisma.foodItem.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(foodItems)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch food items' },
      { status: 500 }
    )
  }
}

// POST create new food item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, protein, fat, carbs } = body

    if (!name || protein == null || fat == null || carbs == null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const foodItem = await prisma.foodItem.create({
      data: {
        name,
        protein: parseFloat(protein),
        fat: parseFloat(fat),
        carbs: parseFloat(carbs),
      },
    })

    return NextResponse.json(foodItem, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create food item' },
      { status: 500 }
    )
  }
}
