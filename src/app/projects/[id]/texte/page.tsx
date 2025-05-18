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
      // Nettoyer l'ancienne instance si elle existe
      if (editorRef.current) {
        editorRef.current.container.remove();
        editorRef.current = null;
      }

      if (typeof window !== 'undefined') {
        const [{ default: Quill }, { default: ImageResize }] = await Promise.all([
          import('quill'),
          import('quill-image-resize')
        ]);

        Quill.register('modules/imageResize', ImageResize);

        if (containerRef.current) {
          // Créer un nouvel élément div pour l'éditeur
          const editorElement = document.createElement('div');
          containerRef.current.appendChild(editorElement);

          const editor = new Quill(editorElement, {
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

          // Définir le contenu initial si disponible
          if (currentContent?.content) {
            editor.root.innerHTML = currentContent.content;
          }
        }
      }
    };

    initQuill();

    // Cleanup function
    return () => {
      if (editorRef.current) {
        editorRef.current.container.remove();
        editorRef.current = null;
      }
    };
  }, [documentId]); // Dépendance au documentId pour réinitialiser quand le document change

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
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
        selectedDocumentId={documentId || undefined}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 max-w-5xl mx-auto items-center px-4 w-full gap-4">
            <div className="flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold bg-transparent border-0 px-0 h-auto focus-visible:ring-0 w-full"
                placeholder="Titre du document"
              />
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !isEditorReady}
              size="sm"
              className="min-w-[140px] transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <span className="animate-pulse">Sauvegarde en cours...</span>
                </>
              ) : (
                <>
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <style jsx global>{`
            .ql-toolbar.ql-snow {
              border: none !important;
              background: hsl(var(--background));
              padding: 1rem 2rem !important;
            }
            .ql-container.ql-snow {
              border: none !important;
              background: rgb(24 24 27) !important; /* zinc-900 */
              font-family: var(--font-sans);
            }
            .ql-editor {
              padding: 2rem !important;
              max-width: none !important;
              margin: 0 !important;
              min-height: 100% !important;
            }
            .ql-editor p {
              line-height: 1.8;
            }
            .ql-snow .ql-stroke {
              stroke: hsl(var(--foreground)) !important;
            }
            .ql-snow .ql-fill {
              fill: hsl(var(--foreground)) !important;
            }
            .ql-snow .ql-picker {
              color: hsl(var(--foreground)) !important;
            }
            .ql-snow .ql-picker-options {
              background: hsl(var(--background)) !important;
              color: hsl(var(--foreground)) !important;
              border-color: hsl(var(--border)) !important;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
            }
            .ql-snow .ql-picker-label {
              border-color: hsl(var(--border)) !important;
            }
            .ql-snow.ql-toolbar button:hover,
            .ql-snow .ql-toolbar button:hover,
            .ql-snow.ql-toolbar button.ql-active,
            .ql-snow .ql-toolbar button.ql-active,
            .ql-snow.ql-toolbar .ql-picker-label:hover,
            .ql-snow .ql-toolbar .ql-picker-label:hover,
            .ql-snow.ql-toolbar .ql-picker-label.ql-active,
            .ql-snow .ql-toolbar .ql-picker-label.ql-active,
            .ql-snow.ql-toolbar .ql-picker-item:hover,
            .ql-snow .ql-toolbar .ql-picker-item:hover,
            .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
            .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
              color: hsl(var(--primary)) !important;
            }
            .ql-snow.ql-toolbar button:hover .ql-stroke,
            .ql-snow .ql-toolbar button:hover .ql-stroke,
            .ql-snow.ql-toolbar button.ql-active .ql-stroke,
            .ql-snow .ql-toolbar button.ql-active .ql-stroke {
              stroke: hsl(var(--primary)) !important;
            }
            .ql-snow.ql-toolbar button:hover .ql-fill,
            .ql-snow .ql-toolbar button:hover .ql-fill,
            .ql-snow.ql-toolbar button.ql-active .ql-fill,
            .ql-snow .ql-toolbar button.ql-active .ql-fill {
              fill: hsl(var(--primary)) !important;
            }
            .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
              border-color: hsl(var(--border)) !important;
            }
          `}</style>
          <div 
            ref={containerRef} 
            className="h-full relative"
          />
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
