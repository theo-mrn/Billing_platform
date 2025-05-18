import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderIcon, FileIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentsStore } from '@/store/documents';
import { TextFolder } from '@/types/documents';

interface FolderExplorerProps {
  projectId: string;
  onSelectDocument: (documentId: string) => void;
  selectedDocumentId?: string;
}

export function FolderExplorer({ projectId, onSelectDocument, selectedDocumentId }: FolderExplorerProps) {
  const {
    documents,
    folders,
    selectedFolderId,
    setSelectedFolder,
    fetchDocuments,
    fetchFolders,
    createNewFolder
  } = useDocumentsStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    fetchDocuments(projectId);
    fetchFolders(projectId);
  }, [projectId, fetchDocuments, fetchFolders]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createNewFolder(
        projectId,
        newFolderName,
        selectedFolderId || undefined
      );
      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolder = (folder: TextFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-1 py-1 px-2 hover:bg-accent rounded cursor-pointer",
            isSelected && "bg-accent"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            toggleFolder(folder.id);
            setSelectedFolder(folder.id);
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3" />
            ) : (
              <ChevronRightIcon className="h-3 w-3" />
            )}
          </Button>
          <FolderIcon className="h-4 w-4 text-yellow-400" />
          <span className="text-sm">{folder.name}</span>
        </div>

        {isExpanded && (
          <>
            {folder.documents.map(doc => (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-2 py-1 px-2 hover:bg-accent rounded cursor-pointer",
                  selectedDocumentId === doc.id && "bg-accent",
                )}
                style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                onClick={() => onSelectDocument(doc.id)}
              >
                <FileIcon className="h-4 w-4" />
                <span className="text-sm">{doc.title}</span>
              </div>
            ))}
            {folder.children.map(child => renderFolder(child, level + 1))}
          </>
        )}
      </div>
    );
  };

  const renderRootDocuments = () => {
    const rootDocuments = documents.filter(doc => doc.folderId === null);
    
    return rootDocuments.map(doc => (
      <div
        key={doc.id}
        className={cn(
          "flex items-center gap-2 py-1 px-2 hover:bg-accent rounded cursor-pointer",
          selectedDocumentId === doc.id && "bg-accent",
        )}
        style={{ paddingLeft: '8px' }}
        onClick={() => onSelectDocument(doc.id)}
      >
        <FileIcon className="h-4 w-4" />
        <span className="text-sm">{doc.title}</span>
      </div>
    ));
  };

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="p-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setIsCreatingFolder(true)}
        >
          <PlusIcon className="h-4 w-4" />
          Nouveau dossier
        </Button>
      </div>

      {isCreatingFolder && (
        <div className="p-2 flex gap-2">
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
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderRootDocuments()}
          {folders.map(folder => renderFolder(folder))}
        </div>
      </ScrollArea>
    </div>
  );
} 