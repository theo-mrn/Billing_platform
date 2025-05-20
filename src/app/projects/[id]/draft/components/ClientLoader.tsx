"use client";

import React, { useState, useEffect } from "react";
import { ExcalidrawData } from "@/types/excalidraw";

interface ExcalidrawBoardType {
  id: string;
  name: string;
  data: ExcalidrawData;
}

interface DraftClientLoaderProps {
  initialBoards: ExcalidrawBoardType[];
}

// Composant de chargement
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Chargement de l&apos;éditeur...</p>
      </div>
    </div>
  );
}

export default function ClientLoader({ 
  initialBoards 
}: { 
  initialBoards: ExcalidrawBoardType[] 
}) {
  const [DraftClientLoader, setDraftClientLoader] = useState<React.ComponentType<DraftClientLoaderProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Nous importons le module uniquement côté client
    import('./DraftClientLoader').then((mod) => {
      setDraftClientLoader(() => mod.default);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !DraftClientLoader) {
    return <LoadingIndicator />;
  }

  return <DraftClientLoader initialBoards={initialBoards} />;
} 