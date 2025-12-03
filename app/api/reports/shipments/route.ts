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

    if (!user || !['ADMIN', 'WAREHOUSE'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const where = {
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    const [shipments, statusCounts, totalRevenue] = await Promise.all([
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
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shipment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.shipment.aggregate({
        where: {
          ...where,
          isPaid: true,
        },
        _sum: {
          actualCost: true,
        },
      }),
    ])

    return NextResponse.json({
      shipments,
      statistics: {
        statusCounts,
        totalRevenue: totalRevenue._sum.actualCost || 0,
        totalShipments: shipments.length,
      },
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
