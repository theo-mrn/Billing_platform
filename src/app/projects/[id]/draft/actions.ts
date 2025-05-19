"use server";
import { prisma } from "@/lib/prisma";
import { ExcalidrawData } from "@/types/excalidraw";
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
export async function createBoard(projectId: string, name: string) {
  const initialData: ExcalidrawData = {
    elements: [],
    appState: {
      collaborators: [],
      viewBackgroundColor: "#ffffff",
      currentItemFontFamily: 1,
    },
    files: {}
  };

  const board = await prisma.excalidrawBoard.create({
    data: {
      name,
      data: initialData as unknown as Prisma.InputJsonValue,
      projectId
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