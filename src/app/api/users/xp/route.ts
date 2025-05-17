import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // On ajoute toujours 50 XP
    const xpAmount = 50;

    // 1. Récupérer l'utilisateur et son XP actuel
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { xp: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // 2. Calculer le nouvel XP total
    const newXP = (user.xp || 0) + xpAmount;

    // 3. Calculer le niveau (0-99 = niveau 0, 100-199 = niveau 1, etc.)
    const newLevel = Math.floor(newXP / 100);

    // 4. Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        xp: newXP,
        level: newLevel
      },
      select: {
        xp: true,
        level: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'XP:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 