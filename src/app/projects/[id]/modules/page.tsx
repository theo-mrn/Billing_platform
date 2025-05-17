"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, AlertCircle, MoreVertical, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Module {
  id: string;
  name: string;
  description: string | null;
  type: string;
  settings: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

const MODULE_TYPES = [
  { id: "list", name: "Liste", icon: "📝" },
  { id: "kanban", name: "Kanban", icon: "📊" },
  { id: "todo", name: "Todo", icon: "✅" },
  { id: "calendar", name: "Calendrier", icon: "📅" },
  { id: "notes", name: "Notes", icon: "📓" },
];

export default function ModulesPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const projectId = params.id as string;

  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: string;
  }>({
    name: "",
    description: "",
    type: "",
  });

  useEffect(() => {
    const fetchModules = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}/modules`);
        if (response.ok) {
          const data = await response.json();
          setModules(data);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
        toast.error("Erreur lors de la récupération des modules");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchModules();
    }
  }, [projectId]);

  const handleCreateOrUpdate = async () => {
    try {
      const url = editingModule 
        ? `/api/projects/${projectId}/modules/${editingModule.id}`
        : `/api/projects/${projectId}/modules`;
      
      const response = await fetch(url, {
        method: editingModule ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setModules(prev => 
          editingModule
            ? prev.map(m => m.id === data.id ? data : m)
            : [...prev, data]
        );
        toast.success(editingModule ? "Module mis à jour" : "Module créé");
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error creating/updating module:", error);
      toast.error("Erreur lors de la création/mise à jour du module");
    }
  };

  const handleDelete = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setModules(prev => prev.filter(m => m.id !== moduleId));
        toast.success("Module supprimé");
      } else {
        const error = await response.json();
        toast.error(error.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Erreur lors de la suppression du module");
    }
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({
      name: module.name,
      description: module.description || "",
      type: module.type,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", type: "" });
    setEditingModule(null);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Veuillez vous connecter pour voir les modules.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">
            Gérez les modules de votre projet
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingModule ? "Modifier le module" : "Créer un nouveau module"}
              </DialogTitle>
              <DialogDescription>
                {editingModule
                  ? "Modifiez les informations du module"
                  : "Créez un nouveau module dans votre projet"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du module</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Mon module"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type de module</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <span className="flex items-center">
                          <span className="mr-2">{type.icon}</span>
                          {type.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description du module..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateOrUpdate}>
                {editingModule ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Settings className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Aucun module trouvé. Créez votre premier module !
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <span className="mr-2">
                    {MODULE_TYPES.find(t => t.id === module.type)?.icon}
                  </span>
                  {module.name}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(module)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(module.id)}
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {module.description || "Aucune description"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Type: {MODULE_TYPES.find(t => t.id === module.type)?.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 