import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { employeeId, payrollPeriodId } = await req.json()

    if (!employeeId || !payrollPeriodId) {
      return NextResponse.json(
        { error: 'Employee ID and Payroll Period ID are required' },
        { status: 400 }
      )
    }

    const payrollPeriod = await prisma.payrollPeriod.findFirst({
      where: {
        id: payrollPeriodId,
        businessId: currentUser.businessId,
      },
    })

    if (!payrollPeriod) {
      return NextResponse.json(
        { error: 'Payroll period not found' },
        { status: 404 }
      )
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        user: {
          businessId: currentUser.businessId,
        },
      },
      include: {
        employeeGroup: {
          select: {
            hourlyWage: true,
            wagePerShift: true,
            defaultWageType: true,
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    const shifts = await prisma.shift.findMany({
      where: {
        employeeId: employeeId,
        date: {
          gte: new Date(payrollPeriod.startDate),
          lte: new Date(payrollPeriod.endDate),
        },
        approved: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    let totalHours = 0
    let totalShifts = 0
    const shiftDetails: Array<{
      date: string
      startTime: string
      endTime: string | null
      hours: number
    }> = []

    for (const shift of shifts) {
      if (shift.endTime) {
        const hours = calculateShiftHours(shift.startTime, shift.endTime, shift.breakStart, shift.breakEnd)
        totalHours += hours
        totalShifts += 1
        
        shiftDetails.push({
          date: shift.date.toISOString().split('T')[0],
          startTime: shift.startTime,
          endTime: shift.endTime,
          hours: hours,
        })
      }
    }

    // Calculate regular and overtime hours (assuming 8 hours per day is regular, rest is overtime)
    const regularHoursPerShift = 8
    let regularHours = 0
    let overtimeHours = 0

    for (const detail of shiftDetails) {
      if (detail.hours <= regularHoursPerShift) {
        regularHours += detail.hours
      } else {
        regularHours += regularHoursPerShift
        overtimeHours += (detail.hours - regularHoursPerShift)
      }
    }

    // Determine wage rates from employee group or default values
    let regularRate = 0
    let overtimeRate = 0

    if (employee.employeeGroup) {
      if (employee.employeeGroup.defaultWageType === 'HOURLY') {
        regularRate = employee.employeeGroup.hourlyWage
        overtimeRate = employee.employeeGroup.hourlyWage * 1.5 // 1.5x for overtime
      } else {
        regularRate = employee.employeeGroup.wagePerShift / regularHoursPerShift
        overtimeRate = regularRate * 1.5
      }
    }

    return NextResponse.json({
      totalHours,
      totalShifts,
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      regularRate,
      overtimeRate,
      shiftDetails,
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeNo: employee.employeeNo,
      },
      payrollPeriod: {
        name: payrollPeriod.name,
        startDate: payrollPeriod.startDate,
        endDate: payrollPeriod.endDate,
      },
    })

  } catch (error) {
    console.error('Error calculating hours:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateShiftHours(
  startTime: string,
  endTime: string,
  breakStart: Date | null,
  breakEnd: Date | null
): number {
  const getMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const startMinutes = getMinutes(startTime)
  let endMinutes = getMinutes(endTime)

  // Handle shifts that cross midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60 // Add 24 hours
  }

  let totalMinutes = endMinutes - startMinutes

  // Subtract break time if both breakStart and breakEnd are provided
  if (breakStart && breakEnd) {
    const breakDuration = breakEnd.getTime() - breakStart.getTime()
    const breakMinutes = breakDuration / (1000 * 60) // Convert to minutes
    totalMinutes -= breakMinutes
  }

  // Convert to hours and round to 2 decimal places
  return Math.round((totalMinutes / 60) * 100) / 100
}
