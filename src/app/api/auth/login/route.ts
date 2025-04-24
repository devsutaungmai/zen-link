import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      employee: {
        include: {
          department: true,
          employeeGroup: true
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const passwordValid = await bcrypt.compare(password, user.password)
  if (!passwordValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role,
      employeeId: user.employee?.id,
      department: user.employee?.department?.name,
    }, 
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  const res = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      employee: user.employee ? {
        id: user.employee.id,
        employeeNo: user.employee.employeeNo,
        department: user.employee.department,
        employeeGroup: user.employee.employeeGroup
      } : null
    }
  })

  res.cookies.set(
    'auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'strict'
  })

  console.log('Cookie set:', { token, env: process.env.NODE_ENV });

  return res
}

