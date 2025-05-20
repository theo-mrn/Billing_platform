import { Metadata } from "next";
import DraftCreator from "./components/DraftCreator";

// Cette page ne sera pas pré-rendue
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Aucune génération statique
export async function generateStaticParams() {
  return [];
}

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
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ draftId?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { draftId } = resolvedSearchParams;
  const projectId = resolvedParams.id;

  // Si aucun draftId n'est fourni, nous affichons un composant client qui créera un draft
  if (!draftId) {
    return <DraftCreator projectId={projectId} />;
  }

  // S'il y a un draftId, on redirige vers la version client
  return (
    <meta httpEquiv="refresh" content={`0; url=/client-projects/${projectId}/draft?draftId=${draftId}`} />
  );
}
