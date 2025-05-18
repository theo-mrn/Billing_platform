"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type Quill from 'quill';
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FolderExplorer } from "@/components/text-editor/FolderExplorer";
import { useDocumentsStore } from '@/store/documents';
import type { TextDocument } from "@/types/documents";

interface QuillToolbar {
  addHandler: (format: string, handler: () => void) => void;
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

const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['blockquote', 'code-block'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  ['link', 'image'],
  ['clean']
];

const TextEditor = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('doc');
  
  const {
    documents,
    updateDocument,
    addDocument,
    selectedFolderId,
    fetchDocuments,
  } = useDocumentsStore();

  const convertToRichTextContent = (doc: TextDocument): RichTextContent => ({
    ...doc,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [title, setTitle] = useState("Nouveau document");
  const [currentContent, setCurrentContent] = useState<RichTextContent | null>(null);
  const editorRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Charger tous les documents au montage
  useEffect(() => {
    fetchDocuments(params.id as string);
  }, [fetchDocuments, params.id]);

  // Charger le document sélectionné
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) {
        setCurrentContent(null);
        setTitle("Nouveau document");
        if (editorRef.current) {
          editorRef.current.root.innerHTML = '';
        }
        return;
      }
      
      setIsLoading(true);
      try {
        const document = documents.find(doc => doc.id === documentId);
        
        if (document) {
          setCurrentContent(convertToRichTextContent(document));
          setTitle(document.title);
          
          if (editorRef.current) {
            editorRef.current.root.innerHTML = document.content || '';
          }
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast.error("Erreur lors du chargement du document");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId, documents]);

  // Initialisation de Quill
  useEffect(() => {
    const initQuill = async () => {
      if (typeof window !== 'undefined' && !editorRef.current) {
        const [{ default: Quill }, { default: ImageResize }] = await Promise.all([
          import('quill'),
          import('quill-image-resize')
        ]);

        Quill.register('modules/imageResize', ImageResize);

        if (containerRef.current) {
          const editor = new Quill(containerRef.current, {
            modules: {
              toolbar: toolbarOptions,
              imageResize: {
                displaySize: true,
                modules: ['Resize', 'DisplaySize', 'Toolbar']
              }
            },
            theme: 'snow',
          });
          
          const toolbar = editor.getModule('toolbar') as QuillToolbar;
          toolbar.addHandler('image', () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const range = editor.getSelection(true);
                  editor.insertEmbed(range.index, 'image', e.target?.result);
                };
                reader.readAsDataURL(file);
              }
            };
          });

          editorRef.current = editor;
          setIsEditorReady(true);

          // Si on a déjà le contenu du document, on le charge
          if (currentContent?.content) {
            editor.root.innerHTML = currentContent.content;
          }
        }
      }
    };

    initQuill();
  }, [currentContent?.content]);

  const handleSave = async () => {
    if (!isEditorReady || !editorRef.current) return;

    try {
      setIsSaving(true);
      const content = editorRef.current.root.innerHTML;
      
      const response = await fetch(`/api/projects/${params.id}/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentContent?.id,
          title,
          content,
          folderId: currentContent?.folderId || selectedFolderId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      const savedContent = await response.json();
      
      if (currentContent?.id) {
        // Update existing document
        updateDocument(currentContent.id, savedContent);
        setCurrentContent(savedContent);
      } else {
        // Add new document
        addDocument(savedContent);
        setCurrentContent(savedContent);
        // Update URL with new document ID
        const url = new URL(window.location.href);
        url.searchParams.set('doc', savedContent.id);
        window.history.pushState({}, '', url.toString());
      }
      
      toast.success("Document sauvegardé avec succès");
    } catch (error) {
      console.error("Error saving content:", error);
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
        <Card className="flex-1">
          <div className="h-full bg-muted animate-pulse" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-32px)]">
      <FolderExplorer
        projectId={params.id as string}
        onSelectDocument={(docId) => {
          const url = new URL(window.location.href);
          url.searchParams.set('doc', docId);
          window.history.pushState({}, '', url.toString());
          // Utiliser l'historique du navigateur au lieu de recharger
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        selectedDocumentId={documentId || undefined}
      />
      
      <div className="flex-1 flex flex-col p-2">
        <style jsx global>{`
          .ql-snow .ql-stroke {
            stroke: white !important;
          }
          .ql-snow .ql-fill {
            fill: white !important;
          }
          .ql-snow .ql-picker {
            color: white !important;
          }
          .ql-snow .ql-picker-options {
            background-color: #1a1a1a !important;
            color: white !important;
          }
          .ql-snow .ql-picker-label {
            color: white !important;
            border-color: white !important;
          }
          .ql-snow .ql-picker-label .ql-stroke {
            stroke: white !important;
          }
          /* Suppression des bordures */
          .ql-toolbar.ql-snow {
            border: none !important;
          }
          .ql-container.ql-snow {
            border: none !important;
          }
          .ql-editor {
            padding: 1rem !important;
          }
          /* Suppression des bordures des boutons */
          .ql-formats button {
            border: none !important;
          }
          .ql-picker-options {
            border: none !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          }
        `}</style>
        <div className="flex justify-between items-center mb-2 max-w-5xl mx-auto w-full">
          <div className="flex-1 mr-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold bg-transparent border-0 px-0 h-auto focus-visible:ring-0"
              placeholder="Titre du document"
            />
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !isEditorReady}
            size="lg"
            className="min-w-[140px]"
          >
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
        
        <Card className="flex-1 overflow-hidden max-w-5xl mx-auto w-full border-0">
          <div 
            ref={containerRef} 
            className="h-full [&_.ql-container]:h-[calc(100%-42px)] [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-container]:border-0"
          />
        </Card>
      </div>
    </div>
  );
};

export default TextEditor;
