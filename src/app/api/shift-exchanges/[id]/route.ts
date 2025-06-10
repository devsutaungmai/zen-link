import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const user = await requireAuth()
    const { status } = await request.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const exchange = await prisma.shiftExchange.update({
      where: { id: params.id },
      data: {
        status,
        approvedAt: new Date(),
        approvedBy: user.id,
      },
      include: {
        shift: true,
        fromEmployee: true,
        toEmployee: true,
      },
    })


    if (status === 'APPROVED') {
      await prisma.shift.update({
        where: { id: exchange.shiftId },
        data: {
          employeeId: exchange.toEmployeeId,
        },
      })
    }

    return NextResponse.json(exchange)
  } catch (error) {
    console.error('Error updating shift exchange:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
