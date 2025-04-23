import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const employeeGroup = await prisma.employeeGroup.findUnique({
      where: { id },
      include: {
        employees: true,
        _count: {
          select: { employees: true }
        }
      }
    })
    
    if (!employeeGroup) {
      return NextResponse.json(
        { error: 'Employee group not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(employeeGroup)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee group' }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const rawData = await request.json()

    // Validate required fields
    if (!rawData.name || !rawData.salaryCode) {
      return NextResponse.json(
        { error: 'Name and salary code are required' },
        { status: 400 }
      )
    }

    const data = {
      name: rawData.name,
      hourlyWage: parseFloat(rawData.hourlyWage) || 0,
      wagePerShift: parseFloat(rawData.wagePerShift) || 0,
      defaultWageType: rawData.defaultWageType,
      salaryCode: rawData.salaryCode,
    }
    
    const employeeGroup = await prisma.employeeGroup.update({
      where: { id },
      data,
      include: {
        employees: true,
        _count: {
          select: { employees: true }
        }
      }
    })
    
    return NextResponse.json(employeeGroup)
  } catch (error: any) {
    console.error('Update error:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Employee group with this name or salary code already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update employee group' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    
    // Check if employee group has any employees first
    const employeeGroup = await prisma.employeeGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    })
    
    if (!employeeGroup) {
      return NextResponse.json(
        { error: 'Employee group not found' },
        { status: 404 }
      )
    }
    
    if (employeeGroup._count.employees > 0) {
      return NextResponse.json(
        { error: 'Cannot delete employee group with assigned employees' },
        { status: 400 }
      )
    }
    
    await prisma.employeeGroup.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { message: 'Employee group deleted successfully' }
    )
  } catch (error: any) {
    console.error('Delete error:', error)
    
    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete employee group with assigned employees' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete employee group' }, 
      { status: 500 }
    )
  }
}
