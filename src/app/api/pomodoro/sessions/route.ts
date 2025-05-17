import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { startTime, endTime, duration, type } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        type,
      },
    });

    return NextResponse.json(pomodoroSession);
  } catch (error) {
    console.error('Failed to create pomodoro session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await prisma.pomodoroSession.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startDate,
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch pomodoro sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 