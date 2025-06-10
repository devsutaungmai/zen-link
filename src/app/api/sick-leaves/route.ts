import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    let whereClause: any = {}

    if (user.role === 'EMPLOYEE') {
      const employee = await prisma.employee.findFirst({
        where: { userId: user.id }
      })
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }
      whereClause.employeeId = employee.id
    } else if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      // Admins can see all sick leaves in their business
      if (employeeId) {
        whereClause.employeeId = employeeId
      }
      // Filter by business through employee relationship
      whereClause.employee = {
        user: {
          businessId: user.businessId
        }
      }
    }

    const sickLeaves = await prisma.sickLeave.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNo: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sickLeaves)
  } catch (error) {
    console.error('Error fetching sick leaves:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const data = await request.json()

    const { employeeId, startDate, endDate, reason, document } = data

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    let targetEmployeeId = employeeId

    if (user.role === 'EMPLOYEE') {
      const employee = await prisma.employee.findFirst({
        where: { userId: user.id }
      })
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }
      targetEmployeeId = employee.id
    } else if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      if (!employeeId) {
        return NextResponse.json(
          { error: 'Employee ID is required' },
          { status: 400 }
        )
      }
    
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          user: {
            businessId: user.businessId
          }
        }
      })
      
      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found or access denied' },
          { status: 403 }
        )
      }
    }

    const sickLeave = await prisma.sickLeave.create({
      data: {
        employeeId: targetEmployeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
        document: document || null,
        approved: user.role === 'ADMIN' || user.role === 'MANAGER', // Auto-approve if created by admin
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNo: true,
          }
        }
      }
    })

    return NextResponse.json(sickLeave, { status: 201 })
  } catch (error) {
    console.error('Error creating sick leave:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
