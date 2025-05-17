import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { Resend } from "resend";
import fs from 'fs';
import path from 'path';
import type { Session } from "next-auth";

const resend = new Resend(process.env.RESEND_API_KEY);

function logToFile(message: string) {
  const logPath = path.join(process.cwd(), 'invitation-debug.log');
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
}

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not set");
}

if (!process.env.NEXTAUTH_URL) {
  console.error("NEXTAUTH_URL is not set");
}

// Créer une nouvelle invitation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    logToFile('1. Début de la création d\'invitation');
    const [session, { id: organizationId }] = await Promise.all([
      getServerSession(authOptions) as Promise<Session | null>,
      params
    ]);

    if (!session?.user?.email || !session?.user?.id) {
      logToFile('2. Pas de session utilisateur');
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { email, role = "MEMBER" } = await request.json();
    logToFile(`3. Email reçu (optionnel): ${email}`);

    // Vérifier que l'utilisateur a les droits sur cette organisation
    logToFile('4. Vérification des droits pour l\'organisation: ' + organizationId);
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: "OWNER", // Seul le propriétaire peut envoyer des invitations
      },
      include: {
        organization: true,
      },
    });

    if (!userOrg) {
      logToFile('5. Utilisateur non autorisé');
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Si un email est fourni, faire les vérifications supplémentaires
    if (email) {
      logToFile('6. Vérification si l\'utilisateur est déjà membre');
      // Vérifier si l'utilisateur est déjà membre
      const existingMember = await prisma.userOrganization.findFirst({
        where: {
          organizationId,
          user: {
            email,
          },
        },
      });

      if (existingMember) {
        logToFile('7. Utilisateur déjà membre');
        return NextResponse.json(
          { error: "Cet utilisateur est déjà membre de l'organisation" },
          { status: 400 }
        );
      }

      logToFile('8. Vérification des invitations existantes');
      // Vérifier si une invitation est déjà en attente
      const existingInvitation = await prisma.organizationInvitation.findFirst({
        where: {
          organizationId,
          email,
          status: "PENDING",
        },
      });

      if (existingInvitation) {
        logToFile('9. Invitation déjà en attente');
        return NextResponse.json(
          { error: "Une invitation est déjà en attente pour cet email" },
          { status: 400 }
        );
      }
    }

    // Créer un token unique pour l'invitation
    logToFile('10. Création du token');
    const token = crypto.randomBytes(32).toString("hex");

    // Créer l'invitation
    logToFile('11. Création de l\'invitation dans la base de données');
    const invitationData = {
      role,
      organizationId,
      invitedById: session.user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    };

    // Ajouter l'email seulement s'il est fourni
    if (email) {
      Object.assign(invitationData, { email });
    }

    const invitation = await prisma.organizationInvitation.create({
      data: invitationData,
    });

    // Si un email est fourni, envoyer l'invitation par email
    if (email && process.env.RESEND_API_KEY) {
      logToFile('12. Préparation de l\'envoi d\'email');
      const inviteUrl = `${process.env.NEXTAUTH_URL}/invitation/${token}`;
      
      try {
        logToFile('13. Tentative d\'envoi d\'email');
        logToFile(`RESEND_API_KEY présente: ${!!process.env.RESEND_API_KEY}`);
        
        // Configuration de l'email selon l'environnement
        const emailConfig = {
          from: process.env.NODE_ENV === 'development' 
            ? `Test <${process.env.RESEND_TEST_EMAIL || 'onboarding@resend.dev'}>`
            : 'Acme <onboarding@resend.dev>',
          to: process.env.NODE_ENV === 'development' ? (process.env.RESEND_TEST_EMAIL || email) : email,
          subject: `Invitation à rejoindre ${userOrg.organization.name}`,
          html: `
            <h1>Vous avez été invité à rejoindre ${userOrg.organization.name}</h1>
            <p>${session.user.name || session.user.email} vous invite à rejoindre l'organisation ${userOrg.organization.name}.</p>
            <p>Pour accepter l'invitation, cliquez sur le lien ci-dessous :</p>
            <a href="${inviteUrl}">Accepter l'invitation</a>
            <p>Ce lien expirera dans 7 jours.</p>
            ${process.env.NODE_ENV === 'development' ? 
              `<p style="color: #666; font-size: 12px;">Note: En mode développement, tous les emails sont envoyés à ${process.env.RESEND_TEST_EMAIL || email}</p>` 
              : ''
            }
          `,
        };

        logToFile(`14. Configuration email: ${JSON.stringify({ ...emailConfig, html: '[HTML Content]' })}`);
        
        const emailResult = await resend.emails.send(emailConfig);
        
        logToFile(`15. Résultat de l'envoi d'email: ${JSON.stringify(emailResult)}`);

        if (emailResult.error) {
          throw new Error(emailResult.error.message);
        }
      } catch (error) {
        logToFile(`16. ERREUR lors de l'envoi d'email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        if (error instanceof Error) {
          logToFile(`Stack trace: ${error.stack}`);
        }

        // Message d'erreur plus détaillé pour l'utilisateur
        let errorMessage = "Erreur lors de l'envoi de l'email d'invitation.";
        if (process.env.NODE_ENV === 'development') {
          errorMessage += " En mode développement, assurez-vous que RESEND_TEST_EMAIL est configuré dans .env";
        } else {
          errorMessage += " Veuillez contacter l'administrateur.";
        }

        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }
    }

    // Construire l'URL d'invitation
    const inviteUrl = `${process.env.NEXTAUTH_URL}/invitation/${token}`;

    logToFile('17. Fin du processus');
    return NextResponse.json({
      ...invitation,
      inviteUrl
    }, { status: 201 });
  } catch (error) {
    logToFile(`18. Erreur générale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'invitation" },
      { status: 500 }
    );
  }
}

// Récupérer toutes les invitations d'une organisation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, { id: organizationId }] = await Promise.all([
      getServerSession(authOptions) as Promise<Session | null>,
      params
    ]);

    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a les droits sur cette organisation
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId,
        status: "PENDING",
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des invitations" },
      { status: 500 }
    );
  }
} 