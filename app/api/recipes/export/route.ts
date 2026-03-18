import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const recipes = await prisma.recipe.findMany({
    where: { createdById: session.user.id },
    include: {
      ingredients: {
        include: { foodItem: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Collect unique food items
  const foodItemMap = new Map<string, { name: string; protein: number; fat: number; carbs: number }>()
  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      if (!foodItemMap.has(ing.foodItem.name)) {
        foodItemMap.set(ing.foodItem.name, {
          name: ing.foodItem.name,
          protein: ing.foodItem.protein,
          fat: ing.foodItem.fat,
          carbs: ing.foodItem.carbs,
        })
      }
    }
  }

  const foodItemsXml = [...foodItemMap.values()]
    .map(
      (fi) => `    <foodItem>
      <name>${escapeXml(fi.name)}</name>
      <protein>${fi.protein}</protein>
      <fat>${fi.fat}</fat>
      <carbs>${fi.carbs}</carbs>
    </foodItem>`
    )
    .join('\n')

  const recipesXml = recipes
    .map((r) => {
      const ingredientsXml = r.ingredients
        .map(
          (ing) => `        <ingredient>
          <foodItemName>${escapeXml(ing.foodItem.name)}</foodItemName>
          <grams>${ing.grams}</grams>
        </ingredient>`
        )
        .join('\n')

      return `    <recipe>
      <name>${escapeXml(r.name)}</name>
      <servings>${r.servings}</servings>
      <isPublic>${r.isPublic}</isPublic>
      <instructions>${r.instructions ? escapeXml(r.instructions) : ''}</instructions>
      <ingredients>
${ingredientsXml}
      </ingredients>
    </recipe>`
    })
    .join('\n')

  const username = (session.user as any).username ?? session.user.name ?? 'unknown'
  const exportedAt = new Date().toISOString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ketoRecipes exportedAt="${exportedAt}" exportedBy="${escapeXml(username)}">
  <foodItems>
${foodItemsXml}
  </foodItems>
  <recipes>
${recipesXml}
  </recipes>
</ketoRecipes>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Content-Disposition': 'attachment; filename="recipes.xml"',
    },
  })
}
