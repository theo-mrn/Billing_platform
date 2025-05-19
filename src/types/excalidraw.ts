export interface ExcalidrawData {
  elements: Array<{
    id: string;
    type: string;
    [key: string]: unknown;
  }>;
  appState: {
    collaborators: unknown;
    viewBackgroundColor: string;
    currentItemFontFamily: number;
    theme?: string;
    gridSize?: number | null;
    name?: string;
    [key: string]: unknown;
  };
  files: Record<string, unknown>;
} 