import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userWithOrgs = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: {
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
            },
          },
        },
      },
    });

    if (!userWithOrgs || userWithOrgs.organizations.length === 0) {
      return NextResponse.json(
        { error: "Aucune organisation trouvée" },
        { status: 404 }
      );
    }

    // Transformer les données pour renvoyer un tableau d'organisations
    const organizations = userWithOrgs.organizations.map(org => ({
      id: org.organization.id,
      name: org.organization.name,
      description: org.organization.description,
      createdAt: org.organization.createdAt,
      updatedAt: org.organization.updatedAt,
      users: org.organization.users.map(userOrg => ({
        user: userOrg.user,
        role: userOrg.role,
      })),
    }));

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des organisations" },
      { status: 500 }
    );
  }
} 