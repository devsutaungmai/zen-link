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

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      )
    }

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

    if (!employee.pin) {
      return NextResponse.json(
        { error: 'PIN not set. Please contact your administrator.' },
        { status: 401 }
      )
    }

    if (employee.pin !== pin) {
      return NextResponse.json(
        { error: 'Invalid employee ID or PIN' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      {
        id: employee.id,
        userId: employee.userId,
        employeeId: employee.id,
        role: 'EMPLOYEE',
        type: 'employee'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '12h' }
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
