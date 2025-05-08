import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const employeeId = searchParams.get('employeeId')

    let whereCondition: any = {}
    
    if (startDate && endDate) {
      whereCondition.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    if (employeeId) {
      whereCondition.employeeId = employeeId
    }
    
    const shifts = await prisma.shift.findMany({
      where: whereCondition,
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
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Failed to fetch shifts:', error)
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
