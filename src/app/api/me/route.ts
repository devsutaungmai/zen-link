import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // First check for admin/manager authentication
    const user = await getCurrentUser()
    
    if (user) {
      return NextResponse.json(user)
    }
    
    // If no admin user, check for employee authentication
    const cookieStore = await cookies()
    const employeeToken = cookieStore.get('employee_token')?.value
    
    if (!employeeToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify employee token
    const decoded = jwt.verify(employeeToken, process.env.JWT_SECRET!) as {
      id: string
      userId: string
      employeeId: string
      role: string
      type: string
    }
    
    if (decoded.type !== 'employee') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
    }
    
    // Get employee data
    const employee = await prisma.employee.findUnique({
      where: { id: decoded.employeeId },
      include: {
        user: true,
        department: true,
        employeeGroup: true,
      },
    })
    
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    
    // Return employee data in a format similar to user data
    return NextResponse.json({
      id: employee.user.id,
      email: employee.user.email,
      firstName: employee.user.firstName,
      lastName: employee.user.lastName,
      role: employee.user.role,
      businessId: employee.user.businessId,
      // Additional employee-specific data
      employee: {
        id: employee.id,
        employeeNo: employee.employeeNo,
        department: employee.department.name,
        departmentId: employee.departmentId,
        employeeGroup: employee.employeeGroup?.name,
        employeeGroupId: employee.employeeGroupId,
      }
    })
    
  } catch (error) {
    console.error('Error in /api/me:', error)
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
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
