import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // ✅ Utilisation de bcryptjs
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet utilisateur existe déjà." },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name: name || email.split('@')[0], // Utilise la partie locale de l'email comme nom par défaut
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Ajouter l'utilisateur à l'audience Resend
    try {
      await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID!,
        unsubscribed: false,
      });
    } catch (resendError) {
      console.error("Erreur lors de l'ajout à Resend:", resendError);
      // On continue même si l'ajout à Resend échoue
    }

    return NextResponse.json(
      { 
        user: newUser,
        message: "Inscription réussie"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}