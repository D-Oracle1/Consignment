import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getUserFromToken } from '@/lib/auth'

// PATCH - Update pickup request (staff only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user || !['ADMIN', 'WAREHOUSE', 'DRIVER'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()

    const pickup = await prisma.pickupRequest.update({
      where: { id },
      data: {
        ...body,
        ...(body.status === 'COMPLETED' && { completedDate: new Date() }),
      },
    })

    return NextResponse.json({ pickup })
  } catch (error) {
    console.error('Update pickup error:', error)
    return NextResponse.json(
      { error: 'Failed to update pickup request' },
      { status: 500 }
    )
  }
}
