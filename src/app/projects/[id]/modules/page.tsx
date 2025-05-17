import { Metadata } from "next";
import ModulesClient from "./ModulesClient";

export const metadata: Metadata = {
  title: "Modules",
  description: "Gérer les modules du projet",
};

type PageProps = {
  params: Promise<{ id: string }>;
}

export default async function ModulesPage(props: PageProps) {
  const { id } = await props.params;
  return <ModulesClient id={id} />;
} 