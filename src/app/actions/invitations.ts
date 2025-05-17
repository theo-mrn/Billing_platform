'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";
import { hasPermission } from "@/lib/permissions";
import type { OrganizationRole } from "@/lib/permissions";
import crypto from "crypto";

export async function getInvitation(token: string) {
  const invitation = await prisma.organizationInvitation.findUnique({
    where: { token },
    include: {
      organization: true,
    },
  });

  if (!invitation) {
    throw new Error("Invitation non trouvée");
  }

  return invitation;
}

export async function acceptInvitation(token: string) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const invitation = await prisma.organizationInvitation.findUnique({
    where: { token },
    include: {
      organization: true,
    },
  });

  if (!invitation) {
    throw new Error("Invitation non trouvée");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Cette invitation n'est plus valide");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Cette invitation a expiré");
  }

  if (invitation.email && invitation.email !== session.user.email) {
    throw new Error("Cette invitation ne vous est pas destinée");
  }

  // Vérifier si l'utilisateur est déjà membre de l'organisation
  const existingMembership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
      },
    },
  });

  if (existingMembership) {
    throw new Error("Vous êtes déjà membre de cette organisation");
  }

  // Ajouter l'utilisateur à l'organisation
  await prisma.userOrganization.create({
    data: {
      userId: session.user.id,
      organizationId: invitation.organizationId,
      role: invitation.role,
    },
  });

  // Marquer l'invitation comme acceptée
  await prisma.organizationInvitation.update({
    where: { token },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/organization");
  return invitation.organization;
}

export async function createInvitation(data: {
  organizationId: string;
  email?: string;
  role: OrganizationRole;
}) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  // Vérifier que l'utilisateur a les droits pour inviter
  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: data.organizationId,
      },
    },
  });

  if (!userOrg || !hasPermission(userOrg.role, "canManageMembers")) {
    throw new Error("Non autorisé");
  }

  // Créer l'invitation
  const invitation = await prisma.organizationInvitation.create({
    data: {
      ...data,
      status: "PENDING",
      invitedById: session.user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    },
  });

  revalidatePath("/organization");
  return invitation;
}

export async function deleteInvitation(token: string) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const invitation = await prisma.organizationInvitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    throw new Error("Invitation non trouvée");
  }

  // Vérifier que l'utilisateur a les droits pour supprimer l'invitation
  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: invitation.organizationId,
      },
    },
  });

  if (!userOrg || !hasPermission(userOrg.role, "canManageMembers")) {
    throw new Error("Non autorisé");
  }

  await prisma.organizationInvitation.delete({
    where: { token },
  });

  revalidatePath("/organization");
} 