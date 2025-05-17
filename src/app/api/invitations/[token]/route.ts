import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer l'invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token: params.token },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si l'invitation n'a pas expiré
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "L'invitation a expiré" },
        { status: 400 }
      );
    }

    // Si l'invitation a un email spécifique, vérifier qu'il correspond
    if (invitation.email && invitation.email !== session.user.email) {
      return NextResponse.json(
        { error: "Cette invitation n'est pas pour vous" },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur n'est pas déjà membre
    const existingMember = await prisma.userOrganization.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId: session.user.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Vous êtes déjà membre de cette organisation" },
        { status: 400 }
      );
    }

    // Ajouter l'utilisateur à l'organisation et marquer l'invitation comme acceptée
    const result = await prisma.$transaction([
      prisma.userOrganization.create({
        data: {
          userId: session.user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      }),
      prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { 
          status: "ACCEPTED",
          email: session.user.email // Mettre à jour l'email de l'invitation avec celui qui l'a acceptée
        },
      }),
    ]);

    return NextResponse.json({
      message: `Vous avez rejoint ${invitation.organization.name}`,
      organization: invitation.organization,
      membership: result[0],
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'acceptation de l'invitation" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer l'invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { token: params.token },
      include: {
        organization: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      organization: invitation.organization,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'invitation" },
      { status: 500 }
    );
  }
} 