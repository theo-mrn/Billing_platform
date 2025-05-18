import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; folderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: projectId, folderId } = await context.params;

    // Vérifier que le dossier existe et appartient au projet
    const folder = await prisma.textFolder.findFirst({
      where: { 
        id: folderId,
        projectId: projectId
      },
      include: {
        documents: true,
        children: true,
      },
    });

    if (!folder) {
      return new NextResponse("Folder not found or does not belong to this project", { status: 404 });
    }

    if (folder.documents.length > 0 || folder.children.length > 0) {
      return new NextResponse(
        "Cannot delete non-empty folder. Please move or delete its contents first.",
        { status: 400 }
      );
    }

    await prisma.textFolder.delete({
      where: { id: folderId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 