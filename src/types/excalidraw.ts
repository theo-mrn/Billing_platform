// import { } from "@excalidraw/excalidraw";
// import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
// import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";

export type FillStyle = "hachure" | "cross-hatch" | "solid" | "zigzag";
export type StrokeStyle = "solid" | "dashed" | "dotted";

export interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  opacity: number;
  groupIds: readonly string[];
  frameId: string | null;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  boundElements?: readonly { type: string; id: string; }[] | null;
  updated: number;
  link?: string | null;
  locked: boolean;
  roundness: { type: number; } | null;
  index: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppState = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BinaryFiles = any;

export interface ExcalidrawData {
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
} 