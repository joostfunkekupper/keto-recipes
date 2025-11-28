import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single recipe
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            foodItem: true,
          },
        },
      },
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(recipe)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}

// PATCH update recipe
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, instructions, servings, ingredients } = body

    // If ingredients are provided, delete old ones and create new ones
    if (ingredients) {
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId: id },
      })
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(instructions && { instructions }),
        ...(servings && { servings: parseInt(servings) }),
        ...(ingredients && {
          ingredients: {
            create: ingredients.map((ing: any) => ({
              foodItemId: ing.foodItemId,
              grams: parseFloat(ing.grams),
            })),
          },
        }),
      },
      include: {
        ingredients: {
          include: {
            foodItem: true,
          },
        },
      },
    })

    return NextResponse.json(recipe)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

// DELETE recipe
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.recipe.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}
