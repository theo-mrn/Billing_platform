import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    console.log('Starting registration process');
    const { name, email, password } = await req.json();
    console.log('Registration data received:', { name, email, hasPassword: !!password });

    if (!email || !password) {
      console.error('Missing required fields:', { hasEmail: !!email, hasPassword: !!password });
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    console.log('Checking if user exists:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: "Cet utilisateur existe déjà." },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur et son organisation par défaut dans une transaction
    console.log('Starting transaction for user and organization creation');
    const result = await prisma.$transaction(async (prisma) => {
      // Créer l'utilisateur
      console.log('Creating user');
      const newUser = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          password: hashedPassword,
        },
      });
      console.log('User created successfully:', newUser.id);

      // Créer une organisation par défaut pour l'utilisateur
      console.log('Creating default organization');
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
        include: {
          projects: true,
          users: true
        }
      });
      console.log('Organization created successfully:', {
        organizationId: organization.id,
        projects: organization.projects.length,
        users: organization.users.length
      });

      return { user: newUser, organization };
    });
    console.log('Transaction completed successfully');

    // Ajouter l'utilisateur à l'audience Resend
    try {
      console.log('Adding user to Resend');
      await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID!,
        unsubscribed: false,
      });
      console.log('User added to Resend successfully');
    } catch (resendError) {
      console.error("Erreur lors de l'ajout à Resend:", resendError);
      // On continue même si l'ajout à Resend échoue
    }

    console.log('Registration process completed successfully');
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
    console.error("Erreur fatale lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}