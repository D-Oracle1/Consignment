import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken } from '@/lib/auth'

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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    if (user.role === 'CUSTOMER') {
      // Customer dashboard stats
      const [totalShipments, inTransit, delivered] = await Promise.all([
        prisma.shipment.count({
          where: {
            OR: [{ senderId: user.id }, { receiverId: user.id }],
          },
        }),
        prisma.shipment.count({
          where: {
            OR: [{ senderId: user.id }, { receiverId: user.id }],
            status: { in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
          },
        }),
        prisma.shipment.count({
          where: {
            OR: [{ senderId: user.id }, { receiverId: user.id }],
            status: 'DELIVERED',
          },
        }),
      ])

      return NextResponse.json({
        totalShipments,
        inTransit,
        delivered,
      })
    }

    // Admin/Staff dashboard stats
    const [
      totalShipmentsToday,
      totalShipmentsMonth,
      pendingShipments,
      inTransitShipments,
      deliveredToday,
      deliveredMonth,
      revenue,
      revenueMonth,
      statusBreakdown,
    ] = await Promise.all([
      prisma.shipment.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.shipment.count({
        where: { createdAt: { gte: thisMonth } },
      }),
      prisma.shipment.count({
        where: { status: 'PENDING' },
      }),
      prisma.shipment.count({
        where: { status: { in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'] } },
      }),
      prisma.shipment.count({
        where: {
          status: 'DELIVERED',
          actualDelivery: { gte: today },
        },
      }),
      prisma.shipment.count({
        where: {
          status: 'DELIVERED',
          actualDelivery: { gte: thisMonth },
        },
      }),
      prisma.shipment.aggregate({
        where: {
          isPaid: true,
          createdAt: { gte: today },
        },
        _sum: { actualCost: true },
      }),
      prisma.shipment.aggregate({
        where: {
          isPaid: true,
          createdAt: { gte: thisMonth },
        },
        _sum: { actualCost: true },
      }),
      prisma.shipment.groupBy({
        by: ['status'],
        _count: true,
      }),
    ])

    return NextResponse.json({
      today: {
        shipments: totalShipmentsToday,
        delivered: deliveredToday,
        revenue: revenue._sum.actualCost || 0,
      },
      month: {
        shipments: totalShipmentsMonth,
        delivered: deliveredMonth,
        revenue: revenueMonth._sum.actualCost || 0,
      },
      current: {
        pending: pendingShipments,
        inTransit: inTransitShipments,
      },
      statusBreakdown,
    })
  } catch (error) {
    console.error('Fetch stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
