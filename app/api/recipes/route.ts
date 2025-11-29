import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all recipes with ingredients
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            foodItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(recipes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

// POST create new recipe
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to create recipes' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, instructions, servings, ingredients } = body

    if (!name || !instructions || !servings || !ingredients) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        instructions,
        servings: parseInt(servings),
        createdById: session.user.id,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            foodItemId: ing.foodItemId,
            grams: parseFloat(ing.grams),
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            foodItem: true,
          },
        },
      },
    })

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
