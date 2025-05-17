import { create } from "zustand";

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  plannedEndAt?: string;
  actualEndAt?: string;
  status: { id: string; name: string; color: string; order: number };
  durationSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface KanbanTasksState {
  tasks: KanbanTask[];
  setTasks: (tasks: KanbanTask[]) => void;
  updateTask: (task: KanbanTask) => void;
}

export const useKanbanTasks = create<KanbanTasksState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
    })),
})); 