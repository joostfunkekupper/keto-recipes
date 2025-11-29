import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET user preference (or create default if doesn't exist)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      // Return default for non-authenticated users
      return NextResponse.json({ targetRatio: 3.0 })
    }

    let preference = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    })

    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          targetRatio: 3.0,
          userId: session.user.id,
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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to update preferences' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { targetRatio } = body

    if (targetRatio == null) {
      return NextResponse.json(
        { error: 'Missing targetRatio' },
        { status: 400 }
      )
    }

    let preference = await prisma.userPreference.findUnique({
      where: { userId: session.user.id },
    })

    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          targetRatio: parseFloat(targetRatio),
          userId: session.user.id,
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
