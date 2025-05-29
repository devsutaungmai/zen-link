import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  try {
    const { employeeId, pin } = await req.json()

    if (!employeeId || !pin) {
      return NextResponse.json(
        { error: 'Employee ID and PIN are required' },
        { status: 400 }
      )
    }

    // Find employee by employeeNo (employee ID)
    const employee = await prisma.employee.findUnique({
      where: { employeeNo: employeeId },
      include: {
        user: true,
        department: true,
        employeeGroup: true,
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid employee ID or PIN' },
        { status: 401 }
      )
    }

    // Check if employee has a PIN set
    if (!employee.pin) {
      return NextResponse.json(
        { error: 'PIN not set. Please contact your administrator.' },
        { status: 401 }
      )
    }

    // Verify PIN (simple string comparison for now, you might want to hash PINs in production)
    if (employee.pin !== pin) {
      return NextResponse.json(
        { error: 'Invalid employee ID or PIN' },
        { status: 401 }
      )
    }

    // Create JWT token with employee information
    const token = jwt.sign(
      {
        id: employee.id,
        userId: employee.userId,
        employeeId: employee.id,
        role: 'EMPLOYEE',
        type: 'employee'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '12h' } // Shorter expiry for employee sessions
    )

    const res = NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeNo: employee.employeeNo,
        department: employee.department.name,
        employeeGroup: employee.employeeGroup?.name,
      },
    })

    // Set the token as an HTTP-only cookie
    res.cookies.set('employee_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12, // 12 hours
      path: '/',
      sameSite: 'strict',
    })

    return res
  } catch (error: any) {
    console.error('Employee login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
