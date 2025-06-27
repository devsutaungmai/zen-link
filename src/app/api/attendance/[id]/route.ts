import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { punchOutTime } = await request.json()

    // Find the attendance record
    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        shift: true
      }
    })

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    if (attendance.punchOutTime) {
      return NextResponse.json({ 
        error: 'Employee is already punched out' 
      }, { status: 400 })
    }

    // Update attendance record with punch out time
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        punchOutTime: punchOutTime ? new Date(punchOutTime) : new Date()
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNo: true
          }
        },
        shift: true
      }
    })

    // If there's a shift, update its status to COMPLETED
    if (attendance.shiftId) {
      await prisma.shift.update({
        where: { id: attendance.shiftId },
        data: { status: 'COMPLETED' }
      })
    }

    return NextResponse.json({ 
      message: 'Punched out successfully',
      attendance: updatedAttendance 
    })

  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json({ 
      error: 'Failed to punch out' 
    }, { status: 500 })
  }
}
