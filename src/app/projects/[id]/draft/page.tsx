import { getBoards } from "./actions";
import DraftClient from "./DraftClient";
import { ExcalidrawData } from "@/types/excalidraw";
import { Metadata } from "next";

interface ExcalidrawBoardType {
  id: string;
  name: string;
  data: ExcalidrawData;
}

function isExcalidrawData(data: unknown): data is ExcalidrawData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.elements) &&
    typeof d.appState === 'object' &&
    d.appState !== null &&
    typeof d.files === 'object' &&
    d.files !== null
  );
}

const DEFAULT_EXCALIDRAW_DATA: ExcalidrawData = {
  elements: [],
  appState: {
    collaborators: null,
    viewBackgroundColor: "#ffffff",
    currentItemFontFamily: 1,
    theme: "light",
    name: "",
  },
  files: {},
};

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Draft - Project ${resolvedParams.id}`,
  };
}

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const rawBoards = await getBoards(resolvedParams.id);
  const boards: ExcalidrawBoardType[] = rawBoards.map(board => ({
    id: board.id,
    name: board.name,
    data: isExcalidrawData(board.data) ? board.data : DEFAULT_EXCALIDRAW_DATA
  }));
  
  return <DraftClient initialBoards={boards} projectId={resolvedParams.id} />;
}
