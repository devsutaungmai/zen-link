import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessName = searchParams.get('businessName')

    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      )
    }

    const trimmedName = businessName.trim()

    const business = await prisma.business.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: trimmedName,
              mode: 'insensitive'
            }
          },
          {
            AND: [
              {
                name: {
                  contains: trimmedName,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    const employees = await prisma.employee.findMany({
      where: {
        user: {
          businessId: business.id
        }
      },
      include: {
        department: {
          select: {
            name: true
          }
        },
        employeeGroup: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}
