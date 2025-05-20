import { THEME } from "@excalidraw/excalidraw";

export type ExcalidrawElement = Readonly<{
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  strokeStyle: string;
  roughness: number;
  opacity: number;
  groupIds: readonly string[];
  frameId: string | null;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  roundness: { type: number } | null;
  index?: number;
  customData?: Record<string, unknown>;
}>;

export interface BinaryFileData {
  id: string;
  dataURL: string;
  mimeType: string;
  created: number;
  lastRetrieved?: number;
}

export type BinaryFiles = Map<string, BinaryFileData>;

export interface ExcalidrawAppState {
  viewBackgroundColor: string;
  currentItemFontFamily: number;
  theme?: typeof THEME.LIGHT | typeof THEME.DARK;
  name?: string;
  collaborators: Map<string, unknown> | null;
}

export interface ExcalidrawData {
  elements: readonly ExcalidrawElement[];
  appState: ExcalidrawAppState;
  files: BinaryFiles;
}

export { BinaryFiles }; 