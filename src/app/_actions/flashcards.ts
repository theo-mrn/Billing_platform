'use server';

import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getProjectFlashcards(projectId: string, deckId?: string) {
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
            flashcards: {
              include: {
                progress: {
                  where: {
                    userId: session.user.id
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!userProject) {
      throw new Error('Projet non trouvé ou accès refusé');
    }

    if (deckId) {
      const deck = userProject.decks.find(d => d.id === deckId);
      if (!deck) {
        throw new Error('Paquet non trouvé');
      }
      return { flashcards: deck.flashcards };
    }

    // Si aucun deckId n'est spécifié, retourner toutes les flashcards du projet
    const allFlashcards = userProject.decks.flatMap(deck => deck.flashcards);
    return { flashcards: allFlashcards };
  } catch (error) {
    console.error('[GET_FLASHCARDS]', error);
    throw new Error('Impossible de récupérer les cartes');
  }
}

export async function createFlashcard(projectId: string, deckId: string, data: { question: string; answer: string }) {
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

    const flashcard = await prisma.flashcard.create({
      data: {
        question: data.question,
        answer: data.answer,
        projectId,
        deckId,
      },
      include: {
        progress: {
          where: {
            userId: session.user.id
          }
        }
      }
    });

    revalidatePath(`/projects/${projectId}/flashcards`);
    return { flashcard };
  } catch (error) {
    console.error('[CREATE_FLASHCARD]', error);
    if (error instanceof Error) {
      throw new Error(`Impossible de créer la carte : ${error.message}`);
    }
    throw new Error('Impossible de créer la carte : Erreur inconnue');
  }
}

export async function deleteFlashcard(projectId: string, flashcardId: string) {
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

    await prisma.flashcard.delete({
      where: {
        id: flashcardId,
        projectId,
      },
    });

    revalidatePath(`/projects/${projectId}/flashcards`);
    return { success: true };
  } catch (error) {
    console.error('[DELETE_FLASHCARD]', error);
    throw new Error('Impossible de supprimer la carte');
  }
}

export async function updateFlashcard(projectId: string, flashcardId: string, data: { question: string; answer: string }) {
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

    const flashcard = await prisma.flashcard.update({
      where: {
        id: flashcardId,
        projectId,
      },
      data: {
        question: data.question,
        answer: data.answer,
      },
      include: {
        progress: {
          where: {
            userId: session.user.id
          }
        }
      }
    });

    revalidatePath(`/projects/${projectId}/flashcards`);
    return { flashcard };
  } catch (error) {
    console.error('[UPDATE_FLASHCARD]', error);
    throw new Error('Impossible de mettre à jour la carte');
  }
}

export async function updateFlashcardProgress(projectId: string, flashcardId: string, quality: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
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
      throw new Error('Project not found or access denied');
    }

    // Calculer le nouvel intervalle et facteur de facilité selon l'algorithme SM-2
    const progress = await prisma.flashcardProgress.findUnique({
      where: {
        userId_flashcardId: {
          userId: session.user.id,
          flashcardId,
        }
      }
    });

    let easeFactor = progress?.easeFactor || 2.5;
    let interval = progress?.interval || 1;

    if (quality >= 3) {
      if (!progress) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }

      // Ajuster le facteur de facilité
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    } else {
      // Si la réponse est mauvaise, on recommence depuis le début
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const updatedProgress = await prisma.flashcardProgress.upsert({
      where: {
        userId_flashcardId: {
          userId: session.user.id,
          flashcardId,
        }
      },
      update: {
        lastReviewed: new Date(),
        nextReview,
        easeFactor,
        interval,
      },
      create: {
        userId: session.user.id,
        flashcardId,
        lastReviewed: new Date(),
        nextReview,
        easeFactor,
        interval,
      },
    });

    revalidatePath(`/projects/${projectId}/flashcards`);
    return { progress: updatedProgress };
  } catch (error) {
    console.error('[UPDATE_FLASHCARD_PROGRESS]', error);
    throw new Error('Failed to update flashcard progress');
  }
} 