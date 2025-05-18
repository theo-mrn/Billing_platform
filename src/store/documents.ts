import { create } from 'zustand';
import { getFolders, createFolder } from '@/app/api/projects/[id]/folders/actions';
import type { TextDocument, TextFolder } from '@/types/documents';

interface DocumentsStore {
  documents: TextDocument[];
  folders: TextFolder[];
  selectedFolderId: string | null;
  setDocuments: (documents: TextDocument[]) => void;
  setFolders: (folders: TextFolder[]) => void;
  setSelectedFolder: (folderId: string | null) => void;
  updateDocument: (documentId: string, updates: Partial<TextDocument>) => void;
  moveDocument: (documentId: string, targetFolderId: string | null) => void;
  addDocument: (document: TextDocument) => void;
  addFolder: (folder: TextFolder) => void;
  updateFolder: (folderId: string, updates: Partial<TextFolder>) => void;
  deleteFolder: (folderId: string) => void;
  fetchDocuments: (projectId: string) => Promise<void>;
  fetchFolders: (projectId: string) => Promise<void>;
  createNewFolder: (projectId: string, name: string, parentId?: string) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsStore>((set, get) => ({
  documents: [],
  folders: [],
  selectedFolderId: null,

  setDocuments: (documents) => set({ documents }),
  setFolders: (folders) => set({ folders }),
  setSelectedFolder: (folderId) => set({ selectedFolderId: folderId }),

  updateDocument: (documentId, updates) => {
    const { documents } = get();
    const updatedDocuments = documents.map(doc =>
      doc.id === documentId ? { ...doc, ...updates } : doc
    );
    set({ documents: updatedDocuments });
  },

  moveDocument: (documentId, targetFolderId) => {
    const { documents } = get();
    const updatedDocuments = documents.map(doc =>
      doc.id === documentId ? { ...doc, folderId: targetFolderId } : doc
    );
    set({ documents: updatedDocuments });
  },

  addDocument: (document) => {
    const { documents } = get();
    set({ documents: [...documents, document] });
  },

  addFolder: (folder) => {
    const { folders } = get();
    set({ folders: [...folders, folder] });
  },

  updateFolder: (folderId, updates) => {
    const { folders } = get();
    const updatedFolders = folders.map(folder =>
      folder.id === folderId ? { ...folder, ...updates } : folder
    );
    set({ folders: updatedFolders });
  },

  deleteFolder: (folderId) => {
    const { folders } = get();
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    set({ folders: updatedFolders });
  },

  fetchDocuments: async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/text`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      set({ documents: data });
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  },

  fetchFolders: async (projectId) => {
    try {
      const folders = await getFolders(projectId);
      set({ folders });
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  },

  createNewFolder: async (projectId: string, name: string, parentId?: string) => {
    try {
      const newFolder = await createFolder(projectId, name, parentId);
      const { folders } = get();
      set({ folders: [...folders, newFolder] });
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },
})); 