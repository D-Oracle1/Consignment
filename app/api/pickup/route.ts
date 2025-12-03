import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken } from '@/lib/auth'
import { createPickupSchema } from '@/lib/validators'

// GET - List pickup requests
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const where = user.role === 'CUSTOMER'
      ? { customerId: user.id }
      : {} // Staff can see all

    const pickups = await prisma.pickupRequest.findMany({
      where,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        shipment: {
          select: {
            trackingNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ pickups })
  } catch (error) {
    console.error('Fetch pickups error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pickup requests' },
      { status: 500 }
    )
  }
}

// POST - Create pickup request
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPickupSchema.parse(body)

    const pickup = await prisma.pickupRequest.create({
      data: {
        customerId: user.id,
        ...validatedData,
        preferredDate: new Date(validatedData.preferredDate),
      },
    })

    return NextResponse.json({ pickup }, { status: 201 })
  } catch (error: any) {
    console.error('Create pickup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create pickup request' },
      { status: 400 }
    )
  }
}
