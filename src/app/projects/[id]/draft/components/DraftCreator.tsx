"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBoard } from "../actions";

interface DraftCreatorProps {
  projectId: string;
}

export default function DraftCreator({ projectId }: DraftCreatorProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createNewDraft() {
      try {
        // Créer un nouveau board avec un nom par défaut
        const newBoard = await createBoard(
          projectId,
          `Nouveau draft - ${new Date().toLocaleDateString()}`
        );

        // Rediriger vers la page du nouveau draft (côté client)
        router.push(`/client-projects/${projectId}/draft?draftId=${newBoard.id}`);
      } catch (error) {
        console.error("Erreur lors de la création d'un nouveau draft:", error);
        setError("Erreur lors de la création du draft. Veuillez réessayer.");
      }
    }

    createNewDraft();
  }, [projectId, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 p-4 rounded-lg shadow-md text-red-700">
          <h2 className="text-lg font-bold mb-2">Erreur</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4 text-xl">Création d&apos;un nouveau draft...</p>
      </div>
    </div>
  );
} 