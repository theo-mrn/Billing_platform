export interface TextDocument {
  id: string;
  title: string;
  content: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  folderId: string | null;
}

export interface TextFolder {
  id: string;
  name: string;
  projectId?: string;
  parentId: string | null;
  children: TextFolder[];
  documents: TextDocument[];
}

export type PrismaDateFields = {
  createdAt: Date;
  updatedAt: Date;
}

export type PrismaDocument = Omit<TextDocument, 'createdAt' | 'updatedAt'> & PrismaDateFields;

export type PrismaFolder = {
  id: string;
  name: string;
  projectId: string;
  parentId: string | null;
} & PrismaDateFields;

export type PrismaFolderWithRelations = PrismaFolder & {
  documents: PrismaDocument[];
  children: Array<PrismaFolder & {
    documents: PrismaDocument[];
    children: Array<PrismaFolder>;
  }>;
};

type RecursiveFolderInput = Omit<TextFolder, 'documents' | 'children'> & {
  documents: Array<Parameters<typeof convertDocument>[0]>;
  children: Array<RecursiveFolderInput>;
};

export function convertDocument(doc: Omit<TextDocument, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
}): TextDocument {
  return {
    ...doc,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export function convertFolder(folder: RecursiveFolderInput): TextFolder {
  return {
    ...folder,
    documents: folder.documents.map(convertDocument),
    children: folder.children.map(convertFolder),
  };
} 