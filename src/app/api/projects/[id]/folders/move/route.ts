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
    const { folderId, targetFolderId } = body;

    // Vérifier que le dossier à déplacer existe et appartient au projet
    const folder = await prisma.textFolder.findFirst({
      where: {
        id: folderId,
        projectId,
      },
    });

    if (!folder) {
      return new NextResponse("Folder not found or does not belong to this project", { status: 404 });
    }

    // Si targetFolderId est null, on déplace le dossier à la racine
    // Sinon, on vérifie que le dossier cible existe et appartient au projet
    if (targetFolderId) {
      // Vérifier que le dossier cible n'est pas le dossier à déplacer
      if (targetFolderId === folderId) {
        return new NextResponse("Cannot move folder into itself", { status: 400 });
      }

      const targetFolder = await prisma.textFolder.findFirst({
        where: {
          id: targetFolderId,
          projectId,
        },
      });

      if (!targetFolder) {
        return new NextResponse("Target folder not found or does not belong to this project", { status: 404 });
      }

      // Vérifier que le dossier cible n'est pas un sous-dossier du dossier à déplacer
      const isSubfolder = await checkIfSubfolder(folderId, targetFolderId);
      if (isSubfolder) {
        return new NextResponse("Cannot move folder into its own subfolder", { status: 400 });
      }
    }

    // Déplacer le dossier
    const updatedFolder = await prisma.textFolder.update({
      where: {
        id: folderId,
      },
      data: {
        parentId: targetFolderId,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Error moving folder:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Fonction récursive pour vérifier si targetFolderId est un sous-dossier de folderId
async function checkIfSubfolder(folderId: string, targetFolderId: string): Promise<boolean> {
  const subfolders = await prisma.textFolder.findMany({
    where: {
      parentId: folderId,
    },
    select: {
      id: true,
    },
  });

  for (const subfolder of subfolders) {
    if (subfolder.id === targetFolderId) {
      return true;
    }
    const isSubfolderRecursive = await checkIfSubfolder(subfolder.id, targetFolderId);
    if (isSubfolderRecursive) {
      return true;
    }
  }

  return false;
} 