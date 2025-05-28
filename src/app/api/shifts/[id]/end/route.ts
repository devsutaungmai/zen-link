import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const shiftId = id
    const now = new Date()
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5)

    // Update the shift with end time
    const updatedShift = await prisma.shift.update({
      where: {
        id: shiftId
      },
      data: {
        endTime: currentTime
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
      }
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    console.error('Failed to end shift:', error)
    return NextResponse.json(
      { error: 'Failed to end shift' },
      { status: 500 }
    )
  }
}
