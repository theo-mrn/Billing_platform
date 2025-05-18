"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, Plus, Pencil, AlertCircle, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganization } from "@/contexts/OrganizationContext";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Organization {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const { selectedOrg, setSelectedOrg, isLoading: isOrgLoading } = useOrganization();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      console.log("Fetching organizations. Session state:", {
        status,
        userEmail: session?.user?.email,
        userId: session?.user?.id
      });
      
      try {
        const response = await fetch("/api/organizations/user");
        console.log("Organizations API response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Organizations fetched:", data.length);
          setOrganizations(data.map((org: { id: string; name: string }) => ({ id: org.id, name: org.name })));
        } else {
          const errorData = await response.json();
          console.error("Error response from organizations API:", errorData);
          setError(errorData.error || "Erreur lors de la récupération des organisations");
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setError("Erreur lors de la récupération des organisations");
      }
    };

    if (session?.user?.email) {
      fetchOrganizations();
    }
  }, [session, status]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedOrg) {
        console.log("No organization selected, skipping projects fetch");
        setProjects([]);
        setIsLoading(false);
        return;
      }

      console.log("Fetching projects for organization:", selectedOrg);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/organizations/${selectedOrg}/projects`);
        console.log("Projects API response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Projects fetched:", data.length);
          setProjects(data);
        } else {
          const errorData = await response.json();
          console.error("Error response from projects API:", errorData);
          setError(errorData.error || "Erreur lors de la récupération des projets");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Erreur lors de la récupération des projets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedOrg]);

  const handleCreateOrUpdate = async () => {
    if (!selectedOrg) return;

    try {
      const url = editingProject 
        ? `/api/organizations/${selectedOrg}/projects/${editingProject.id}`
        : `/api/organizations/${selectedOrg}/projects`;
      
      const response = await fetch(url, {
        method: editingProject ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(prev => 
          editingProject
            ? prev.map(p => p.id === data.id ? data : p)
            : [...prev, data]
        );
        toast.success(editingProject ? "Projet mis à jour" : "Projet créé");
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error creating/updating project:", error);
      toast.error("Erreur lors de la création/mise à jour du projet");
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!selectedOrg) return;

    try {
      const response = await fetch(`/api/organizations/${selectedOrg}/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast.success("Projet supprimé");
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);
      } else {
        const error = await response.json() as { error: string };
        toast.error(error.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Erreur lors de la suppression du projet");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingProject(null);
  };

  if (status === "loading" || isLoading || isOrgLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Veuillez vous connecter pour voir les projets.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-destructive">{error}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">
            Gérez les projets de votre organisation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedOrg || ""}
            onValueChange={(value) => {
              if (value) {
                setSelectedOrg(value);
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sélectionner une organisation" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau projet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? "Modifier le projet" : "Créer un nouveau projet"}
                </DialogTitle>
                <DialogDescription>
                  {editingProject
                    ? "Modifiez les informations du projet"
                    : "Créez un nouveau projet dans votre organisation"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du projet</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Mon super projet"
                  />
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
                    placeholder="Description du projet..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateOrUpdate}>
                  {editingProject ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le projet</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le projet &quot;{projectToDelete?.name}&quot; ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => projectToDelete && handleDelete(projectToDelete.id)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Folder className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Aucun projet trouvé. Créez votre premier projet !
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {project.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      {!project.isDefault && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProjectToDelete(project);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {project.description || "Aucune description"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Créé le{" "}
                    {format(new Date(project.createdAt), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 