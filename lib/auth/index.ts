import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db/prisma'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = verifyToken(token)
  if (!decoded) return null

  return prisma.user.findUnique({
    where: { id: decoded.userId },
  })
}

export function sanitizeUser(user: User) {
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}
