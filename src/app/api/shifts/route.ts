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
    const data = await req.json();

    const startHour = parseInt(data.startTime.split(':')[0], 10);
    const endHour = parseInt(data.endTime.split(':')[0], 10);

    if (endHour < startHour) {
      // Shift spans across two days
      const nextDay = new Date(data.date);
      nextDay.setDate(nextDay.getDate() + 1);

      const firstPart = {
        ...data,
        date: new Date(data.date), // Convert to Date object
        endTime: '23:59', // First part ends at midnight
      };

      const secondPart = {
        ...data,
        date: nextDay, // Use Date object for the next day
        startTime: '01:00', // Start at midnight
      };

      const [firstShift, secondShift] = await Promise.all([
        prisma.shift.create({ data: firstPart }),
        prisma.shift.create({ data: secondPart }),
      ]);

      return NextResponse.json([firstShift, secondShift]);
    }

    // If the shift does not span across two days, create it as a single shift
    const shift = await prisma.shift.create({
      data: {
        ...data,
        date: new Date(data.date), // Convert to Date object
      },
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error('Failed to create shift:', error);
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    );
  }
}
