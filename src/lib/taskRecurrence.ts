import { KanbanTask } from '@/store/kanbanTasks';
import { addDays, addWeeks, addMonths, isAfter, startOfDay } from 'date-fns';

export async function handleTaskRecurrence(task: KanbanTask) {
  if (task.recurrenceType === 'NONE') return null;
  if (!task.lastRecurrence) return null;

  const today = startOfDay(new Date());
  const lastRecurrence = startOfDay(new Date(task.lastRecurrence));
  let shouldRecur = false;
  let nextDate = lastRecurrence;

  switch (task.recurrenceType) {
    case 'DAILY':
      nextDate = addDays(lastRecurrence, 1);
      shouldRecur = isAfter(today, nextDate);
      break;
    case 'WEEKLY':
      nextDate = addWeeks(lastRecurrence, 1);
      shouldRecur = isAfter(today, nextDate);
      break;
    case 'MONTHLY':
      nextDate = addMonths(lastRecurrence, 1);
      shouldRecur = isAfter(today, nextDate);
      break;
  }

  if (!shouldRecur) return null;

  // Créer une nouvelle instance de la tâche
  const newTask: Omit<KanbanTask, 'id' | 'status'> = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    boardId: task.boardId,
    statusId: task.statusId,
    groupId: task.groupId,
    assignedToId: task.assignedToId,
    recurrenceType: task.recurrenceType,
    durationSeconds: task.durationSeconds,
    plannedStartAt: task.plannedStartAt,
    plannedEndAt: task.plannedEndAt,
    lastRecurrence: new Date(),
  };

  return newTask;
}

export async function checkAndCreateRecurringTasks(projectId: string) {
  try {
    // Récupérer toutes les tâches récurrentes du projet
    const response = await fetch(`/api/projects/${projectId}/kanban/tasks?recurrent=true`);
    const tasks: KanbanTask[] = await response.json();

    // Pour chaque tâche récurrente
    for (const task of tasks) {
      const newTaskData = await handleTaskRecurrence(task);
      if (newTaskData) {
        // Créer la nouvelle instance de la tâche
        await fetch(`/api/projects/${projectId}/kanban/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTaskData),
        });

        // Mettre à jour la dernière récurrence de la tâche originale
        await fetch(`/api/projects/${projectId}/kanban/tasks/${task.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lastRecurrence: new Date(),
          }),
        });
      }
    }
  } catch (error) {
    console.error('Error checking recurring tasks:', error);
  }
} 