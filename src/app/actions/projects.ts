'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";
import { revalidatePath } from "next/cache";

export async function getProjects(organizationId: string) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });

  if (!userOrg) {
    throw new Error("Non autorisé");
  }

  const projects = await prisma.project.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

export async function getProject(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organization: {
        users: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Projet non trouvé ou accès refusé");
  }

  return project;
}

export async function createProject(data: {
  name: string;
  description?: string;
  organizationId: string;
}) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const userOrg = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: data.organizationId,
      },
    },
  });

  if (!userOrg) {
    throw new Error("Non autorisé");
  }

  const project = await prisma.project.create({
    data,
  });

  revalidatePath("/projects");
  return project;
}

export async function updateProject(
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

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          users: {
            where: {
              userId: session.user.id,
            },
          },
        },
      },
    },
  });

  if (!project || project.organization.users.length === 0) {
    throw new Error("Projet non trouvé ou non autorisé");
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data,
  });

  revalidatePath("/projects");
  return updatedProject;
}

export async function deleteProject(id: string) {
  const session = (await getServerSession(authOptions)) as Session | null;
  if (!session?.user?.email) {
    throw new Error("Non authentifié");
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          users: {
            where: {
              userId: session.user.id,
            },
          },
        },
      },
    },
  });

  if (!project || project.organization.users.length === 0) {
    throw new Error("Projet non trouvé ou non autorisé");
  }

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/projects");
}

export async function getProjectModules(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  const modules = await prisma.module.findMany({
    where: {
      projectId,
    },
  });

  return modules;
} 