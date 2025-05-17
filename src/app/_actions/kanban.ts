'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TaskPriority } from "@prisma/client";

export type CreateKanbanBoardInput = {
  name: string;
  description?: string;
  projectId: string;
};

export type CreateKanbanTaskInput = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  plannedStartAt?: Date;
  plannedEndAt?: Date;
  boardId: string;
  statusId: string;
  groupId?: string;
  assignedToId?: string;
};

export type UpdateKanbanTaskInput = {
  id: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  plannedStartAt?: Date;
  plannedEndAt?: Date;
  statusId?: string;
  groupId?: string;
  assignedToId?: string;
};

// Création d'un nouveau tableau Kanban
export async function createKanbanBoard(input: CreateKanbanBoardInput) {
  try {
    const board = await prisma.kanbanBoard.create({
      data: {
        name: input.name,
        description: input.description,
        projectId: input.projectId,
        // Création des statuts par défaut
        statuses: {
          create: [
            { name: "À faire", color: "gray", order: 0 },
            { name: "En cours", color: "blue", order: 1 },
            { name: "Terminé", color: "green", order: 2 },
          ],
        },
      },
      include: {
        statuses: true,
      },
    });

    revalidatePath(`/projects/${input.projectId}/kanban`);
    return board;
  } catch (error) {
    console.error("Erreur lors de la création du tableau Kanban:", error);
    throw new Error("Impossible de créer le tableau Kanban");
  }
}

// Création d'une nouvelle tâche
export async function createKanbanTask(input: CreateKanbanTaskInput) {
  try {
    const task = await prisma.kanbanTask.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority || "MEDIUM",
        plannedStartAt: input.plannedStartAt,
        plannedEndAt: input.plannedEndAt,
        boardId: input.boardId,
        statusId: input.statusId,
        groupId: input.groupId,
        assignedToId: input.assignedToId,
      },
    });

    revalidatePath(`/projects/${task.boardId}/kanban`);
    return task;
  } catch (error) {
    console.error("Erreur lors de la création de la tâche:", error);
    throw new Error("Impossible de créer la tâche");
  }
}

// Mise à jour d'une tâche
export async function updateKanbanTask(input: UpdateKanbanTaskInput) {
  try {
    const currentTask = await prisma.kanbanTask.findUnique({
      where: { id: input.id },
      include: { status: true },
    });

    if (!currentTask) {
      throw new Error("Tâche non trouvée");
    }

    // Gestion des dates de début et fin réelles
    let actualStartAt = currentTask.actualStartAt;
    let actualEndAt = currentTask.actualEndAt;

    if (input.statusId) {
      const newStatus = await prisma.kanbanStatus.findUnique({
        where: { id: input.statusId },
      });

      if (newStatus) {
        // Si la tâche passe en "En cours"
        if (newStatus.name === "En cours" && !actualStartAt) {
          actualStartAt = new Date();
        }
        // Si la tâche passe en "Terminé"
        else if (newStatus.name === "Terminé" && !actualEndAt) {
          actualEndAt = new Date();
        }
        // Si la tâche revient à un état précédent
        else if (newStatus.name !== "Terminé") {
          actualEndAt = null;
        }
      }
    }

    const task = await prisma.kanbanTask.update({
      where: { id: input.id },
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        plannedStartAt: input.plannedStartAt,
        plannedEndAt: input.plannedEndAt,
        statusId: input.statusId,
        groupId: input.groupId,
        assignedToId: input.assignedToId,
        actualStartAt,
        actualEndAt,
      },
    });

    revalidatePath(`/projects/${task.boardId}/kanban`);
    return task;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error);
    throw new Error("Impossible de mettre à jour la tâche");
  }
}

// Suppression d'une tâche
export async function deleteKanbanTask(taskId: string) {
  try {
    const task = await prisma.kanbanTask.delete({
      where: { id: taskId },
    });

    revalidatePath(`/projects/${task.boardId}/kanban`);
    return task;
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error);
    throw new Error("Impossible de supprimer la tâche");
  }
}

// Récupération d'un tableau Kanban avec toutes ses données
export async function getKanbanBoard(boardId: string) {
  try {
    return await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
      include: {
        tasks: {
          include: {
            status: true,
            group: true,
            assignedTo: true,
          },
        },
        statuses: {
          orderBy: { order: 'asc' },
        },
        groups: true,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du tableau Kanban:", error);
    throw new Error("Impossible de récupérer le tableau Kanban");
  }
}

// Récupération de tous les tableaux Kanban d'un projet
export async function getProjectKanbanBoards(projectId: string) {
  try {
    return await prisma.kanbanBoard.findMany({
      where: { projectId },
      include: {
        tasks: {
          include: {
            status: true,
            group: true,
            assignedTo: true,
          },
        },
        statuses: {
          orderBy: { order: 'asc' },
        },
        groups: true,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tableaux Kanban:", error);
    throw new Error("Impossible de récupérer les tableaux Kanban");
  }
} 