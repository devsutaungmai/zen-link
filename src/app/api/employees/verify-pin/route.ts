import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { employeeId, pin } = await request.json()

    if (!employeeId || !pin) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and PIN are required' },
        { status: 400 }
      )
    }

    // Find the employee by ID (employeeId refers to the Employee record, not User)
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeNo: true,
        user: {
          select: {
            id: true,
            pin: true,
            role: true
          }
        }
      }
    })

    console.log('Found employee:', employee ? 'Yes' : 'No')
    if (employee) {
      console.log('Employee user data:', {
        hasPin: !!employee.user.pin,
        role: employee.user.role,
        userId: employee.user.id
      })
    }

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // The employee should have their own User record, but let's be flexible with roles
    // Accept employees regardless of their user role, as long as they have a PIN
    if (!employee.user.pin) {
      return NextResponse.json(
        { success: false, error: 'PIN not set for this employee. Contact your manager.' },
        { status: 400 }
      )
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, employee.user.pin)

    if (!isPinValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid PIN' },
        { status: 401 }
      )
    }

    // Return success with employee info (without PIN)
    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeNo: employee.employeeNo
      }
    })

  } catch (error) {
    console.error('Error verifying PIN:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
