"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ProjectTodoSidebar from "@/components/ProjectTodoSidebar";
import { KanbanSquare, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
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
      <div className="p-6">
        <p className="text-muted-foreground">Project data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="secondary">Active</Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground text-lg">{project.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kanban Board Card */}
          <Card className="group hover:shadow-md transition-all duration-200">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KanbanSquare className="h-5 w-5 text-primary" />
                  <CardTitle>Kanban Board</CardTitle>
                </div>
                <Badge variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View Board
                </Badge>
              </div>
              <CardDescription>Manage and track project tasks visually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Organize your tasks with an intuitive drag-and-drop interface. Track progress and manage workflow efficiently.
              </p>
              <Button
                variant="outline"
                className="w-full group"
                asChild
              >
                <Link href={`/projects/${projectId}/kanban`}>
                  <span>Open Kanban Board</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Other Modules Card */}
          <Card className="group hover:shadow-md transition-all duration-200">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle>Project Modules</CardTitle>
                </div>
                <Badge variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Explore
                </Badge>
              </div>
              <CardDescription>Access additional project features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Discover and manage various aspects of your project including documents, timelines, and team collaboration tools.
              </p>
              <Button
                variant="outline"
                className="w-full group"
                asChild
              >
                <Link href={`/projects/${projectId}/modules`}>
                  <span>View All Modules</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-96 border-l py-6 pl-6 overflow-auto">
        <ProjectTodoSidebar projectId={projectId} />
      </div>
    </div>
  );
}