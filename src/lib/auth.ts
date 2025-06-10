'use server'

import { PrismaClient } from '@prisma/client'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function getCurrentUser() {
  const store = await cookies() 
  const token = store.get('token')?.value

  if (!token) return null

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as {
      id: string
      role: string
    }

    return await prisma.user.findUnique({
      where: { id: decoded.id },
    })
  } catch (error) {
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Not authorized')
  }
  return user
}
