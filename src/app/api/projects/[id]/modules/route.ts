import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

interface ApiError extends Error {
  message: string;
  stack?: string;
}

const logPath = path.join(process.cwd(), "module-debug.log");

function log(message: string) {
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
}

// GET /api/projects/[id]/modules
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      log("GET - Unauthorized access attempt");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: projectId } = params;
    log(`GET - Fetching modules for project ${projectId}`);

    // Vérifier que le projet existe et que l'utilisateur y a accès
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
      log(`GET - Project ${projectId} not found or access denied`);
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    const modules = await prisma.module.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    log(`GET - Successfully retrieved ${modules.length} modules for project ${projectId}`);
    return NextResponse.json(modules);
  } catch (error) {
    const apiError = error as ApiError;
    log(`GET - Error: ${apiError.message}\n${apiError.stack}`);
    console.error("Error in GET /api/projects/[id]/modules:", apiError);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des modules" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/modules
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      log("POST - Unauthorized access attempt");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: projectId } = params;
    const body = await request.json();
    log(`POST - Creating module for project ${projectId} with data: ${JSON.stringify(body)}`);
    const { name, description, type } = body;

    // Vérifier que le projet existe et que l'utilisateur y a accès
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
      log(`POST - Project ${projectId} not found or access denied`);
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    const newModule = await prisma.module.create({
      data: {
        name,
        description,
        type,
        isActive: true,
        settings: {} as Record<string, never>,
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });

    log(`POST - Successfully created module ${newModule.id} for project ${projectId}`);
    return NextResponse.json(newModule);
  } catch (error) {
    const apiError = error as ApiError;
    log(`POST - Error: ${apiError.message}\n${apiError.stack}`);
    console.error("Error in POST /api/projects/[id]/modules:", apiError);
    return NextResponse.json(
      { error: "Erreur lors de la création du module" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id]/modules/[moduleId]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      log("PATCH - Unauthorized access attempt");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: projectId, moduleId } = params;
    const body = await request.json();
    log(`PATCH - Updating module ${moduleId} in project ${projectId} with data: ${JSON.stringify(body)}`);
    const { name, description, type } = body;

    // Vérifier que le module existe et que l'utilisateur y a accès
    const existingModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        projectId: projectId,
        project: {
          organization: {
            users: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!existingModule) {
      log(`PATCH - Module ${moduleId} not found or access denied`);
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    const updatedModule = await prisma.module.update({
      where: {
        id: moduleId,
      },
      data: {
        name,
        description,
        type,
      },
    });

    log(`PATCH - Successfully updated module ${moduleId}`);
    return NextResponse.json(updatedModule);
  } catch (error) {
    const apiError = error as ApiError;
    log(`PATCH - Error: ${apiError.message}\n${apiError.stack}`);
    console.error("Error in PATCH /api/projects/[id]/modules/[moduleId]:", apiError);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du module" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/modules/[moduleId]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      log("DELETE - Unauthorized access attempt");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: projectId, moduleId } = params;
    log(`DELETE - Attempting to delete module ${moduleId} from project ${projectId}`);

    // Vérifier que le module existe et que l'utilisateur y a accès
    const existingModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        projectId: projectId,
        project: {
          organization: {
            users: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!existingModule) {
      log(`DELETE - Module ${moduleId} not found or access denied`);
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    await prisma.module.delete({
      where: {
        id: moduleId,
      },
    });

    log(`DELETE - Successfully deleted module ${moduleId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    const apiError = error as ApiError;
    log(`DELETE - Error: ${apiError.message}\n${apiError.stack}`);
    console.error("Error in DELETE /api/projects/[id]/modules/[moduleId]:", apiError);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du module" },
      { status: 500 }
    );
  }
} 