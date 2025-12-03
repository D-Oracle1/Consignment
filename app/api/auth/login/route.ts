import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyPassword, generateToken, sanitizeUser } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      )
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role)

    return NextResponse.json({
      user: sanitizeUser(user),
      token,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 400 }
    )
  }
}
