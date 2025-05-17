import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    // Vérifier que l'utilisateur a les droits sur cette organisation
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        organizationId: params.id,
        user: {
          email: session.user.email,
        },
        role: "OWNER", // Seul le propriétaire peut modifier l'organisation
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Mettre à jour l'organisation
    const updatedOrg = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name,
        description,
      },
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
      },
    });

    return NextResponse.json({
      id: updatedOrg.id,
      name: updatedOrg.name,
      description: updatedOrg.description,
      createdAt: updatedOrg.createdAt,
      updatedAt: updatedOrg.updatedAt,
      users: updatedOrg.users.map((userOrg) => ({
        user: userOrg.user,
        role: userOrg.role,
      })),
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'organisation" },
      { status: 500 }
    );
  }
} 