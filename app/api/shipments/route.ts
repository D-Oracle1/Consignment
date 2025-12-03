import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken } from '@/lib/auth'
import { createShipmentSchema } from '@/lib/validators'
import { generateTrackingNumber } from '@/lib/utils'
import { calculateShippingCost, getEstimatedDeliveryDate } from '@/lib/utils/pricing'
import { sendShipmentNotification } from '@/lib/utils/notifications'
import { NotificationEvent } from '@prisma/client'

// GET - List shipments
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

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on role
    const where = user.role === 'CUSTOMER'
      ? {
          OR: [
            { senderId: user.id },
            { receiverId: user.id },
          ],
        }
      : {} // Admin/Staff can see all

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          events: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ])

    return NextResponse.json({
      shipments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Fetch shipments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    )
  }
}

// POST - Create shipment
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
    const validatedData = createShipmentSchema.parse(body)

    // Calculate shipping cost
    const estimatedCost = await calculateShippingCost({
      weight: validatedData.weight,
      length: validatedData.length,
      width: validatedData.width,
      height: validatedData.height,
      originZip: validatedData.senderZip,
      destinationZip: validatedData.receiverZip,
      category: validatedData.category,
    })

    // Calculate estimated delivery
    const estimatedDelivery = await getEstimatedDeliveryDate(
      validatedData.senderZip,
      validatedData.receiverZip
    )

    // Generate tracking number
    const trackingNumber = generateTrackingNumber()

    // Check if receiver is a registered user
    const receiverUser = validatedData.receiverEmail
      ? await prisma.user.findUnique({
          where: { email: validatedData.receiverEmail },
        })
      : null

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        senderId: user.id,
        receiverId: receiverUser?.id,
        ...validatedData,
        estimatedCost,
        estimatedDelivery,
        events: {
          create: {
            status: 'PENDING',
            location: `${validatedData.senderCity}, ${validatedData.senderState}`,
            notes: 'Shipment created',
          },
        },
      },
      include: {
        events: true,
      },
    })

    // Send notification
    await sendShipmentNotification(
      shipment.id,
      NotificationEvent.PACKAGE_RECEIVED
    )

    return NextResponse.json({ shipment }, { status: 201 })
  } catch (error: any) {
    console.error('Create shipment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create shipment' },
      { status: 400 }
    )
  }
}
