import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, unsubscribe } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { email },
      update: { isSubscribed: !unsubscribe },
      create: { 
        email,
        isSubscribed: !unsubscribe
      }
    });

    return NextResponse.json({ message: unsubscribe ? "Désinscription réussie" : "Réinscription réussie" }, { status: 200 });
  } catch (error) {
    console.error("Erreur de mise à jour:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'abonnement" }, { status: 500 });
  }
}