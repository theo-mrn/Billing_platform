import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, Pause, Pencil, Eye, EyeOff, Info, AlertTriangle, CircleCheck, Minus, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { useKanbanTasks, KanbanTask } from "@/store/kanbanTasks";
import { checkAndCreateRecurringTasks } from '@/lib/taskRecurrence';
import { KanbanStatus, TaskPriority } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProjectTodoSidebarProps {
  projectId: string;
}

// Timer component
function TaskTimer({ timeLeft }: { timeLeft: number }) {
  const absTime = Math.abs(timeLeft);
  const hours = Math.floor(absTime / 3600);
  const minutes = Math.floor((absTime % 3600) / 60);
  const seconds = absTime % 60;
  const isNegative = timeLeft < 0;
  return (
    <span className={isNegative ? "font-mono text-xs text-red-500" : "font-mono text-xs text-primary"}>
      {isNegative && '-'}{hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  if (priority === "HIGH") {
    return (
      <span className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
        <AlertTriangle size={14} className="text-white" /> Haute
      </span>
    );
  }
  if (priority === "MEDIUM") {
    return (
      <span className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-semibold">
        <Minus size={14} className="text-yellow-700" /> Moyenne
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
      <CircleCheck size={14} className="text-white" /> Basse
    </span>
  );
}

export default function ProjectTodoSidebar({ projectId }: ProjectTodoSidebarProps) {
  const { tasks, setTasks, updateTask } = useKanbanTasks();
  const [statuses, setStatuses] = useState<KanbanStatus[]>([]);
  const [editTask, setEditTask] = useState<KanbanTask | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    durationSeconds: 0,
    priority: "MEDIUM" as TaskPriority,
    recurrenceType: "NONE" as "NONE" | "DAILY" | "WEEKLY" | "MONTHLY",
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [timerValue, setTimerValue] = useState<number>(0); // temps restant pour la tâche active
  const [showTimers, setShowTimers] = useState<{ [taskId: string]: boolean }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [infoTask, setInfoTask] = useState<KanbanTask | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsTaskId, setCongratsTaskId] = useState<string | null>(null);

  // Démarre le minuteur quand une tâche est active
  useEffect(() => {
    if (!activeTaskId) return;
    const task = tasks.find(t => t.id === activeTaskId);
    if (!task) return;
    setTimerValue(task.durationSeconds || 0);
    timerRef.current = setInterval(() => {
      setTimerValue(prev => prev - 1); // On enlève la condition d'arrêt à 0
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTaskId]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch(`/api/projects/${projectId}/kanban`);
      const data = await res.json();
      setTasks(data.tasks.map((t: KanbanTask) => ({
        ...t,
        durationSeconds: typeof t.durationSeconds === 'number' ? t.durationSeconds : 0,
      })));
      setStatuses(data.statuses);
      
      // Vérifier les tâches récurrentes
      await checkAndCreateRecurringTasks(projectId);
    };
    fetchTasks();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchTasks();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [projectId, setTasks]);

  // Séparation des tâches selon le status
  const inProgressTasks = tasks.filter(t => t.status.name.toLowerCase() === 'in progress');
  const plannedTasks = tasks.filter(t => t.status.name.toLowerCase() === 'planned');
  const doneStatus = statuses.find(s => s.name.toLowerCase().includes("done") || s.name.toLowerCase().includes("terminé"));
  const doneTasks = tasks.filter(t => t.status.id === doneStatus?.id);
  const totalEst = tasks.length;
  const doneCount = doneTasks.length;

  // Ajout de la fonction pour gérer l'XP
  const addXPForTaskCompletion = async () => {
    try {
      await fetch('/api/users/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpAmount: 50 })
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'XP:', error);
    }
  };

  const markAsDone = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setCongratsTaskId(taskId);
    setShowCongrats(true);

    // Si c'est une tâche récurrente, on met à jour sa dernière récurrence
    if (task.recurrenceType !== 'NONE') {
      await fetch(`/api/projects/${projectId}/kanban/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastRecurrence: new Date(),
        }),
      });
      
      // Vérifier si une nouvelle instance doit être créée
      await checkAndCreateRecurringTasks(projectId);
    }
  };

  // Fonction pour sauvegarder le temps restant à la pause ou à la fin
  const handlePauseOrFinish = async (taskId: string, value: number) => {
    setActiveTaskId(null);
    await fetch(`/api/projects/${projectId}/kanban/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationSeconds: value })
    });
    setTasks(tasks.map(t => t.id === taskId ? { ...t, durationSeconds: value } : t));
    updateTask({ ...tasks.find(t => t.id === taskId)!, durationSeconds: value });
  };

  // Ajoute une fonction pour la pause qui ne change pas le status
  const handlePause = async (taskId: string) => {
    if (activeTaskId === taskId) {
      if (timerRef.current) clearInterval(timerRef.current);
      await handlePauseOrFinish(taskId, timerValue);
    }
  };

  // Ajoute la logique Play/Pause
  const setTaskStatus = async (taskId: string, statusName: string) => {
    const status = statuses.find(s => s.name.toLowerCase() === statusName.toLowerCase());
    if (!status) return;
    if (status.name.toLowerCase().includes("progress")) {
      setActiveTaskId(taskId);
    } else {
      if (activeTaskId === taskId) {
        if (timerRef.current) clearInterval(timerRef.current);
        await handlePauseOrFinish(taskId, timerValue);
      }
    }
    await fetch(`/api/projects/${projectId}/kanban/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId: status.id })
    });
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    updateTask({ ...tasks.find(t => t.id === taskId)!, status });
  };

  // Ouvre le modal d'édition avec la tâche sélectionnée
  const openEdit = (task: KanbanTask) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      durationSeconds: task.durationSeconds || 0,
      priority: task.priority,
      recurrenceType: task.recurrenceType,
    });
    setIsEditOpen(true);
  };

  // Soumission de l'édition
  const handleEditSubmit = async () => {
    if (!editTask) return;
    const res = await fetch(`/api/projects/${projectId}/kanban/tasks/${editTask.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description,
        durationSeconds: editForm.durationSeconds,
        priority: editForm.priority,
        recurrenceType: editForm.recurrenceType,
      })
    });
    if (res.ok) {
      const updatedTask = await res.json();
      setTasks(tasks.map(t => t.id === editTask.id ? { ...t, ...updatedTask } : t));
      setIsEditOpen(false);
      setEditTask(null);
      updateTask({ ...editTask, ...updatedTask });
    }
  };

  return (
    <aside className="w-full max-w-xs p-4 bg-background rounded-xl flex flex-col gap-4 border border-border shadow-sm">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg text-foreground">Aujourd&apos;hui</span>
          <span className="text-xs text-muted-foreground">{doneCount}/{totalEst} DONE</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full mb-4">
          <div
            className="h-2 bg-primary rounded-full transition-all"
            style={{ width: `${(doneCount / (totalEst || 1)) * 100}%` }}
          />
        </div>
      </div>
      {/* Bloc Tâches en cours */}
      <Card className="bg-card border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Tâches en cours</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {inProgressTasks.length === 0 && <span className="text-muted-foreground text-sm">Aucune tâche en cours.</span>}
          {inProgressTasks.map((task) => {
            const isActive = activeTaskId === task.id;
            const showTimer = showTimers[task.id] ?? true;
            if (showCongrats && congratsTaskId === task.id) {
              return (
                <div key={task.id} className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg bg-muted border border-border min-h-[180px] animate-fade-in">
                  <div className="text-xl font-bold text-center">Well done! <span role="img" aria-label="explosion">💥</span></div>
                  <div className="w-32 h-32 bg-gray-300 flex items-center justify-center rounded-full text-3xl font-bold text-gray-500">🎉</div>
                  <div className="text-center text-base font-medium">Tu as terminé <b>{task.title}</b> !</div>
                  <Button onClick={async () => {
                    // Passe la tâche en done ici
                    const doneStatus = statuses.find(s => s.name.toLowerCase().includes("done") || s.name.toLowerCase().includes("terminé"));
                    if (!doneStatus) { setShowCongrats(false); setCongratsTaskId(null); return; }
                    await fetch(`/api/projects/${projectId}/kanban/tasks/${task.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ statusId: doneStatus.id })
                    });
                    await addXPForTaskCompletion();
                    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: doneStatus } : t));
                    setShowCongrats(false);
                    setCongratsTaskId(null);
                    updateTask({ ...task, status: doneStatus });
                  }} className="w-full mt-2">Suivant</Button>
                </div>
              );
            }
            return (
              <div
                key={task.id}
                className="group relative flex items-center justify-between gap-2 p-3 rounded-lg bg-muted hover:bg-accent/70 transition cursor-pointer border border-border min-h-[56px]"
              >
                {/* Nom et infos de la tâche, masqués au hover */}
                <div className="flex-1 transition-all duration-200 group-hover:opacity-0 group-hover:pointer-events-none">
                  <span className="font-medium text-sm text-foreground">{task.title}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {showTimer && <TaskTimer timeLeft={isActive ? timerValue : task.durationSeconds || 0} />}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 group-hover:opacity-0 group-hover:pointer-events-none transition-all duration-200">
                  <PriorityBadge priority={task.priority} />
                </div>
                {/* Actions au hover, centrées */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                  {isActive ? (
                    <button
                      title="Pause"
                      onClick={() => handlePause(task.id)}
                      className="bg-muted-foreground/20 hover:bg-muted-foreground/40 text-foreground rounded-full p-2 shadow"
                    >
                      <Pause size={20} />
                    </button>
                  ) : (
                    <button
                      title="Démarrer"
                      onClick={() => setActiveTaskId(task.id)}
                      className="bg-muted-foreground/20 hover:bg-muted-foreground/40 text-foreground rounded-full p-2 shadow"
                    >
                      <Play size={20} />
                    </button>
                  )}
                  <button
                    title="Marquer comme terminé"
                    onClick={async () => {
                      markAsDone(task.id);
                    }}
                    className="bg-primary hover:bg-primary/90 text-background rounded-full p-2 shadow"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    title="Éditer"
                    onClick={() => openEdit(task)}
                    className="bg-muted-foreground/20 hover:bg-muted-foreground/40 text-foreground rounded-full p-2 shadow"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    title={showTimer ? 'Masquer le timer' : 'Afficher le timer'}
                    onClick={e => {
                      e.stopPropagation();
                      setShowTimers(st => ({ ...st, [task.id]: !showTimer }));
                    }}
                    className="bg-muted-foreground/20 hover:bg-muted-foreground/40 text-foreground rounded-full p-2 shadow"
                  >
                    {showTimer ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button
                    title="Informations"
                    onClick={e => {
                      e.stopPropagation();
                      setInfoTask(task);
                      setIsInfoOpen(true);
                    }}
                    className="bg-muted-foreground/20 hover:bg-muted-foreground/40 text-foreground rounded-full p-2 shadow"
                  >
                    <Info size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      {/* Bloc Tâches planifiées */}
      <Card className="bg-card border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Tâches planifiées</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {plannedTasks.length === 0 && <span className="text-muted-foreground text-sm">Aucune tâche planifiée.</span>}
          {plannedTasks.map((task) => {
            if (showCongrats && congratsTaskId === task.id) {
              return (
                <div key={task.id} className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg bg-muted border border-border min-h-[180px] animate-fade-in">
                  <div className="text-xl font-bold text-center">Well done! <span role="img" aria-label="explosion">💥</span></div>
                  <div className="w-32 h-32 bg-gray-300 flex items-center justify-center rounded-full text-3xl font-bold text-gray-500">🎉</div>
                  <div className="text-center text-base font-medium">Tu as terminé <b>{task.title}</b> !</div>
                  <Button onClick={async () => {
                    // Passe la tâche en done ici
                    const doneStatus = statuses.find(s => s.name.toLowerCase().includes("done") || s.name.toLowerCase().includes("terminé"));
                    if (!doneStatus) { setShowCongrats(false); setCongratsTaskId(null); return; }
                    await fetch(`/api/projects/${projectId}/kanban/tasks/${task.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ statusId: doneStatus.id })
                    });
                    await addXPForTaskCompletion();
                    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: doneStatus } : t));
                    setShowCongrats(false);
                    setCongratsTaskId(null);
                    updateTask({ ...task, status: doneStatus });
                  }} className="w-full mt-2">Suivant</Button>
                </div>
              );
            }
            return (
              <div
                key={task.id}
                className="group relative flex items-center justify-between gap-2 p-2 rounded-md bg-muted/60 border border-border min-h-[40px] text-xs"
              >
                <div className="flex-1 truncate text-muted-foreground font-medium transition-all duration-200 group-hover:opacity-0 group-hover:pointer-events-none">
                  {task.title}
                </div>
                {/* Action au hover, centrée */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                  <button
                    title="Commencer"
                    onClick={() => setTaskStatus(task.id, "In Progress")}
                    className="flex items-center gap-2 bg-muted-foreground/10 hover:bg-primary/80 text-primary hover:text-white rounded-full px-3 py-1 transition text-sm font-semibold"
                  >
                      <span>Commencer</span>
                    <Play size={16} />
                  
                  </button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      {/* Bloc Tâches terminées (inchangé) */}
      <Card className="bg-card border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Terminées</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {doneTasks.length === 0 && <span className="text-muted-foreground text-sm">Aucune tâche terminée.</span>}
          {doneTasks.map((task) => (
            <div key={task.id} className="group relative flex items-center justify-between gap-2 p-3 rounded-lg bg-muted text-muted-foreground line-through border border-border min-h-[56px]">
              {/* Nom et infos de la tâche, masqués au hover */}
              <div className="flex-1 transition-all duration-200 group-hover:opacity-0 group-hover:pointer-events-none">
                <span className="font-medium text-sm text-foreground">{task.title}</span>
              </div>
              <div className="flex flex-col items-end gap-2 group-hover:opacity-0 group-hover:pointer-events-none transition-all duration-200">
                <PriorityBadge priority={task.priority} />
              </div>
              {/* Actions au hover, centrées */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                <button
                  title="Restaurer la tâche"
                  onClick={async () => {
                    const plannedStatus = statuses.find(s => s.name.toLowerCase().includes("planned") || (!s.name.toLowerCase().includes("done") && !s.name.toLowerCase().includes("terminé")));
                    if (!plannedStatus) return;
                    await fetch(`/api/projects/${projectId}/kanban/tasks/${task.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ statusId: plannedStatus.id })
                    });
                    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: plannedStatus } : t));
                    updateTask({ ...task, status: plannedStatus });
                  }}
                  className="bg-muted-foreground/20 hover:bg-muted-foreground/40 text-foreground rounded-full p-2 shadow"
                >
                  <Undo2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Dialog d'édition de tâche */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px] p-6">
          <DialogHeader>
            <DialogTitle>Éditer la tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="flex flex-col gap-2 mb-3">
              <Label htmlFor="edit-title" className="mb-1">Titre</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                className="p-3"
              />
            </div>
            <div className="flex flex-col gap-2 mb-3">
              <Label htmlFor="edit-desc" className="mb-1">Description</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                className="p-3 min-h-[80px]"
              />
            </div>
            <div className="flex flex-col gap-2 mb-3">
              <Label htmlFor="edit-duration" className="mb-1">Durée (secondes)</Label>
              <Input
                id="edit-duration"
                type="number"
                min={0}
                value={editForm.durationSeconds}
                onChange={e => setEditForm(f => ({ ...f, durationSeconds: Number(e.target.value) }))}
                className="p-3"
              />
            </div>
            <div className="flex flex-col gap-2 mb-3">
              <Label className="mb-1">Priorité</Label>
              <div className="flex gap-3 mt-1">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                  <Button
                    key={p}
                    type="button"
                    variant={editForm.priority === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditForm(f => ({ ...f, priority: p }))}
                    className="px-4 py-2"
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-3">
              <Label className="mb-1">Récurrence</Label>
              <Select
                value={editForm.recurrenceType}
                onValueChange={(value: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY") => 
                  setEditForm(f => ({ ...f, recurrenceType: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {editForm.recurrenceType === 'NONE' ? 'Aucune' :
                     editForm.recurrenceType === 'DAILY' ? 'Quotidienne' :
                     editForm.recurrenceType === 'WEEKLY' ? 'Hebdomadaire' : 'Mensuelle'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Aucune</SelectItem>
                  <SelectItem value="DAILY">Quotidienne</SelectItem>
                  <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                  <SelectItem value="MONTHLY">Mensuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="px-5 py-2">Annuler</Button>
              <Button onClick={handleEditSubmit} className="px-5 py-2">Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal d'information sur la tâche */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détail de la tâche</DialogTitle>
          </DialogHeader>
          {infoTask && (
            <div className="flex flex-col gap-6 pt-2">
              {/* Titre de la tâche */}
              <div className="text-xl font-bold truncate" title={infoTask.title}>{infoTask.title}</div>
              {/* Description */}
              <div>
                <div className="text-sm font-medium mb-1 text-muted-foreground">Description</div>
                <div className="bg-muted/60 border border-border rounded-lg p-4 text-base whitespace-pre-line min-h-[60px] max-h-56 overflow-auto">
                  {infoTask.description ? infoTask.description : <span className="italic text-muted-foreground">Aucune</span>}
                </div>
              </div>
              {/* Infos clés */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Priorité</span>
                  <PriorityBadge priority={infoTask.priority} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Statut</span>
                  <Badge className="text-xs px-2 py-1 rounded-full" style={{ background: infoTask.status?.color }}>{infoTask.status?.name}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Récurrence</span>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {infoTask.recurrenceType === 'NONE' ? 'Aucune' :
                     infoTask.recurrenceType === 'DAILY' ? 'Quotidienne' :
                     infoTask.recurrenceType === 'WEEKLY' ? 'Hebdomadaire' : 'Mensuelle'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Durée</span>
                  <span className="font-mono text-base">
                    {(() => {
                      const s = Math.abs(infoTask.durationSeconds ?? 0);
                      const h = Math.floor(s / 3600);
                      const m = Math.floor((s % 3600) / 60);
                      const sec = s % 60;
                      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
                    })()}
                  </span>
                </div>
                {infoTask.plannedEndAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Fin prévue</span>
                    <span>{format(new Date(infoTask.plannedEndAt), 'PPPp')}</span>
                  </div>
                )}
                {infoTask.actualEndAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Fin réelle</span>
                    <span>{format(new Date(infoTask.actualEndAt), 'PPPp')}</span>
                  </div>
                )}
                {infoTask.createdAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Créée</span>
                    <span>{format(new Date(infoTask.createdAt), 'PPPp')}</span>
                  </div>
                )}
                {infoTask.updatedAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Modifiée</span>
                    <span>{format(new Date(infoTask.updatedAt), 'PPPp')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
} 