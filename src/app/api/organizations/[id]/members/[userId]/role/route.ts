import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canManageRole } from "@/lib/permissions";
import type { OrganizationRole } from "@/lib/permissions";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a les droits sur cette organisation
    const currentUserOrg = await prisma.userOrganization.findFirst({
      where: {
        organizationId: params.id,
        userId: session.user.id,
      },
    });

    if (!currentUserOrg) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer le rôle actuel de l'utilisateur cible
    const targetUserOrg = await prisma.userOrganization.findFirst({
      where: {
        organizationId: params.id,
        userId: params.userId,
      },
    });

    if (!targetUserOrg) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    const { role } = await request.json();

    // Vérifier que le nouveau rôle est valide
    if (!['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a le droit de modifier ce rôle
    if (!canManageRole(currentUserOrg.role as OrganizationRole, role as OrganizationRole)) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour attribuer ce rôle" },
        { status: 403 }
      );
    }

    // Empêcher la modification du rôle du dernier OWNER
    if (targetUserOrg.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = await prisma.userOrganization.count({
        where: {
          organizationId: params.id,
          role: 'OWNER',
        },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Impossible de modifier le rôle du dernier propriétaire" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le rôle
    const updatedUserOrg = await prisma.userOrganization.update({
      where: {
        userId_organizationId: {
          userId: params.userId,
          organizationId: params.id,
        },
      },
      data: {
        role,
      },
    });

    return NextResponse.json(updatedUserOrg);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rôle" },
      { status: 500 }
    );
  }
} 