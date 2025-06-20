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
      breakStart: string | null
      breakEnd: string | null
      breakPaid: boolean
      breakDuration: number
    }> = []

    for (const shift of shifts) {
      if (shift.endTime) {
        const hours = calculateShiftHours(shift.startTime, shift.endTime, shift.breakStart, shift.breakEnd, shift.breakPaid || false)
        totalHours += hours
        totalShifts += 1
        
        let breakDuration = 0
        if (shift.breakStart && shift.breakEnd) {
          breakDuration = (shift.breakEnd.getTime() - shift.breakStart.getTime()) / (1000 * 60) // Convert to minutes
        }
        
        shiftDetails.push({
          date: shift.date.toISOString().split('T')[0],
          startTime: shift.startTime,
          endTime: shift.endTime,
          hours: hours,
          breakStart: shift.breakStart ? shift.breakStart.toTimeString().substring(0, 5) : null,
          breakEnd: shift.breakEnd ? shift.breakEnd.toTimeString().substring(0, 5) : null,
          breakPaid: shift.breakPaid || false,
          breakDuration: Math.round(breakDuration),
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

    // Calculate average regular rate from shifts if they have wage values, otherwise use employee group
    let totalWageFromShifts = 0
    let shiftsWithWage = 0
    
    for (const shift of shifts) {
      if (shift.wage && shift.wage > 0) {
        if (shift.wageType === 'HOURLY') {
          totalWageFromShifts += shift.wage
          shiftsWithWage++
        } else if (shift.wageType === 'PER_SHIFT') {
          // Convert per-shift wage to hourly rate
          const shiftHours = shiftDetails.find(detail => 
            detail.date === shift.date.toISOString().split('T')[0]
          )?.hours || regularHoursPerShift
          const hourlyRate = shift.wage / (shiftHours > 0 ? shiftHours : regularHoursPerShift)
          totalWageFromShifts += hourlyRate
          shiftsWithWage++
        }
      }
    }

    if (shiftsWithWage > 0) {
      // Use average rate from shifts that have wage values
      regularRate = totalWageFromShifts / shiftsWithWage
      overtimeRate = regularRate * 1.5 // 1.5x for overtime
    } else if (employee.employeeGroup) {
      // Fall back to employee group rates if no shift wages are available
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
      wageCalculationMethod: shiftsWithWage > 0 ? 'shifts' : 'employeeGroup',
      shiftsWithWage,
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
  breakEnd: Date | null,
  breakPaid: boolean = false
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

  // Subtract break time only if both breakStart and breakEnd are provided AND it's not a paid break
  if (breakStart && breakEnd && !breakPaid) {
    const breakDuration = breakEnd.getTime() - breakStart.getTime()
    const breakMinutes = breakDuration / (1000 * 60) // Convert to minutes
    totalMinutes -= breakMinutes
  }

  // Convert to hours and round to 2 decimal places
  return Math.round((totalMinutes / 60) * 100) / 100
}
