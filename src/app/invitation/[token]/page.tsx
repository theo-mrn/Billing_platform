import { Metadata } from "next";
import InvitationClient from "./InvitationClient";

export const metadata: Metadata = {
  title: "Invitation",
  description: "Accepter une invitation à rejoindre une organisation",
};

type PageProps = {
  params: Promise<{ token: string }>;
}

export default async function InvitationPage(props: PageProps) {
  const { token } = await props.params;
  return <InvitationClient token={token} />;
} 