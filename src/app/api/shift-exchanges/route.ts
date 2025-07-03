import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromShiftId, toEmployeeId, type, requestReason } = body

    // Validate required fields
    if (!fromShiftId || !toEmployeeId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['SWAP', 'HANDOVER'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid exchange type. Must be SWAP or HANDOVER' },
        { status: 400 }
      )
    }

    // Check if the shift exists
    const shift = await prisma.shift.findUnique({
      where: { id: fromShiftId },
      include: { employee: true }
    })

    if (!shift) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // Check if employee exists
    const toEmployee = await prisma.employee.findUnique({ 
      where: { id: toEmployeeId } 
    })

    if (!toEmployee) {
      return NextResponse.json(
        { error: 'Target employee not found' },
        { status: 404 }
      )
    }

    // Check for existing pending exchange for the same shift
    const existingExchange = await prisma.shiftExchange.findFirst({
      where: {
        shiftId: fromShiftId,
        status: 'PENDING'
      }
    })

    if (existingExchange) {
      return NextResponse.json(
        { error: 'There is already a pending exchange request for this shift' },
        { status: 409 }
      )
    }

    // Create the shift exchange
    const shiftExchange = await prisma.shiftExchange.create({
      data: {
        shiftId: fromShiftId,
        fromEmployeeId: shift.employeeId!,
        toEmployeeId,
        type,
        status: 'PENDING',
        reason: requestReason || `${type} request`,
        requestedAt: new Date()
      },
      include: {
        shift: {
          include: { employee: true }
        },
        fromEmployee: true,
        toEmployee: true
      }
    })

    return NextResponse.json(shiftExchange, { status: 201 })
  } catch (error) {
    console.error('Error creating shift exchange:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (employeeId) {
      whereClause.OR = [
        { fromEmployeeId: employeeId },
        { toEmployeeId: employeeId }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    const exchanges = await prisma.shiftExchange.findMany({
      where: whereClause,
      include: {
        shift: {
          include: { 
            employee: {
              include: {
                department: true
              }
            }
          }
        },
        fromEmployee: {
          include: {
            department: true
          }
        },
        toEmployee: {
          include: {
            department: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    return NextResponse.json(exchanges)
  } catch (error) {
    console.error('Error fetching shift exchanges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
