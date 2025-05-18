'use server';

import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getProjectDecks(projectId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Non autorisé');
    }

    // Vérifier l'accès via UserOrganization
    const userProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          users: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        decks: {
          include: {
            flashcards: true
          }
        }
      }
    });

    if (!userProject) {
      throw new Error('Projet non trouvé ou accès refusé');
    }

    return { decks: userProject.decks };
  } catch (error) {
    console.error('[GET_DECKS]', error);
    throw new Error('Impossible de récupérer les paquets');
  }
}

export async function createDeck(projectId: string, data: { name: string; description?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Non autorisé');
    }

    // Vérifier l'accès via UserOrganization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organization: {
          projects: {
            some: {
              id: projectId
            }
          }
        }
      }
    });

    if (!userOrg) {
      throw new Error('Projet non trouvé ou accès refusé');
    }

    const deck = await prisma.deck.create({
      data: {
        name: data.name,
        description: data.description,
        projectId,
      },
      include: {
        flashcards: true
      }
    });

    revalidatePath(`/projects/${projectId}/flashcards`);
    return { deck };
  } catch (error) {
    console.error('[CREATE_DECK]', error);
    throw new Error('Impossible de créer le paquet');
  }
}

export async function updateDeck(projectId: string, deckId: string, data: { name: string; description?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Non autorisé');
    }

    // Vérifier l'accès via UserOrganization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organization: {
          projects: {
            some: {
              id: projectId
            }
          }
        }
      }
    });

    if (!userOrg) {
      throw new Error('Projet non trouvé ou accès refusé');
    }

    const deck = await prisma.deck.update({
      where: {
        id: deckId,
        projectId,
      },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        flashcards: true
      }
    });

    revalidatePath(`/projects/${projectId}/flashcards`);
    return { deck };
  } catch (error) {
    console.error('[UPDATE_DECK]', error);
    throw new Error('Impossible de mettre à jour le paquet');
  }
}

export async function deleteDeck(projectId: string, deckId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Non autorisé');
    }

    // Vérifier l'accès via UserOrganization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: session.user.id,
        organization: {
          projects: {
            some: {
              id: projectId
            }
          }
        }
      }
    });

    if (!userOrg) {
      throw new Error('Projet non trouvé ou accès refusé');
    }

    await prisma.deck.delete({
      where: {
        id: deckId,
        projectId,
      },
    });

    revalidatePath(`/projects/${projectId}/flashcards`);
    return { success: true };
  } catch (error) {
    console.error('[DELETE_DECK]', error);
    throw new Error('Impossible de supprimer le paquet');
  }
} 