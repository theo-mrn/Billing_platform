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

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this project by checking if they belong to the project's organization
    const project = await prisma.project.findFirst({
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
      // You can include related data here if needed, e.g., organization details
      // include: {
      //   organization: true,
      // }
    });

    if (!project) {
      // Either project doesn't exist or user doesn't have access
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 } 
      );
    }

    return NextResponse.json(project);

  } catch (error) {
    console.error("[PROJECT_GET_BY_ID]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 