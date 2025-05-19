"use client";
import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { ExcalidrawData } from "@/types/excalidraw";

// Chargement dynamique pour éviter le SSR
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

interface ExcalidrawBoardProps {
  initialData: ExcalidrawData;
  onChange: (data: ExcalidrawData) => void;
}

const DEFAULT_INITIAL_DATA = {
  elements: [],
  appState: {
    collaborators: null,
    viewBackgroundColor: "#ffffff",
    currentItemFontFamily: 1,
    theme: "light",
    name: "",
  },
  files: {},
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExcalidrawComponentProps = any;

const ExcalidrawBoard = React.memo<ExcalidrawBoardProps>(({ initialData, onChange }) => {
  // Mémoriser les données initiales
  const safeInitialData = useMemo(() => ({
    elements: initialData.elements || DEFAULT_INITIAL_DATA.elements,
    appState: {
      ...DEFAULT_INITIAL_DATA.appState,
      ...(initialData.appState || {}),
      collaborators: null,  // Toujours null pour éviter les problèmes
    },
    files: initialData.files || DEFAULT_INITIAL_DATA.files,
  }), [initialData]);

  // Mémoriser le callback onChange
  const handleChange = useCallback((...args: unknown[]) => {
    const [elements = [], appState = {}, files = {}] = args;
    
    const safeAppState = {
      ...DEFAULT_INITIAL_DATA.appState,
      ...(appState as object),
      collaborators: null, // Toujours null pour éviter les problèmes
    };
    
    onChange({ 
      elements: (elements as ExcalidrawData['elements']).map(el => ({ ...el })), 
      appState: safeAppState, 
      files: files as Record<string, unknown>
    });
  }, [onChange]);

  return (
    <div style={{ height: "80vh", width: "100%", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
      <Excalidraw
        initialData={safeInitialData as ExcalidrawComponentProps}
        onChange={handleChange as ExcalidrawComponentProps}
        theme="light"
      />
    </div>
  );
});

ExcalidrawBoard.displayName = 'ExcalidrawBoard';

export default ExcalidrawBoard; 