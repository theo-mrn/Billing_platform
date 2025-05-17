import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    // Get the first kanban board for this project
    // In the future, we might want to support multiple boards per project
    const board = await prisma.kanbanBoard.findFirst({
      where: {
        projectId,
      },
    });

    if (!board) {
      // Create a default board if none exists
      const newBoard = await prisma.kanbanBoard.create({
        data: {
          name: "Main Board",
          projectId,
          statuses: {
            create: [
              { name: "Planned", color: "muted", order: 0 },
              { name: "In Progress", color: "muted", order: 1 },
              { name: "Done", color: "muted", order: 2 },
            ],
          },
        },
        include: {
          statuses: true,
        },
      });

      return NextResponse.json({
        board: newBoard,
        statuses: newBoard.statuses,
        tasks: [],
      });
    }

    // Get all statuses and tasks for this board
    const [statuses, tasks] = await Promise.all([
      prisma.kanbanStatus.findMany({
        where: {
          boardId: board.id,
        },
        orderBy: {
          order: 'asc',
        },
      }),
      prisma.kanbanTask.findMany({
        where: {
          boardId: board.id,
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
      }),
    ]);

    return NextResponse.json({
      board,
      statuses,
      tasks,
    });
  } catch (error) {
    console.error("[KANBAN_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 