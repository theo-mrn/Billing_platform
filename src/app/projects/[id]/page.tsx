"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import ProjectTodoSidebar from "@/components/ProjectTodoSidebar";
// We'll need to import the actual Kanban board component later
// import KanbanBoard from "@/components/KanbanBoard"; // Example import

interface Project {
  id: string;
  name: string;
  description?: string;
  // Add other project fields as needed
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string; // Or params.id if your param is just 'id'

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProjectDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // TODO: Adjust this API endpoint if necessary
          const response = await fetch(`/api/projects/${projectId}`); 
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("Project not found");
            }
            const errorData = await response.json().catch(() => ({ error: "Failed to fetch project details" }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setProject(data);
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
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <p>Project data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 flex flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        {/* Kanban Board Section */}
        <Card>
          <CardHeader>
            <CardTitle>Kanban Board</CardTitle>
            <Link href={`/projects/${projectId}/kanban`} className="text-primary underline text-sm mt-1">Aller au Kanban</Link>
          </CardHeader>
          <CardContent>
            {/* 
              Placeholder for Kanban Board. 
              We will integrate the actual component here.
              It will likely need the projectId.
              e.g., <KanbanBoard projectId={projectId} /> 
            */}
            <p className="text-muted-foreground">Kanban board will be displayed here.</p>
            <p>Project ID for Kanban: {projectId}</p>
          </CardContent>
        </Card>

        {/* Placeholder for other modules */}
        <Card>
          <CardHeader>
            <CardTitle>Other Modules</CardTitle>
            <Link href={`/projects/${projectId}/modules`} className="text-primary underline text-sm mt-1">Aller aux modules</Link>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Other project modules will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
      <div className="w-96 shrink-0">
        <ProjectTodoSidebar projectId={projectId} />
      </div>
    </div>
  );
}