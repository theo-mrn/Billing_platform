import { create } from "zustand";
import { KanbanStatus, TaskPriority } from "@prisma/client";

export type KanbanTask = {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  plannedStartAt?: Date | null;
  plannedEndAt?: Date | null;
  actualStartAt?: Date | null;
  actualEndAt?: Date | null;
  durationSeconds?: number | null;
  boardId: string;
  statusId: string;
  groupId?: string | null;
  assignedToId?: string | null;
  status: KanbanStatus;
  createdAt?: Date;
  updatedAt?: Date;
  recurrenceType: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
  lastRecurrence?: Date | null;
};

type KanbanTasksStore = {
  tasks: KanbanTask[];
  setTasks: (tasks: KanbanTask[]) => void;
  updateTask: (task: KanbanTask) => void;
};

export const useKanbanTasks = create<KanbanTasksStore>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      ),
    })),
})); 