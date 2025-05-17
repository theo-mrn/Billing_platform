import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; projectId: string }> }
) {
  const { id, projectId } = await context.params;
  
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a les droits sur cette organisation
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        organizationId: id,
        user: {
          email: session.user.email,
        },
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
      );
    }

    // Vérifier que le projet appartient bien à l'organisation
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le projet
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du projet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; projectId: string }> }
) {
  const { id, projectId } = await context.params;
  
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a les droits sur cette organisation
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        organizationId: id,
        user: {
          email: session.user.email,
        },
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier que le projet appartient bien à l'organisation
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Empêcher la suppression du projet par défaut
    if (project.isDefault) {
      return NextResponse.json(
        { error: "Impossible de supprimer le projet par défaut" },
        { status: 400 }
      );
    }

    // Supprimer le projet
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du projet" },
      { status: 500 }
    );
  }
} 