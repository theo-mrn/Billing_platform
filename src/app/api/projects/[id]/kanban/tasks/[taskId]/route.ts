import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id: projectId, taskId } = params;

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
      statusId,
      groupId,
      assignedToId,
      durationSeconds,
    } = body;

    // Verify the task belongs to a board in this project
    const task = await prisma.kanbanTask.findFirst({
      where: {
        id: taskId,
        board: {
          projectId,
        },
      },
      include: {
        status: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Get the new status if it's being updated
    let newStatus = null;
    if (statusId && statusId !== task.statusId) {
      newStatus = await prisma.kanbanStatus.findUnique({
        where: { id: statusId },
      });
    }

    // Determine if we need to update actualStartAt or actualEndAt
    let actualStartAt = task.actualStartAt;
    let actualEndAt = task.actualEndAt;

    if (newStatus) {
      if (newStatus.name === "Done" && !task.actualEndAt) {
        actualEndAt = new Date();
        
        // Create a task completion record
        await prisma.taskCompletion.create({
          data: {
            taskId: task.id,
            completedAt: actualEndAt,
          },
        });
      } else if (newStatus.name === "In Progress" && !task.actualStartAt) {
        actualStartAt = new Date();
      } else if (newStatus.name === "Planned") {
        actualEndAt = null;
      }
    }

    // Update the task
    const updatedTask = await prisma.kanbanTask.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description,
        priority,
        plannedEndAt: plannedEndAt ? new Date(plannedEndAt) : null,
        statusId,
        groupId,
        assignedToId,
        durationSeconds,
        actualStartAt,
        actualEndAt,
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id: projectId, taskId } = params;

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

    // Verify the task exists and belongs to this project
    const task = await prisma.kanbanTask.findFirst({
      where: {
        id: taskId,
        board: {
          projectId,
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Delete the task
    await prisma.kanbanTask.delete({
      where: {
        id: taskId,
      },
    });

    // Pour un DELETE réussi, on retourne juste un NextResponse avec status 204
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 