"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, FolderIcon, BrainCircuit, Pencil } from "lucide-react";
import { getProject } from "@/app/actions/projects";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  isDefault: boolean;
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProjectDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const projectData = await getProject(projectId);
          setProject(projectData);
        } catch (err) {
          console.error("Error fetching project details:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProjectDetails();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please try refreshing the page or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <p className="text-muted-foreground">Project data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <Badge variant="secondary">Active</Badge>
        </div>
        {project.description && (
          <p className="text-muted-foreground text-lg">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Documents Card */}
        <Link href={`/projects/${projectId}/texte`}>
          <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Documents</CardTitle>
              </div>
              <CardDescription>
                Gérez vos documents et dossiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderIcon className="h-4 w-4" />
                <span>Accéder à vos documents</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Draft Card */}
        <Link href={`/projects/${projectId}/draft`}>
          <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-primary" />
                <CardTitle>Brouillons</CardTitle>
              </div>
              <CardDescription>
                Créez et modifiez vos brouillons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Pencil className="h-4 w-4" />
                <span>Accéder aux brouillons</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Flashcards Card */}
        <Link href={`/projects/${projectId}/flashcards`}>
          <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <CardTitle>Flashcards</CardTitle>
              </div>
              <CardDescription>
                Révisez avec des flashcards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BrainCircuit className="h-4 w-4" />
                <span>Accéder aux flashcards</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}