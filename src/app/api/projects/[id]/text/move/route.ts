import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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
    const { documentId, targetFolderId } = body;

    // Vérifier que le document existe et appartient au projet
    const document = await prisma.richTextContent.findFirst({
      where: {
        id: documentId,
        projectId,
      },
    });

    if (!document) {
      return new NextResponse("Document not found or does not belong to this project", { status: 404 });
    }

    // Si targetFolderId est null, on déplace le document à la racine
    // Sinon, on vérifie que le dossier cible existe et appartient au projet
    if (targetFolderId) {
      const targetFolder = await prisma.textFolder.findFirst({
        where: {
          id: targetFolderId,
          projectId,
        },
      });

      if (!targetFolder) {
        return new NextResponse("Target folder not found or does not belong to this project", { status: 404 });
      }
    }

    // Déplacer le document
    const updatedDocument = await prisma.richTextContent.update({
      where: {
        id: documentId,
      },
      data: {
        folderId: targetFolderId,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Error moving document:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 