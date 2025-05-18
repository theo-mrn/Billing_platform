import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const session = await getServerSession(authOptions) as Session | null;
    console.log('GET /api/organizations/[id]/projects - Session:', {
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      organizationId: id
    });

    if (!session?.user?.email) {
      console.error('No authenticated user');
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a accès à l'organisation
    console.log('Checking user organization access for:', {
      organizationId: id,
      userEmail: session.user.email
    });
    
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        organizationId: id,
        user: {
          email: session.user.email,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('User organization found:', {
      found: !!userOrg,
      role: userOrg?.role,
      orgName: userOrg?.organization?.name
    });

    if (!userOrg) {
      console.error('User not authorized:', {
        organizationId: id,
        userEmail: session.user.email
      });
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer tous les projets de l'organisation
    console.log('Fetching projects for organization:', id);
    const projects = await prisma.project.findMany({
      where: {
        organizationId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('Projects found:', {
      count: projects.length,
      projectNames: projects.map(p => p.name),
      hasDefaultProject: projects.some(p => p.isDefault)
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
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

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        name,
        description,
        organizationId: id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    );
  }
} 