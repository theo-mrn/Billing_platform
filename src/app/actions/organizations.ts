'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hasPermission, canManageRole } from "@/lib/permissions";
import type { OrganizationRole } from "@/lib/permissions";
import type { Session } from "next-auth";

export async function getOrganizations() {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  return user.organizations.map((org) => ({
    ...org.organization,
    role: org.role,
  }));
}

export async function getOrganization(id: string) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      invitations: {
        where: {
          status: "PENDING",
        },
      },
    },
  });

  if (!organization) {
    throw new Error("Organisation non trouvée");
  }

  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: id,
      },
    },
  });

  if (!userOrg) {
    throw new Error("Non autorisé");
  }

  return {
    ...organization,
    role: userOrg.role,
  };
}

export async function createOrganization(data: {
  name: string;
  description?: string;
}) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const organization = await prisma.organization.create({
    data: {
      ...data,
      users: {
        create: {
          userId: session.user.id,
          role: "OWNER" as OrganizationRole,
        },
      },
      projects: {
        create: {
          name: "Default Project",
          description: "Default project created automatically",
          isDefault: true,
        },
      },
    },
  });

  revalidatePath("/organization");
  return organization;
}

export async function updateOrganization(
  id: string,
  data: {
    name?: string;
    description?: string;
  }
) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: id,
      },
    },
  });

  if (!userOrg || !hasPermission(userOrg.role, "canManageOrganization")) {
    throw new Error("Non autorisé");
  }

  const organization = await prisma.organization.update({
    where: { id },
    data,
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      invitations: {
        where: {
          status: "PENDING",
        },
      },
    },
  });

  revalidatePath("/organization");
  return organization;
}

export async function deleteOrganization(id: string) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: id,
      },
    },
  });

  if (!userOrg || !hasPermission(userOrg.role, "canManageOrganization")) {
    throw new Error("Non autorisé");
  }

  await prisma.organization.delete({
    where: { id },
  });

  revalidatePath("/organization");
}

export async function updateUserRole(
  organizationId: string,
  userId: string,
  role: OrganizationRole
) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const currentUserOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });

  const targetUserOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  if (
    !currentUserOrg ||
    !targetUserOrg ||
    !hasPermission(currentUserOrg.role, "canManageRoles") ||
    !canManageRole(currentUserOrg.role, targetUserOrg.role)
  ) {
    throw new Error("Non autorisé");
  }

  const updatedUserOrg = await prisma.userOrganization.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    data: { role },
  });

  revalidatePath("/organization");
  return updatedUserOrg;
}

export async function removeUser(organizationId: string, userId: string) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const currentUserOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });

  const targetUserOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  if (
    !currentUserOrg ||
    !targetUserOrg ||
    !hasPermission(currentUserOrg.role, "canManageMembers") ||
    targetUserOrg.role === "OWNER"
  ) {
    throw new Error("Non autorisé");
  }

  await prisma.userOrganization.delete({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });

  revalidatePath("/organization");
}

export async function updateMemberRole(organizationId: string, userId: string, newRole: OrganizationRole) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session) {
    throw new Error("Non authentifié");
  }

  // Vérifier que l'utilisateur actuel est membre de l'organisation
  const currentUserMembership = await prisma.userOrganization.findFirst({
    where: {
      organizationId,
      userId: session.user.id,
    },
  });

  if (!currentUserMembership) {
    throw new Error("Vous n'êtes pas membre de cette organisation");
  }

  // Vérifier les permissions
  if (!hasPermission(currentUserMembership.role as OrganizationRole, 'canManageRoles')) {
    throw new Error("Vous n'avez pas la permission de gérer les rôles");
  }

  // Vérifier que l'utilisateur peut gérer ce rôle
  if (!canManageRole(currentUserMembership.role as OrganizationRole, newRole)) {
    throw new Error("Vous n'avez pas la permission d'attribuer ce rôle");
  }

  // Mettre à jour le rôle
  const updatedMembership = await prisma.userOrganization.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    data: {
      role: newRole,
    },
  });

  revalidatePath(`/organization`);

  return updatedMembership;
} 