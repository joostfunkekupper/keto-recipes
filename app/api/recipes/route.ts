import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all recipes with ingredients
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'public' or 'my'

    let whereClause = {}

    if (type === 'my') {
      // Only user's own recipes (both public and private)
      if (!session?.user) {
        return NextResponse.json([])
      }
      whereClause = {
        createdById: session.user.id,
      }
    } else {
      // Public recipes only (default view)
      whereClause = {
        isPublic: true,
      }
    }

    const recipes = await prisma.recipe.findMany({
      where: whereClause,
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
    const { name, instructions, servings, ingredients, isPublic } = body

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
        isPublic: isPublic !== undefined ? isPublic : false,
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
    console.error('Failed to create recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
