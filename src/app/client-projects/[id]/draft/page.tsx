"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getBoards } from "@/app/projects/[id]/draft/actions";
import { ExcalidrawData } from "@/types/excalidraw";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
// Type pour les boards
interface BoardType {
  id: string;
  name: string;
  data: ExcalidrawData;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  folderId: string | null;
}

// Fonction utilitaire pour préparer les données côté client
function prepareBoard(board: BoardType): BoardType {
  // S'assurer que les données sont correctement formatées
  if (board && board.data) {
    // Créer une copie pour ne pas modifier l'original
    const preparedBoard = { ...board };
    
    // Initialiser l'appState si nécessaire
    if (!preparedBoard.data.appState) {
      preparedBoard.data.appState = {};
    }
    
    // Convertir les dates en objets Date
    if (typeof preparedBoard.createdAt === 'string') {
      preparedBoard.createdAt = new Date(preparedBoard.createdAt);
    }
    
    if (typeof preparedBoard.updatedAt === 'string') {
      preparedBoard.updatedAt = new Date(preparedBoard.updatedAt);
    }
    
    return preparedBoard;
  }
  
  return board;
}

// Chargement dynamique de DraftClient
const DraftClient = dynamic(() => import('@/app/projects/[id]/draft/DraftClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Chargement de l&apos;éditeur...</p>
      </div>
    </div>
  ),
});

export default function ClientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const projectId = params.id as string;
  
  const [board, setBoard] = useState<BoardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadBoard() {
      if (draftId && projectId) {
        setIsLoading(true);
        try {
          // Récupérer les planches
          const boards = await getBoards(projectId);
          
          // Trouver la planche spécifique
          const currentBoard = boards.find(b => b.id === draftId);
          
          if (currentBoard) {
            // Préparer le board avant de le stocker dans l'état
            setBoard(prepareBoard(currentBoard as BoardType));
          } else {
            console.error("Board not found");
          }
        } catch (error) {
          console.error("Error loading board:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadBoard();
  }, [draftId, projectId]);
  
  if (isLoading || !board) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement du brouillon...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <Link href={`/projects/${projectId}`}>
        <Button variant="outline">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour au projet
          </Button>
        </Link>
         
      </div>
      <div className="bg-white rounded-xl shadow-lg">
        <DraftClient initialBoards={[board]} />
      </div>
    </div>
  );
} 