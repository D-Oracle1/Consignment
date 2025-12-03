import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET - Get shipment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = params

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Check permissions
    if (
      user.role === 'CUSTOMER' &&
      shipment.senderId !== user.id &&
      shipment.receiverId !== user.id
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ shipment })
  } catch (error) {
    console.error('Fetch shipment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipment' },
      { status: 500 }
    )
  }
}

// DELETE - Delete shipment (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = params

    await prisma.shipment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Shipment deleted successfully' })
  } catch (error) {
    console.error('Delete shipment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    )
  }
}
