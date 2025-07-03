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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params

    // Check if the exchange exists and is pending
    const exchange = await prisma.shiftExchange.findUnique({
      where: { id: params.id },
      include: { fromEmployee: true }
    })

    if (!exchange) {
      return NextResponse.json(
        { error: 'Exchange request not found' },
        { status: 404 }
      )
    }

    if (exchange.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending exchange requests' },
        { status: 400 }
      )
    }

    // Delete the exchange request
    await prisma.shiftExchange.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Exchange request cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling shift exchange:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
