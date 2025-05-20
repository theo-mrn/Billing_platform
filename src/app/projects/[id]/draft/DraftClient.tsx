"use client";
import React, { useState, useRef, useCallback } from "react";
import ExcalidrawBoard from "./components/ExcalidrawBoard";
import { updateBoard } from "./actions";
import { ExcalidrawData, AppState } from "@/types/excalidraw";

interface ExcalidrawBoardType {
  id: string;
  name: string;
  data: ExcalidrawData;
}

const DEFAULT_EXCALIDRAW_DATA: ExcalidrawData = {
  elements: [],
  appState: {
    viewBackgroundColor: "#ffffff",
    currentItemFontFamily: 1,
    theme: "light",
    name: "",
  } as AppState,
  files: {},
};

// Fonction utilitaire pour s'assurer que les données sont complètes
function ensureValidData(data: ExcalidrawData): ExcalidrawData {
  // Créer une copie des données
  const validData: ExcalidrawData = {
    elements: [...data.elements],
    appState: { ...data.appState },
    files: { ...data.files }
  };
  
  // S'assurer que collaborators est une Map
  if (!validData.appState.collaborators || 
      !(validData.appState.collaborators instanceof Map)) {
    validData.appState.collaborators = new Map();
  }
  
  return validData;
}

export default function DraftClient({ initialBoards }: { initialBoards: ExcalidrawBoardType[] }) {
  const board = initialBoards[0];
  const [currentData, setCurrentData] = useState<ExcalidrawData>(() => 
    ensureValidData(board.data || DEFAULT_EXCALIDRAW_DATA)
  );

  // Ref pour le timeout de debounce
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sauvegarder un board (debounce)
  const handleChange = useCallback((data: ExcalidrawData) => {
    // Mettre à jour la donnée locale immédiatement
    setCurrentData(data);
    
    // Debounce la sauvegarde sur le serveur
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        await updateBoard(board.id, data);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }, 1000);
  }, [board.id]);

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{board.name}</h1>
      </div>

      <ExcalidrawBoard
        key={board.id}
        initialData={currentData}
        onChange={handleChange}
      />
    </main>
  );
}