"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FolderExplorer } from "@/components/text-editor/FolderExplorer";
import { useDocumentsStore } from '@/store/documents';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';


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
  const { documents, setDocuments } = useDocumentsStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load documents on mount
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) {
        setCurrentContent(null);
        setTitle("Nouveau document");
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

    loadDocument();
  }, [documentId, documents]);

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

  return (
    <div className="flex h-[calc(100vh-4rem)]">
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
  );
};

export default TextEditor;
