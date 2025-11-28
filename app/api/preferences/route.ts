import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET user preference (or create default if doesn't exist)
export async function GET() {
  try {
    let preference = await prisma.userPreference.findFirst()

    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          targetRatio: 3.0,
        },
      })
    }

    return NextResponse.json(preference)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PATCH update target ratio
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { targetRatio } = body

    if (targetRatio == null) {
      return NextResponse.json(
        { error: 'Missing targetRatio' },
        { status: 400 }
      )
    }

    let preference = await prisma.userPreference.findFirst()

    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          targetRatio: parseFloat(targetRatio),
        },
      })
    } else {
      preference = await prisma.userPreference.update({
        where: { id: preference.id },
        data: {
          targetRatio: parseFloat(targetRatio),
        },
      })
    }

    return NextResponse.json(preference)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
