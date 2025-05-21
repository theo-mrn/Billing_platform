"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, FolderIcon, Trash2, MoreVertical, FolderInput, ArrowRight } from "lucide-react";
import { FolderExplorer } from "@/components/text-editor/FolderExplorer";
import { useDocumentsStore } from '@/store/documents';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
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

interface TextFolder {
  id: string;
  name: string;
  documents: TextDocument[];
}

interface TextDocument {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  folderId: string | null;
}

interface RichTextContent {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
}

const TextEditor = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('doc');
  const [title, setTitle] = useState("Nouveau document");
  const [currentContent, setCurrentContent] = useState<RichTextContent | null>(null);
  const { documents, setDocuments, moveDocument } = useDocumentsStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<TextFolder[]>([]);

  // Load documents and folders on mount
  useEffect(() => {
    const loadData = async () => {
      if (!documentId) {
        setCurrentContent(null);
        setTitle("Nouveau document");
        
        // Load folders
        try {
          const response = await fetch(`/api/projects/${params.id}/folders`);
          if (response.ok) {
            const foldersData = await response.json();
            setFolders(foldersData);
          }
        } catch (error) {
          console.error("Error loading folders:", error);
          toast.error("Erreur lors du chargement des dossiers");
        }
        return;
      }

      setIsLoading(true);
      try {
        const document = documents.find(doc => doc.id === documentId);
        
        if (document) {
          const richTextContent: RichTextContent = {
            ...document,
            createdAt: document.createdAt instanceof Date ? document.createdAt.toISOString() : document.createdAt,
            updatedAt: document.updatedAt instanceof Date ? document.updatedAt.toISOString() : document.updatedAt,
          };
          setCurrentContent(richTextContent);
          setTitle(document.title);
        }
      } catch (error) {
        console.error("Error loading document:", error);
        toast.error("Erreur lors du chargement du document");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [documentId, documents, params.id]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch(`/api/projects/${params.id}/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      const newFolder = await response.json();
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
      const response = await fetch(`/api/projects/${params.id}/folders/${folderId}`, {
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

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${params.id}/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentContent?.id,
          title,
          content: currentContent?.content || "",
          folderId: currentContent?.folderId || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save document");
      }

      const savedContent = await response.json();

      if (currentContent?.id) {
        // Update existing document
        setDocuments(documents.map(doc =>
          doc.id === currentContent.id ? savedContent : doc
        ));
      } else {
        // Add new document
        setDocuments([...documents, savedContent]);
        // Update URL with new document ID
        const url = new URL(window.location.href);
        url.searchParams.set('doc', savedContent.id);
        window.history.pushState({}, '', url.toString());
      }

      setCurrentContent(savedContent);
      toast.success("Document sauvegardé");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-32px)] p-2">
        <div className="flex justify-between items-center mb-2">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex-1 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  // Si aucun document n'est sélectionné, afficher la page d'accueil des textes
  if (!documentId) {
    return (
      <div className="space-y-6 p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => window.location.href = `/projects/${params.id}`}
        >
          <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
          Retour au projet
        </Button>
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
                <Button variant="outline" size="sm" onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('doc', 'new');
                  window.history.pushState({}, '', url.toString());
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau document
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
                      {folder.documents?.length || 0} document{(folder.documents?.length || 0) !== 1 ? 's' : ''}
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
                  <div
                    className="flex-1 flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('doc', doc.id);
                      window.history.pushState({}, '', url.toString());
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{doc.title}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Modifié {formatDistanceToNow(new Date(doc.updatedAt), { locale: fr, addSuffix: true })}
                    </span>
                  </div>
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
                              onClick={async () => {
                                try {
                                  await moveDocument(doc.id, null);
                                } catch (error) {
                                  console.error('Error moving document:', error);
                                  toast.error("Erreur lors du déplacement du document");
                                }
                              }}
                            >
                              <FolderIcon className="h-4 w-4 mr-2" />
                              Racine du projet
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {folders.map((folder) => (
                              <DropdownMenuItem
                                key={folder.id}
                                onClick={async () => {
                                  try {
                                    await moveDocument(doc.id, folder.id);
                                  } catch (error) {
                                    console.error('Error moving document:', error);
                                    toast.error("Erreur lors du déplacement du document");
                                  }
                                }}
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
      </div>
    );
  }

  // Si un document est sélectionné, afficher l'éditeur
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Button
        variant="ghost"
        className="mb-2 ml-2 mt-2 self-start"
        onClick={() => window.location.href = `/projects/${params.id}`}
      >
        <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
        Retour au projet
      </Button>
      <div className="flex flex-1">
        <FolderExplorer
          projectId={params.id as string}
          onSelectDocument={(docId: string) => {
            const url = new URL(window.location.href);
            url.searchParams.set('doc', docId);
            window.history.pushState({}, '', url.toString());
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          selectedDocumentId={documentId || undefined}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
              placeholder="Titre du document"
            />
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <SimpleEditor 
              content={currentContent?.content}
              onChange={(newContent) => {
                if (currentContent) {
                  setCurrentContent({
                    ...currentContent,
                    content: newContent
                  });
                } else {
                  setCurrentContent({
                    id: '',
                    title,
                    content: newContent,
                    projectId: params.id as string,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    folderId: null
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
