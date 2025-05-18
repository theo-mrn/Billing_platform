'use server';

import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createPomodoroSession(data: {
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'WORK' | 'BREAK';
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    revalidatePath('/pomodoro');
    return { pomodoroSession };
  } catch (error) {
    console.error('[CREATE_POMODORO_SESSION]', error);
    throw new Error('Failed to create pomodoro session');
  }
} 