import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET single food item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const foodItem = await prisma.foodItem.findUnique({
      where: { id },
    })

    if (!foodItem) {
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(foodItem)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch food item' },
      { status: 500 }
    )
  }
}

// PATCH update food item
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to update food items' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, protein, fat, carbs } = body

    const foodItem = await prisma.foodItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(protein != null && { protein: parseFloat(protein) }),
        ...(fat != null && { fat: parseFloat(fat) }),
        ...(carbs != null && { carbs: parseFloat(carbs) }),
      },
    })

    return NextResponse.json(foodItem)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update food item' },
      { status: 500 }
    )
  }
}

// DELETE food item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to delete food items' },
        { status: 401 }
      )
    }

    const { id } = await params
    await prisma.foodItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete food item' },
      { status: 500 }
    )
  }
}
