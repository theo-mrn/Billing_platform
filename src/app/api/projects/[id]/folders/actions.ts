'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { TextFolder } from "@/types/documents";
import { convertFolder } from "@/types/documents";

export async function getFolders(projectId: string): Promise<TextFolder[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const folders = await prisma.textFolder.findMany({
    where: {
      projectId,
      parentId: null, // Get only root folders
    },
    include: {
      documents: {
        select: {
          id: true,
          title: true,
          content: true,
          projectId: true,
          createdAt: true,
          updatedAt: true,
          folderId: true,
        }
      },
      children: {
        include: {
          documents: {
            select: {
              id: true,
              title: true,
              content: true,
              projectId: true,
              createdAt: true,
              updatedAt: true,
              folderId: true,
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              projectId: true,
              parentId: true,
              createdAt: true,
              updatedAt: true,
            }
          }
        }
      },
    },
  });

  return folders.map(convertFolder);
}

export async function createFolder(projectId: string, name: string, parentId?: string): Promise<TextFolder> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const folder = await prisma.textFolder.create({
    data: {
      name,
      projectId,
      parentId: parentId || null,
    },
    include: {
      documents: {
        select: {
          id: true,
          title: true,
          content: true,
          projectId: true,
          createdAt: true,
          updatedAt: true,
          folderId: true,
        }
      },
      children: {
        include: {
          documents: {
            select: {
              id: true,
              title: true,
              content: true,
              projectId: true,
              createdAt: true,
              updatedAt: true,
              folderId: true,
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              projectId: true,
              parentId: true,
              createdAt: true,
              updatedAt: true,
            }
          }
        }
      },
    },
  });

  const result = convertFolder(folder);
  revalidatePath(`/projects/${projectId}`);
  return result;
}

export async function deleteFolder(projectId: string, folderId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  // Vérifier que le dossier existe et appartient au projet
  const folder = await prisma.textFolder.findFirst({
    where: { 
      id: folderId,
      projectId
    },
    include: {
      documents: true,
      children: true,
    },
  });

  if (!folder) {
    throw new Error("Dossier non trouvé ou n'appartient pas à ce projet");
  }

  if (folder.documents.length > 0 || folder.children.length > 0) {
    throw new Error("Impossible de supprimer un dossier non vide. Veuillez déplacer ou supprimer son contenu d'abord.");
  }

  await prisma.textFolder.delete({
    where: { id: folderId },
  });

  revalidatePath(`/projects/${projectId}`);
} 