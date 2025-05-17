import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    // Créer l'utilisateur et son organisation par défaut dans une transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Créer l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          password: hashedPassword,
        },
      });

      // Créer une organisation par défaut pour l'utilisateur
      const organization = await prisma.organization.create({
        data: {
          name: `${newUser.name}'s Organization`,
          description: `Default organization for ${newUser.name}`,
          users: {
            create: {
              userId: newUser.id,
              role: 'OWNER'
            }
          },
          projects: {
            create: {
              name: 'Default Project',
              description: 'Default project created automatically',
              isDefault: true
            }
          }
        },
      });

      return { user: newUser, organization };
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
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        organization: result.organization,
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