import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()
    
    const employeeGroups = await prisma.employeeGroup.findMany({
      where: {
        businessId: user.businessId
      },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    })
    return NextResponse.json(employeeGroups)
  } catch (error: any) {
    console.error('Detailed error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch employee groups',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const data = await request.json()
    
    if (!data.name || !data.salaryCode) {
      return NextResponse.json(
        { error: 'Name and salary code are required' },
        { status: 400 }
      )
    }

    const employeeGroup = await prisma.employeeGroup.create({
      data: {
        name: data.name,
        hourlyWage: data.hourlyWage || 0,
        wagePerShift: data.wagePerShift || 0,
        defaultWageType: data.defaultWageType || 'HOURLY',
        salaryCode: data.salaryCode,
        businessId: user.businessId,
      }
    })

    return NextResponse.json(employeeGroup)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create employee group', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
