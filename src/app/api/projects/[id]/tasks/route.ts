import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const tasks = await prisma.kanbanTask.findMany({
      where: {
        board: {
          project: {
            id: params.id,
          },
        },
        actualEndAt: {
          not: null,
          gte: startDate,
        },
      },
      include: {
        status: true,
      },
      orderBy: {
        actualEndAt: 'desc',
      },
    });

    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status.name,
      completedAt: task.actualEndAt,
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 