import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    const user = await requireAuth()
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { pin } = await request.json()

    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 digits' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Hash the PIN before storing it
    const hashedPin = await bcrypt.hash(pin, 10)

    await prisma.user.update({
      where: { id: employee.userId },
      data: { pin: hashedPin }
    })

    return NextResponse.json({ 
      success: true,
      message: 'PIN updated successfully'
    })

  } catch (error) {
    console.error('Error updating PIN:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
