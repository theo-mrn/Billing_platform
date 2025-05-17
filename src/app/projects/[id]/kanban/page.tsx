'use client';
 
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/ui/kanban';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DragEndEvent } from '@dnd-kit/core';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { useState, useId, useEffect } from 'react';
import type { FC } from 'react';
import { useParams } from 'next/navigation';
import { KanbanBoard as KanbanBoardType, KanbanStatus, KanbanTask, KanbanGroup, TaskPriority, User } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DurationSelector } from "@/components/ui/DurationSelector";

type KanbanTaskWithRelations = KanbanTask & {
  status: KanbanStatus;
  group?: KanbanGroup | null;
  assignedTo?: User | null;
  durationHours?: number;
  durationMinutes?: number;
};

const formatTimeLeft = (date: Date) => {
  const now = new Date();
  const minutesDiff = differenceInMinutes(date, now);
  const hoursDiff = differenceInHours(date, now);
  const daysDiff = differenceInDays(date, now);

  if (minutesDiff < 60) {
    return `${minutesDiff}m`;
  } else if (hoursDiff < 24) {
    return `${hoursDiff}h`;
  } else {
    return `${daysDiff}d`;
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'HIGH':
      return 'text-red-500 bg-red-100 dark:bg-red-900/20';
    case 'MEDIUM':
      return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
    case 'LOW':
      return 'text-green-500 bg-green-100 dark:bg-green-900/20';
  }
};

// Fonction utilitaire pour convertir les heures et minutes en secondes
const timeToSeconds = (hours: number, minutes: number) => {
  return (hours * 60 * 60) + (minutes * 60);
};

// Fonction utilitaire pour convertir les secondes en heures et minutes
const secondsToTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return { hours, minutes };
};

