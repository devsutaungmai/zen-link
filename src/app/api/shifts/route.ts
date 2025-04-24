import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      include: {
        employee: true,
        employeeGroup: true
      },
      orderBy: {
        date: 'asc'
      }
    })
    return NextResponse.json(shifts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const shift = await prisma.shift.create({
      data: {
        ...data,
        // Convert string dates to DateTime objects if needed
        date: data.date ? new Date(data.date) : undefined,
        breakStart: data.breakStart ? new Date(data.breakStart) : undefined,
        breakEnd: data.breakEnd ? new Date(data.breakEnd) : undefined
      },
      include: {
        employee: true,
        employeeGroup: true
      }
    })
    return NextResponse.json(shift)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    )
  }
}
