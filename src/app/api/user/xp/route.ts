import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Fonction pour calculer le niveau en fonction de l'XP
function calculateLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log('Attempting to upsert user with email:', session.user.email);
    
    // Try to find or create the user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {}, // No updates needed
      create: {
        email: session.user.email,
        name: session.user.name || '',
        image: session.user.image || '',
      },
      select: { xp: true, level: true },
    });

    console.log('User data:', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in XP GET route:', error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { xpAmount } = await request.json();

  if (typeof xpAmount !== "number" || xpAmount < 0) {
    return NextResponse.json(
      { error: "Montant d'XP invalide" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { xp: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  const newXP = user.xp + xpAmount;
  const newLevel = calculateLevel(newXP);

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      xp: newXP,
      level: newLevel,
    },
    select: { xp: true, level: true },
  });

  return NextResponse.json(updatedUser);
} 