import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shiftId = params.id
    const { newEmployeeId } = await req.json()
    
    console.log(`Attempting to exchange shift ${shiftId} to employee ${newEmployeeId}`)

    const newEmployee = await prisma.employee.findUnique({
      where: { id: newEmployeeId }
    })
    if (!newEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { employee: true }
    })
    if (!shift || !shift.employeeId) {
      return NextResponse.json({ error: 'Shift or current employee not found' }, { status: 404 })
    }

    // Create the exchange record
    const exchange = await prisma.shiftExchange.create({
      data: {
        shiftId,
        fromEmployeeId: shift.employeeId,
        toEmployeeId: newEmployee.id,
        exchangedAt: new Date(),
      }
    })
    
    console.log('Created shift exchange record:', exchange.id)

    // Update the shift to the new employee
    await prisma.shift.update({
      where: { id: shiftId },
      data: { employeeId: newEmployee.id }
    })

    return NextResponse.json({ success: true, exchangeId: exchange.id })
  } catch (error) {
    console.error('Error in shift exchange:', error)
    return NextResponse.json({ 
      error: 'Failed to exchange shift', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}