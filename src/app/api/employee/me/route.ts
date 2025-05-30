import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('employee_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify the employee token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      employeeId: string
      type: string
    }

    if (decoded.type !== 'employee') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      )
    }

    // Get employee information
    const employee = await prisma.employee.findUnique({
      where: { id: decoded.employeeId },
      include: {
        department: true,
        employeeGroup: true,
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeNo: employee.employeeNo,
      department: employee.department.name,
      departmentId: employee.departmentId,
      employeeGroup: employee.employeeGroup?.name,
      employeeGroupId: employee.employeeGroupId,
    })
  } catch (error: any) {
    console.error('Error fetching employee data:', error)
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
