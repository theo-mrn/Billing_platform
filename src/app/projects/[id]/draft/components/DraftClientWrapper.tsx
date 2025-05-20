"use client";

import dynamic from "next/dynamic";
import { ExcalidrawData } from "@/types/excalidraw";

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

interface DraftClientWrapperProps {
  initialBoards: Array<{
    id: string;
    name: string;
    data: ExcalidrawData;
  }>;
}

export default function DraftClientWrapper({ initialBoards }: DraftClientWrapperProps) {
  return <DraftClient initialBoards={initialBoards} />;
} 