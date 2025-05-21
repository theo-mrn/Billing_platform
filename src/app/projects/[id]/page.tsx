"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  FolderIcon,
  Trash2,
  MoreVertical,
  FolderInput,
  ArrowRight,
  PencilRuler,
} from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { moveDocument, getDocuments, deleteDocument } from "@/app/actions/documents";
import { getFolders, createFolder, deleteFolder } from "@/app/actions/folders";
import { getDrafts, moveDraft, deleteDraft } from "@/app/actions/drafts";

interface TextFolder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  documents: TextDocument[];
}

interface TextDocument {
  id: string;
  title: string;
  content: string;
  projectId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentWithType extends TextDocument {
  type: "text" | "draft";
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentWithType[]>([]);
  const [folders, setFolders] = useState<TextFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      // Charger les dossiers
      const foldersData = await getFolders(params.id as string);
      const formattedFolders = foldersData.map(folder => ({
        ...folder,
        createdAt: folder.createdAt.toISOString(),
        updatedAt: folder.updatedAt.toISOString(),
        documents: folder.documents.map(doc => ({
          ...doc,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString(),
        })),
      }));
      setFolders(formattedFolders);

      // Charger les documents texte
      const textsData = await getDocuments(params.id as string);
      const textDocuments = textsData.map(text => ({
        ...text,
        createdAt: text.createdAt.toISOString(),
        updatedAt: text.updatedAt.toISOString(),
        type: "text" as const
      }));

      // Charger les drafts
      const draftsData = await getDrafts(params.id as string);
      const draftDocuments = draftsData.map((draft) => ({
        id: draft.id,
        title: draft.name,
        content: "",
        projectId: draft.projectId,
        folderId: draft.folderId,
        createdAt: draft.createdAt.toISOString(),
        updatedAt: draft.updatedAt.toISOString(),
        type: "draft" as const
      }));

      setDocuments([...textDocuments, ...draftDocuments]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des données");
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(params.id as string, newFolderName);
      await loadData(); // Recharger les données
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
      await deleteFolder(params.id as string, folderId);
      await loadData(); // Recharger les données
      toast.success("Dossier supprimé avec succès");
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error("Erreur lors de la suppression du dossier");
    }
  };

  const handleCreateDocument = (type: "text" | "draft") => {
    if (type === "text") {
      router.push(`/projects/${params.id}/texte?doc=new${activeFolder ? `&folderId=${activeFolder}` : ''}`);
    } else {
      router.push(`/projects/${params.id}/draft${activeFolder ? `?folderId=${activeFolder}` : ''}`);
    }
  };

  const handleDeleteDocument = async (docId: string, type: "text" | "draft") => {
    try {
      if (type === "text") {
        await deleteDocument(params.id as string, docId);
      } else {
        await deleteDraft(params.id as string, docId);
      }
      await loadData();
      toast.success("Document supprimé avec succès");
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error("Erreur lors de la suppression du document");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Documents du projet</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreatingFolder(true)}>
                <FolderIcon className="h-4 w-4 mr-2" />
                Nouveau dossier
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${params.id}/flashcards`)}>
                <PencilRuler className="h-4 w-4 mr-2" />
                Flashcards
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau document
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleCreateDocument("text")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Nouveau texte
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateDocument("draft")}>
                    <PencilRuler className="h-4 w-4 mr-2" />
                    Nouveau draft
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>
            {activeFolder 
              ? `Documents dans ${folders.find(f => f.id === activeFolder)?.name}`
              : "Tous les documents du projet"
            }
          </CardDescription>
          <div className="mt-4">
            <Input
              placeholder="Rechercher"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-md"
            />
          </div>
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

          {/* Folders section (top, thin style) */}
          {!activeFolder && folders.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-3 items-center">
                {folders.map((folder) => (
                  <div 
                    key={folder.id}
                    className="relative flex items-center px-4 py-1.5 rounded-full border bg-accent text-accent-foreground hover:bg-accent/80 transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-ring"
                    tabIndex={0}
                    onClick={() => setActiveFolder(folder.id)}
                  >
                    <FolderIcon className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="font-semibold text-sm truncate max-w-[120px]">{folder.name}</span>
                    <Badge variant="outline" className="ml-2 px-2 py-0 text-xs">
                      {documents.filter(d => d.folderId === folder.id).length} doc(s)
                    </Badge>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retour si dans un dossier */}
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

          {/* Separator */}
          <div className="my-4 border-b" />

          {/* Documents & Drafts grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {documents
              .filter(doc => activeFolder ? doc.folderId === activeFolder : doc.folderId === null)
              .filter(doc =>
                doc.title.toLowerCase().includes(search.toLowerCase())
              )
              .map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition cursor-pointer group/item max-w-xs">
                  <CardContent className="p-4 flex flex-col h-full justify-between">
                    <div
                      className="flex-1 flex items-center gap-2"
                      onClick={() => {
                        if (doc.type === "text") {
                          router.push(`/projects/${params.id}/texte?doc=${doc.id}`);
                        } else {
                          router.push(`/projects/${params.id}/draft?draftId=${doc.id}`);
                        }
                      }}
                    >
                      {doc.type === "text" ? (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <PencilRuler className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{doc.title}</span>
                      <Badge variant="outline" className="ml-2">
                        {doc.type === "text" ? "Texte" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Modifié {formatDistanceToNow(new Date(doc.updatedAt), { locale: fr, addSuffix: true })}
                      </span>
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
                                    if (doc.type === "text") {
                                      await moveDocument(params.id as string, doc.id, null);
                                    } else {
                                      await moveDraft(params.id as string, doc.id, null);
                                    }
                                    await loadData();
                                    toast.success("Document déplacé avec succès");
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
                                      if (doc.type === "text") {
                                        await moveDocument(params.id as string, doc.id, folder.id);
                                      } else {
                                        await moveDraft(params.id as string, doc.id, folder.id);
                                      }
                                      await loadData();
                                      toast.success("Document déplacé avec succès");
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteDocument(doc.id, doc.type)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {folders.length === 0 && documents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun dossier ou document pour le moment.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}