import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      }
    })
    return NextResponse.json(departments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const department = await prisma.department.create({
      data
    })
    return NextResponse.json(department)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
  }
}