import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET - Get all settings
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    const settings = await prisma.settings.findMany({
      where: category ? { category } : undefined,
      orderBy: { key: 'asc' },
    })

    // Convert to key-value object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({ settings: settingsObj, raw: settings })
  } catch (error) {
    console.error('Fetch settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// POST - Update settings (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()

    const setting = await prisma.settings.upsert({
      where: { key: body.key },
      update: {
        value: body.value,
        category: body.category,
        description: body.description,
      },
      create: {
        key: body.key,
        value: body.value,
        category: body.category,
        description: body.description,
      },
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