const KanbanPage: FC = () => {
  const params = useParams();
  const projectId = params.id as string;
  
  const [board, setBoard] = useState<KanbanBoardType | null>(null);
  const [statuses, setStatuses] = useState<KanbanStatus[]>([]);
  const [tasks, setTasks] = useState<KanbanTaskWithRelations[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTaskWithRelations | null>(null);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    groupName: string;
    plannedEndAt: Date;
    priority: TaskPriority;
    recurrenceType: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
    durationSeconds: number;
    durationHours: number;
    durationMinutes: number;
  }>({
    title: '',
    description: '',
    groupName: '',
    plannedEndAt: new Date(),
    priority: 'MEDIUM',
    recurrenceType: 'NONE',
    durationSeconds: 0,
    durationHours: 0,
    durationMinutes: 0,
  });
  const timeInputId = useId();

  useEffect(() => {
    const fetchKanbanData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/kanban`);
        const data = await response.json();
        
        if (data.board) {
          setBoard(data.board);
          setStatuses(data.statuses);
          setTasks(data.tasks);
        }
      } catch (error) {
        console.error('Failed to fetch kanban data:', error);
      }
    };

    fetchKanbanData();
  }, [projectId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const status = statuses.find((status) => status.name === over.id);
    if (!status) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/kanban/tasks/${active.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statusId: status.id,
        }),
      });

      if (response.ok) {
        setTasks(tasks.map((task) => 
          task.id === active.id ? { ...task, status } : task
        ));
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !board) return;

    const status = statuses.find(s => s.name === selectedColumn);
    if (!status) return;

    const totalDurationSeconds = timeToSeconds(newTask.durationHours, newTask.durationMinutes);

    try {
      const response = await fetch(`/api/projects/${projectId}/kanban/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          plannedEndAt: newTask.plannedEndAt,
          boardId: board.id,
          statusId: status.id,
          recurrenceType: newTask.recurrenceType,
          durationSeconds: totalDurationSeconds,
        }),
      });

      if (response.ok) {
        const newTaskData = await response.json();
        setTasks([...tasks, { ...newTaskData, status }]);
        setNewTask({
          title: '',
          description: '',
          groupName: '',
          plannedEndAt: new Date(),
          priority: 'MEDIUM',
          recurrenceType: 'NONE',
          durationSeconds: 0,
          durationHours: 0,
          durationMinutes: 0,
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const totalDurationSeconds = timeToSeconds(
      parseInt(editingTask.durationHours?.toString() || '0'),
      parseInt(editingTask.durationMinutes?.toString() || '0')
    );

    try {
      const response = await fetch(`/api/projects/${projectId}/kanban/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingTask,
          durationSeconds: totalDurationSeconds,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => task.id === updatedTask.id ? { ...task, ...updatedTask } : task));
        setIsDetailsDialogOpen(false);
        setEditingTask(null);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // const handleTaskClick = (task: KanbanTaskWithRelations) => {
  //   const { hours, minutes } = secondsToTime(task.durationSeconds || 0);
  //   setEditingTask({
  //     ...task,
  //     durationHours: hours,
  //     durationMinutes: minutes,
  //   });
  //   setIsEditMode(false);
  //   setIsDetailsDialogOpen(true);
  // };

  if (!board || !statuses.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="min-h-[150px]"
                placeholder="Task description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupName">Group</Label>
              <Input
                id="groupName"
                value={newTask.groupName}
                onChange={(e) => setNewTask({ ...newTask, groupName: e.target.value })}
                placeholder="Add group"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newTask.plannedEndAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.plannedEndAt ? format(newTask.plannedEndAt, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0"
                  align="start"
                  side="bottom"
                >
                  <div className="rounded-lg">
                    <Calendar
                      mode="single"
                      selected={newTask.plannedEndAt}
                      onSelect={(date) => date && setNewTask({ ...newTask, plannedEndAt: date })}
                      className="p-2"
                      initialFocus
                      fromDate={new Date()}
                    />
                    <div className="border-t border-border p-3">
                      <div className="flex items-center gap-3">
                        <Label htmlFor={timeInputId} className="text-xs">
                          Enter time
                        </Label>
                        <div className="relative grow">
                          <input
                            type="time"
                            id={timeInputId}
                            value={format(newTask.plannedEndAt, "HH:mm")}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(newTask.plannedEndAt);
                              newDate.setHours(hours, minutes);
                              setNewTask({ ...newTask, plannedEndAt: newDate });
                            }}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ps-9"
                          />
                          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                            <Clock size={16} strokeWidth={2} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex gap-2">
                {(['HIGH', 'MEDIUM', 'LOW'] as const).map((priority) => (
                  <Button
                    key={priority}
                    variant={newTask.priority === priority ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1",
                      newTask.priority === priority && getPriorityColor(priority)
                    )}
                    onClick={() => setNewTask({ ...newTask, priority })}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Récurrence</Label>
              <Select
                value={newTask.recurrenceType}
                onValueChange={(value: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY") => 
                  setNewTask({ ...newTask, recurrenceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la récurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Aucune</SelectItem>
                  <SelectItem value="DAILY">Quotidienne</SelectItem>
                  <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                  <SelectItem value="MONTHLY">Mensuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durée estimée</Label>
              <DurationSelector
                hours={newTask.durationHours}
                minutes={newTask.durationMinutes}
                onDurationChange={(hours, minutes) => {
                  setNewTask({
                    ...newTask,
                    durationHours: hours,
                    durationMinutes: minutes,
                    durationSeconds: timeToSeconds(hours, minutes)
                  });
                }}
              />
            </div>
            <Button onClick={handleAddTask} className="w-full">
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => {
        setIsDetailsDialogOpen(open);
        if (!open) {
          setIsEditMode(false);
          setEditingTask(null);
        }
      }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{isEditMode ? "Edit Task" : "Task Details"}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-medium">Title</Label>
                {isEditMode ? (
                  <Input
                    id="edit-title"
                    value={editingTask?.title || ''}
                    onChange={(e) => setEditingTask(prev => prev ? {
                      ...prev,
                      title: e.target.value
                    } : null)}
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 rounded-md bg-muted/50 text-sm">{editingTask?.title}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                {isEditMode ? (
                  <Textarea
                    id="edit-description"
                    value={editingTask?.description || ''}
                    onChange={(e) => setEditingTask(prev => prev ? {
                      ...prev,
                      description: e.target.value
                    } : null)}
                    className="min-h-[100px]"
                  />
                ) : (
                  <div className="p-3 rounded-md bg-muted/50 text-sm min-h-[60px]">{editingTask?.description}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Date</Label>
                {isEditMode ? (
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingTask?.plannedEndAt && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingTask?.plannedEndAt ? format(new Date(editingTask.plannedEndAt), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-0" 
                      align="start"
                      side="bottom"
                    >
                      <div className="rounded-lg">
                        <Calendar
                          mode="single"
                          selected={editingTask?.plannedEndAt ? new Date(editingTask.plannedEndAt) : undefined}
                          onSelect={(date) => {
                            if (!date || !editingTask) return;
                            setEditingTask({
                              ...editingTask,
                              plannedEndAt: date
                            });
                          }}
                          className="p-2"
                          initialFocus
                          fromDate={new Date()}
                        />
                        <div className="border-t border-border p-3">
                          <div className="flex items-center gap-3">
                            <Label htmlFor={timeInputId} className="text-xs">
                              Enter time
                            </Label>
                            <div className="relative grow">
                              <input
                                type="time"
                                value={editingTask?.plannedEndAt ? format(new Date(editingTask.plannedEndAt), "HH:mm") : "12:00"}
                                onChange={(e) => {
                                  if (!editingTask?.plannedEndAt) return;
                                  
                                  const [hours, minutes] = e.target.value.split(':').map(Number);
                                  const newDate = new Date(editingTask.plannedEndAt);
                                  newDate.setHours(hours, minutes);
                                  
                                  setEditingTask({
                                    ...editingTask,
                                    plannedEndAt: newDate
                                  });
                                }}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ps-9"
                              />
                              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                                <Clock size={16} strokeWidth={2} aria-hidden="true" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="p-3 rounded-md bg-muted/50 text-sm">
                    {editingTask?.plannedEndAt ? format(new Date(editingTask.plannedEndAt), "PPP 'at' HH:mm") : "No date set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                {isEditMode ? (
                  <div className="flex gap-2">
                    {statuses.map((status) => (
                      <Button
                        key={status.id}
                        variant={editingTask?.statusId === status.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (!editingTask) return;
                          setEditingTask({
                            ...editingTask,
                            statusId: status.id,
                            status
                          });
                        }}
                      >
                        {status.name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-muted/50 text-sm">{editingTask?.status.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority</Label>
                {isEditMode ? (
                  <div className="flex gap-2">
                    {(['HIGH', 'MEDIUM', 'LOW'] as const).map((priority) => (
                      <Button
                        key={priority}
                        variant={editingTask?.priority === priority ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "flex-1",
                          editingTask?.priority === priority && getPriorityColor(priority)
                        )}
                        onClick={() => {
                          if (!editingTask) return;
                          setEditingTask({
                            ...editingTask,
                            priority
                          });
                        }}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-muted/50 text-sm flex items-center gap-2">
                    <Badge className={cn("text-xs h-6 px-2", getPriorityColor(editingTask?.priority || 'MEDIUM'))}>
                      {editingTask?.priority.toLowerCase()}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Récurrence</Label>
                {isEditMode ? (
                  <Select
                    value={editingTask?.recurrenceType}
                    onValueChange={(value: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY") => {
                      if (!editingTask) return;
                      setEditingTask({
                        ...editingTask,
                        recurrenceType: value
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {editingTask?.recurrenceType === 'NONE' ? 'Aucune' :
                         editingTask?.recurrenceType === 'DAILY' ? 'Quotidienne' :
                         editingTask?.recurrenceType === 'WEEKLY' ? 'Hebdomadaire' : 'Mensuelle'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Aucune</SelectItem>
                      <SelectItem value="DAILY">Quotidienne</SelectItem>
                      <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                      <SelectItem value="MONTHLY">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-md bg-muted/50 text-sm flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {editingTask?.recurrenceType === 'NONE' ? 'Aucune' :
                       editingTask?.recurrenceType === 'DAILY' ? 'Quotidienne' :
                       editingTask?.recurrenceType === 'WEEKLY' ? 'Hebdomadaire' : 'Mensuelle'}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Durée estimée</Label>
                {isEditMode ? (
                  <DurationSelector
                    hours={editingTask?.durationHours || 0}
                    minutes={editingTask?.durationMinutes || 0}
                    onDurationChange={(hours, minutes) => {
                      if (!editingTask) return;
                      setEditingTask({
                        ...editingTask,
                        durationHours: hours,
                        durationMinutes: minutes,
                        durationSeconds: timeToSeconds(hours, minutes)
                      });
                    }}
                  />
                ) : (
                  <div className="p-3 rounded-md bg-muted/50 text-sm">
                    {(() => {
                      const { hours, minutes } = secondsToTime(editingTask?.durationSeconds || 0);
                      return `${hours}h ${minutes}min`;
                    })()}
                  </div>
                )}
              </div>
            </div>

            {isEditMode ? (
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateTask}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    setEditingTask(null);
                  }} 
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="flex-1"
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <KanbanProvider onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map((status) => (
            <KanbanBoard key={status.name} id={status.name} className="rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <KanbanHeader name={status.name} color={status.color} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedColumn(status.name);
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <KanbanCards>
                {tasks
                  .filter((task) => task.status.id === status.id)
                  .map((task, index) => (
                    <KanbanCard
                      key={task.id}
                      id={task.id}
                      name={task.title}
                      parent={status.name}
                      index={index}
                      className="mb-3"
                    >
                      <Card 
                        className="p-4 min-h-16"
                        onDoubleClick={() => {
                          const { hours, minutes } = secondsToTime(task.durationSeconds || 0);
                          setEditingTask({
                            ...task,
                            durationHours: hours,
                            durationMinutes: minutes,
                          });
                          setIsEditMode(false);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm leading-tight flex-1">{task.title}</h3>
                            <div className="flex gap-1.5">
                              <Badge variant="outline" className={cn("text-xs h-6 px-2 shrink-0", getPriorityColor(task.priority))}>
                                {task.priority.toLowerCase()}
                              </Badge>
                              {task.plannedEndAt && (
                                <Badge variant="outline" className="text-xs h-6 px-2 shrink-0">
                                  {formatTimeLeft(new Date(task.plannedEndAt))}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {task.description && (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="text-xs h-6">
                                {task.description}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </Card>
                    </KanbanCard>
                  ))}
              </KanbanCards>
            </KanbanBoard>
          ))}
        </div>
      </KanbanProvider>
    </div>
  );
};

export default KanbanPage;