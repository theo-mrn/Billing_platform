import { create } from 'zustand';
import { getFolders, createFolder } from '@/app/api/projects/[id]/folders/actions';
import { getDocuments, moveDocument } from '@/app/actions/documents';
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
  addDocument: (document: Partial<TextDocument> & { createdAt?: string | Date; updatedAt?: string | Date }) => void;
  addFolder: (folder: TextFolder) => void;
  updateFolder: (folderId: string, updates: Partial<TextFolder>) => void;
  deleteFolder: (folderId: string) => void;
  fetchDocuments: (projectId: string) => Promise<void>;
  fetchFolders: (projectId: string) => Promise<void>;
  createNewFolder: (projectId: string, name: string, parentId?: string) => Promise<void>;
}

const ensureDate = (date: string | Date | undefined): Date => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  // Handle both ISO string and Prisma date string formats
  return new Date(date);
};

export const useDocumentsStore = create<DocumentsStore>((set, get) => ({
  documents: [],
  folders: [],
  selectedFolderId: null,

  setDocuments: (documents) => set({ 
    documents: documents.map(doc => ({
      ...doc,
      createdAt: ensureDate(doc.createdAt),
      updatedAt: ensureDate(doc.updatedAt),
    }))
  }),
  
  setFolders: (folders) => set({ folders }),
  setSelectedFolder: (folderId) => set({ selectedFolderId: folderId }),

  updateDocument: (documentId, updates) => {
    const { documents } = get();
    const updatedDocuments = documents.map(doc =>
      doc.id === documentId ? {
        ...doc,
        ...updates,
        createdAt: ensureDate(updates.createdAt ?? doc.createdAt),
        updatedAt: ensureDate(updates.updatedAt ?? doc.updatedAt),
      } : doc
    );
    set({ documents: updatedDocuments });
  },

  moveDocument: async (documentId, targetFolderId) => {
    try {
      const { documents } = get();
      const projectId = documents.find(doc => doc.id === documentId)?.projectId;
      
      if (!projectId) {
        throw new Error("Document not found");
      }

      const updatedDoc = await moveDocument(projectId, documentId, targetFolderId);
      
      const updatedDocuments = documents.map(doc =>
        doc.id === documentId ? updatedDoc : doc
      );
      set({ documents: updatedDocuments });
    } catch (error) {
      console.error('Error moving document:', error);
      throw error;
    }
  },

  addDocument: (document) => {
    const { documents } = get();
    const newDoc: TextDocument = {
      ...document as Omit<TextDocument, 'createdAt' | 'updatedAt'>,
      createdAt: ensureDate(document.createdAt),
      updatedAt: ensureDate(document.updatedAt),
    };
    set({ documents: [...documents, newDoc] });
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
      const documents = await getDocuments(projectId);
      set({ documents });
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