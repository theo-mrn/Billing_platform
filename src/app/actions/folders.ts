'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getFolders(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const folders = await prisma.textFolder.findMany({
    where: {
      projectId,
      parentId: null, // Only root folders
    },
    include: {
      documents: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return folders;
}

export async function createFolder(projectId: string, name: string, parentId?: string) {
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
  });

  return folder;
}

export async function deleteFolder(projectId: string, folderId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  // Vérifier que le dossier appartient au projet
  const folder = await prisma.textFolder.findFirst({
    where: {
      id: folderId,
      projectId,
    },
  });

  if (!folder) {
    throw new Error("Dossier non trouvé ou n'appartient pas à ce projet");
  }

  await prisma.textFolder.delete({
    where: {
      id: folderId,
    },
  });

  return true;
} 