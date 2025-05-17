import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const projectId = params.id;

    // Verify user has access to this project
    const userOrganization = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!userOrganization) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      priority,
      plannedEndAt,
      boardId,
      statusId,
      groupId,
      assignedToId,
    } = body;

    if (!title || !boardId || !statusId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the board belongs to this project
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        id: boardId,
        projectId,
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    // Create the task
    const task = await prisma.kanbanTask.create({
      data: {
        title,
        description,
        priority,
        plannedEndAt: plannedEndAt ? new Date(plannedEndAt) : null,
        boardId,
        statusId,
        groupId,
        assignedToId,
      },
      include: {
        status: true,
        group: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 