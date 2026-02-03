import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to update recipes' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if the user owns the recipe
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      select: { createdById: true },
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    if (existingRecipe.createdById !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this recipe' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, instructions, servings, ingredients, isPublic } = body

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
        ...(instructions !== undefined && { instructions: instructions || null }),
        ...(servings && { servings: parseInt(servings) }),
        ...(isPublic !== undefined && { isPublic }),
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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to delete recipes' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if the user owns the recipe
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      select: { createdById: true },
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    if (existingRecipe.createdById !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this recipe' },
        { status: 403 }
      )
    }

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
