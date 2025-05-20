'use client';

import dynamic from "next/dynamic";
import { ExcalidrawData } from "@/types/excalidraw";
import React from "react";

const DraftClient = dynamic(() => import("../DraftClient"), {
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

interface ExcalidrawBoardType {
  id: string;
  name: string;
  data: ExcalidrawData;
}

interface DraftClientLoaderProps {
  initialBoards: ExcalidrawBoardType[];
}

// Wrap the component in a client-only wrapper
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

export default function DraftClientLoader({ initialBoards }: DraftClientLoaderProps) {
  return (
    <ClientOnly>
      <DraftClient initialBoards={initialBoards} />
    </ClientOnly>
  );
} 