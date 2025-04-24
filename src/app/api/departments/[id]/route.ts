import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        employees: true,
        _count: {
          select: { employees: true }
        }
      }
    })
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch department' }, 
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

    const data = {
      name: rawData.name,
      number: rawData.number,
      address: rawData.address,
      address2: rawData.address2,
      postCode: rawData.postCode,
      city: rawData.city,
      phone: rawData.phone,
      country: rawData.country,
    }
    
    const department = await prisma.department.update({
      where: { id },
      data,
      include: {
        employees: true,
        _count: {
          select: { employees: true }
        }
      }
    })
    
    return NextResponse.json(department)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update department' }, 
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
    await prisma.department.delete({
      where: { id }
    })
    return NextResponse.json(
      { message: 'Department deleted successfully' }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete department' }, 
      { status: 500 }
    )
  }
}
