import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recurrent = searchParams.get('recurrent') === 'true';

    // Si on demande les tâches récurrentes, on filtre
    if (recurrent) {
      const tasks = await prisma.kanbanTask.findMany({
        where: {
          board: {
            projectId: params.id,
          },
          recurrenceType: {
            not: 'NONE',
          },
        },
        include: {
          status: true,
          group: true,
          assignedTo: true,
        },
      });
      return NextResponse.json(tasks);
    }

    // Sinon on renvoie toutes les tâches
    const tasks = await prisma.kanbanTask.findMany({
      where: {
        board: {
          projectId: params.id,
        },
      },
      include: {
        status: true,
        group: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Trouver le board par défaut du projet
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        projectId: params.id,
      },
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    const task = await prisma.kanbanTask.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        plannedEndAt: body.plannedEndAt ? new Date(body.plannedEndAt) : null,
        boardId: body.boardId || board.id,
        statusId: body.statusId,
        groupId: body.groupId,
        assignedToId: body.assignedToId,
        recurrenceType: body.recurrenceType || 'NONE',
        lastRecurrence: body.lastRecurrence ? new Date(body.lastRecurrence) : null,
      },
      include: {
        status: true,
        group: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const taskId = request.url.split('/').pop();

    const task = await prisma.kanbanTask.update({
      where: {
        id: taskId,
      },
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        plannedEndAt: body.plannedEndAt ? new Date(body.plannedEndAt) : undefined,
        statusId: body.statusId,
        groupId: body.groupId,
        assignedToId: body.assignedToId,
        durationSeconds: body.durationSeconds,
        recurrenceType: body.recurrenceType,
        lastRecurrence: body.lastRecurrence ? new Date(body.lastRecurrence) : undefined,
      },
      include: {
        status: true,
        group: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 