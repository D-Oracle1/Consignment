import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken } from '@/lib/auth'
import { updateShipmentStatusSchema } from '@/lib/validators'
import { sendShipmentNotification } from '@/lib/utils/notifications'
import { NotificationEvent } from '@prisma/client'

export async function POST(
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

    // Only staff can update status
    if (!['ADMIN', 'WAREHOUSE', 'DRIVER'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = updateShipmentStatusSchema.parse(body)

    // Get current shipment
    const shipment = await prisma.shipment.findUnique({
      where: { id },
    })

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Update shipment status
    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        status: validatedData.status,
        ...(validatedData.status === 'DELIVERED' && {
          actualDelivery: new Date(),
        }),
      },
    })

    // Create event
    await prisma.shipmentEvent.create({
      data: {
        shipmentId: id,
        status: validatedData.status,
        location: validatedData.location,
        notes: validatedData.notes,
        staffId: user.id,
      },
    })

    // Log staff activity
    await prisma.staffActivity.create({
      data: {
        staffId: user.id,
        action: 'updated_shipment_status',
        entityType: 'shipment',
        entityId: id,
        description: `Updated shipment ${shipment.trackingNumber} to ${validatedData.status}`,
        metadata: {
          trackingNumber: shipment.trackingNumber,
          oldStatus: shipment.status,
          newStatus: validatedData.status,
        },
      },
    })

    // Send notifications based on status
    const eventMap: Record<string, NotificationEvent> = {
      RECEIVED: NotificationEvent.PACKAGE_RECEIVED,
      IN_TRANSIT: NotificationEvent.IN_TRANSIT,
      OUT_FOR_DELIVERY: NotificationEvent.OUT_FOR_DELIVERY,
      DELIVERED: NotificationEvent.DELIVERED,
      FAILED: NotificationEvent.FAILED_DELIVERY,
    }

    if (eventMap[validatedData.status]) {
      await sendShipmentNotification(
        id,
        eventMap[validatedData.status],
        validatedData.status === 'OUT_FOR_DELIVERY' || validatedData.status === 'DELIVERED'
      )
    }

    return NextResponse.json({ shipment: updatedShipment })
  } catch (error: any) {
    console.error('Update status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: 400 }
    )
  }
}
