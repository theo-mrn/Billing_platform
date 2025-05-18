"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { ArrowRight, FileText, Plus, FolderIcon, Trash2, MoreVertical, FolderInput, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getFolders, createFolder } from "@/app/api/projects/[id]/folders/actions";
import { getProject } from "@/app/actions/projects";
import { getDocuments, moveDocument } from "@/app/actions/documents";
import type { TextDocument, TextFolder } from "@/types/documents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const [documents, setDocuments] = useState<TextDocument[]>([]);
  const [folders, setFolders] = useState<TextFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProjectDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [projectData, documentsData, foldersData] = await Promise.all([
            getProject(projectId),
            getDocuments(projectId),
            getFolders(projectId)
          ]);

          setProject(projectData);
          setDocuments(documentsData);
          setFolders(foldersData);
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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const newFolder = await createFolder(projectId, newFolderName);
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName("");
      setIsCreatingFolder(false);
      toast.success("Dossier créé avec succès");
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error("Erreur lors de la création du dossier");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete folder');
      
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      toast.success("Dossier supprimé avec succès");
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error("Erreur lors de la suppression du dossier");
    }
  };

  const handleMoveDocument = async (documentId: string, targetFolderId: string | null) => {
    try {
      const updatedDoc = await moveDocument(projectId, documentId, targetFolderId);
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? updatedDoc
          : doc
      ));
      toast.success("Document déplacé avec succès");
    } catch (error) {
      console.error('Error moving document:', error);
      toast.error("Erreur lors du déplacement du document");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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

      {/* Documents and Folders Section */}
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Documents & Dossiers</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreatingFolder(true)}>
                <FolderIcon className="h-4 w-4 mr-2" />
                Nouveau dossier
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${projectId}/texte${activeFolder ? `?folder=${activeFolder}` : ''}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau document
                </Link>
              </Button>
            </div>
          </div>
          <CardDescription>
            {activeFolder 
              ? `Documents dans ${folders.find(f => f.id === activeFolder)?.name}`
              : "Documents et dossiers du projet"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreatingFolder && (
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Nom du dossier"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }
                }}
                autoFocus
              />
              <Button onClick={handleCreateFolder}>Créer</Button>
              <Button variant="ghost" onClick={() => setIsCreatingFolder(false)}>Annuler</Button>
            </div>
          )}

          <div className="space-y-2">
            {activeFolder && (
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFolder(null)}
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Retour
                </Button>
                <span className="text-lg font-medium">
                  {folders.find(f => f.id === activeFolder)?.name}
                </span>
              </div>
            )}

            {/* Folders - only show when not in a folder */}
            {!activeFolder && folders.map((folder) => (
              <div 
                key={folder.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted group/item"
              >
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium">{folder.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {folder.documents.length} document{folder.documents.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFolder(folder.id)}
                  >
                    <span>Ouvrir</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteFolder(folder.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {/* Documents */}
            {documents
              .filter(doc => activeFolder ? doc.folderId === activeFolder : doc.folderId === null)
              .map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted group/item"
              >
                <Link 
                  href={`/projects/${projectId}/texte?doc=${doc.id}`}
                  className="flex-1 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{doc.title}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    Modifié {formatDistanceToNow(doc.updatedAt, { locale: fr, addSuffix: true })}
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <FolderInput className="h-4 w-4 mr-2" />
                          Déplacer vers
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={() => handleMoveDocument(doc.id, null)}
                          >
                            <FolderIcon className="h-4 w-4 mr-2" />
                            Racine du projet
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {folders.map((folder) => (
                            <DropdownMenuItem
                              key={folder.id}
                              onClick={() => handleMoveDocument(doc.id, folder.id)}
                            >
                              <FolderIcon className="h-4 w-4 mr-2" />
                              {folder.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {folders.length === 0 && documents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun dossier ou document pour le moment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flashcards Link */}
      <Button variant="outline" asChild className="w-full">
        <Link href={`/projects/${projectId}/flashcards`} className="flex items-center justify-center gap-2">
          <BrainCircuit className="h-4 w-4" />
          <span>Flashcards</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}