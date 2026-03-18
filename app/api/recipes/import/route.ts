import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ImportFoodItem {
  name: string
  protein: number
  fat: number
  carbs: number
}

interface ImportIngredient {
  foodItemName: string
  grams: number
}

interface ImportRecipe {
  name: string
  servings: number
  isPublic: boolean
  instructions: string
  ingredients: ImportIngredient[]
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { foodItems, recipes, override } = body as {
    foodItems: ImportFoodItem[]
    recipes: ImportRecipe[]
    override: boolean
  }

  // Check for recipe name conflicts
  const recipeNames = recipes.map((r) => r.name)
  const existing = await prisma.recipe.findMany({
    where: {
      createdById: session.user.id,
      name: { in: recipeNames },
    },
    select: { name: true },
  })

  const conflicts = existing.map((r) => r.name)

  if (!override && conflicts.length > 0) {
    return NextResponse.json({ conflicts }, { status: 409 })
  }

  // Resolve/create food items
  const foodItemIdMap = new Map<string, string>()

  for (const fi of foodItems) {
    const nameLower = fi.name.toLowerCase()
    const existing = await prisma.foodItem.findFirst({
      where: { name: { equals: fi.name, mode: 'insensitive' } },
    })

    if (existing) {
      foodItemIdMap.set(nameLower, existing.id)
    } else {
      const created = await prisma.foodItem.create({
        data: {
          name: fi.name,
          protein: fi.protein,
          fat: fi.fat,
          carbs: fi.carbs,
          createdById: session.user.id,
        },
      })
      foodItemIdMap.set(nameLower, created.id)
    }
  }

  // Delete conflicting recipes (cascade handles ingredients)
  if (conflicts.length > 0) {
    await prisma.recipe.deleteMany({
      where: {
        createdById: session.user.id,
        name: { in: conflicts },
      },
    })
  }

  // Create all recipes
  for (const recipe of recipes) {
    await prisma.recipe.create({
      data: {
        name: recipe.name,
        servings: recipe.servings,
        isPublic: recipe.isPublic,
        instructions: recipe.instructions || null,
        createdById: session.user.id,
        ingredients: {
          create: recipe.ingredients
            .filter((ing) => foodItemIdMap.has(ing.foodItemName.toLowerCase()))
            .map((ing) => ({
              foodItemId: foodItemIdMap.get(ing.foodItemName.toLowerCase())!,
              grams: ing.grams,
            })),
        },
      },
    })
  }

  return NextResponse.json({ imported: recipes.length })
}
