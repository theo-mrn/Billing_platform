'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TextDocument } from "@/types/documents";
import { convertDocument } from "@/types/documents";

export async function getDocuments(projectId: string): Promise<TextDocument[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const documents = await prisma.richTextContent.findMany({
    where: {
      projectId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return documents.map(convertDocument);
}

export async function moveDocument(projectId: string, documentId: string, targetFolderId: string | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  // Vérifier que le document existe et appartient au projet
  const document = await prisma.richTextContent.findFirst({
    where: {
      id: documentId,
      projectId,
    },
  });

  if (!document) {
    throw new Error("Document non trouvé ou n'appartient pas à ce projet");
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

  // Déplacer le document
  const updatedDocument = await prisma.richTextContent.update({
    where: {
      id: documentId,
    },
    data: {
      folderId: targetFolderId,
    },
  });

  return convertDocument(updatedDocument);
} 