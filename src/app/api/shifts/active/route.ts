import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the employee record for the current user
    const employee = await prisma.employee.findFirst({
      where: {
        userId: currentUser.id
      }
    })

    if (!employee) {
      return NextResponse.json({ activeShift: null })
    }

    // Find active shift (no end time and today's date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const activeShift = await prisma.shift.findFirst({
      where: {
        employeeId: employee.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        },
        endTime: null // No end time means it's still active
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        employeeGroup: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ activeShift })
  } catch (error) {
    console.error('Failed to fetch active shift:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active shift' },
      { status: 500 }
    )
  }
}
