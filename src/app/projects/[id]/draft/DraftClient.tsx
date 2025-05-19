"use client";
import React, { useState, useRef, useCallback } from "react";
import ExcalidrawBoard from "./components/ExcalidrawBoard";
import { createBoard, updateBoard } from "./actions";
import { useSearchParams, useRouter } from "next/navigation";
import { ExcalidrawData } from "@/types/excalidraw";

interface ExcalidrawBoardType {
  id: string;
  name: string;
  data: ExcalidrawData;
}

export default function DraftClient({ initialBoards, projectId }: { initialBoards: ExcalidrawBoardType[]; projectId: string }) {
  const [boards, setBoards] = useState<ExcalidrawBoardType[]>(initialBoards);
  const searchParams = useSearchParams();
  const router = useRouter();
  const draftId = searchParams.get("draftId");
  const [loading, setLoading] = useState(false);

  const selectedBoard = boards.find(b => b.id === draftId) || boards[0] || null;
  const [scenes, setScenes] = useState<Record<string, ExcalidrawData>>(
    () => Object.fromEntries(boards.map(b => [b.id, b.data]))
  );

  // Ref pour le timeout de debounce
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Créer un board
  const handleCreate = async () => {
    const name = prompt("Nom du nouveau tableau ?");
    if (!name) return;
    setLoading(true);
    const newBoard = await createBoard(projectId, name);
    setBoards([newBoard, ...boards]);
    setScenes(prev => ({ ...prev, [newBoard.id]: newBoard.data }));
    router.replace(`?draftId=${newBoard.id}`);
    setLoading(false);
  };

  // Sélectionner un board et mettre à jour l'URL
  const handleSelect = (board: ExcalidrawBoardType) => {
    router.replace(`?draftId=${board.id}`);
  };

  // Sauvegarder un board (debounce)
  const handleChange = useCallback((data: ExcalidrawData) => {
    if (!selectedBoard) return;

    // Mettre à jour la scène locale immédiatement
    setScenes(prev => ({
      ...prev,
      [selectedBoard.id]: data
    }));

    // Debounce la sauvegarde sur le serveur
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        await updateBoard(selectedBoard.id, data);
        setBoards(prevBoards =>
          prevBoards.map(b =>
            b.id === selectedBoard.id
              ? { ...b, data }
              : b
          )
        );
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }, 1000);
  }, [selectedBoard]);

  if (!selectedBoard) {
    return <p>Sélectionnez ou créez un tableau pour commencer.</p>;
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tableaux Excalidraw</h1>
      <button 
        onClick={handleCreate} 
        disabled={loading} 
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Nouveau tableau
      </button>
      <ul className="mb-4 flex gap-2">
        {boards.map(board => (
          <li key={board.id}>
            <button
              className={`px-2 py-1 rounded ${selectedBoard?.id === board.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => handleSelect(board)}
            >
              {board.name}
            </button>
          </li>
        ))}
      </ul>
      <ExcalidrawBoard
        key={selectedBoard.id}
        initialData={scenes[selectedBoard.id] || selectedBoard.data}
        onChange={handleChange}
      />
    </main>
  );
} 