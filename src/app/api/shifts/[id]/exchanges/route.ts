import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shiftId = params.id
    
    const exchanges = await prisma.shiftExchange.findMany({
      where: { shiftId },
      include: {
        fromEmployee: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        toEmployee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        exchangedAt: 'desc'
      }
    })
    
    return NextResponse.json(exchanges)
  } catch (error) {
    console.error('Error fetching shift exchanges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shift exchanges' },
      { status: 500 }
    )
  }
}