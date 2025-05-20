"use server";
import { prisma } from "@/lib/prisma";
import { ExcalidrawData, AppState } from "@/types/excalidraw";
import { Prisma } from "@prisma/client";

function convertToExcalidrawData(data: Prisma.JsonValue): ExcalidrawData {
  return data as unknown as ExcalidrawData;
}

// Lister les boards d'un projet
export async function getBoards(projectId: string) {
  const boards = await prisma.excalidrawBoard.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  
  return boards.map(board => ({
    ...board,
    data: convertToExcalidrawData(board.data)
  }));
}

// Créer un board
export async function createBoard(projectId: string, name: string, folderId: string | null = null) {
  // Utiliser des valeurs par défaut sans référence à Excalidraw
  const initialData: ExcalidrawData = {
    elements: [],
    appState: {
      theme: "light", // Au lieu de THEME.LIGHT
      viewBackgroundColor: "#ffffff",
      currentItemFontFamily: 1,
      name: "",
    } as AppState,
    files: {}
  };

  const board = await prisma.excalidrawBoard.create({
    data: {
      name,
      data: initialData as unknown as Prisma.InputJsonValue,
      projectId,
      folderId
    },
  });

  return {
    ...board,
    data: convertToExcalidrawData(board.data)
  };
}

// Mettre à jour un board
export async function updateBoard(boardId: string, data: ExcalidrawData) {
  const board = await prisma.excalidrawBoard.update({
    where: { id: boardId },
    data: {
      data: data as unknown as Prisma.InputJsonValue
    },
  });

  return {
    ...board,
    data: convertToExcalidrawData(board.data)
  };
} 