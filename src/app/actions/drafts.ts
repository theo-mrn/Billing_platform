'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getDrafts(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const boards = await prisma.excalidrawBoard.findMany({
    where: {
      projectId,
    },
    include: {
      folder: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return boards;
}

export async function moveDraft(projectId: string, draftId: string, targetFolderId: string | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  // Vérifier que le draft existe et appartient au projet
  const draft = await prisma.excalidrawBoard.findFirst({
    where: {
      id: draftId,
      projectId,
    },
  });

  if (!draft) {
    throw new Error("Draft non trouvé ou n'appartient pas à ce projet");
  }

  // Si targetFolderId est fourni, vérifier que le dossier existe et appartient au projet
  if (targetFolderId) {
    const targetFolder = await prisma.textFolder.findFirst({
      where: {
        id: targetFolderId,
        projectId,
      },
    });

    if (!targetFolder) {
      throw new Error("Dossier cible non trouvé ou n'appartient pas à ce projet");
    }
  }

  // Déplacer le draft
  const updatedDraft = await prisma.excalidrawBoard.update({
    where: {
      id: draftId,
    },
    data: {
      folderId: targetFolderId,
    },
  });

  return updatedDraft;
}

export async function deleteDraft(projectId: string, draftId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  // Vérifier que le draft existe et appartient au projet
  const draft = await prisma.excalidrawBoard.findFirst({
    where: {
      id: draftId,
      projectId,
    },
  });

  if (!draft) {
    throw new Error("Draft non trouvé ou n'appartient pas à ce projet");
  }

  await prisma.excalidrawBoard.delete({
    where: {
      id: draftId,
    },
  });

  return true;
} 