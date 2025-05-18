import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get all text contents for a project
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const projectId = params.id;

    const textContents = await prisma.richTextContent.findMany({
      where: {
        projectId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(textContents);
  } catch (error) {
    console.error("Error fetching text contents:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Create or update text content
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const projectId = params.id;
    const body = await request.json();
    const { id, title, content } = body;

    // Si un ID est fourni, on met à jour le contenu existant
    if (id) {
      const updatedContent = await prisma.richTextContent.update({
        where: { id },
        data: {
          title,
          content,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json(updatedContent);
    }

    // Sinon, on crée un nouveau contenu
    const newContent = await prisma.richTextContent.create({
      data: {
        title,
        content,
        projectId,
      },
    });

    return NextResponse.json(newContent);
  } catch (error) {
    console.error("Error saving text content:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 