import { type NextAuthOptions } from "next-auth";   
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import type { OrganizationRole } from "./permissions";

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.NEXTAUTH_URL) {
  console.error("NEXTAUTH_URL is not set");
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error("NEXTAUTH_SECRET is not set");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_SECRET');
}

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Email ou mot de passe incorrect");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Email ou mot de passe incorrect");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      try {
        console.log('SignIn callback:', { user, account, profile });
        
        if (!user.email) {
          console.error('No email provided');
          return false;
        }

        // Vérifier si l'utilisateur existe et récupérer ses organisations
        let userWithOrg = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            organizations: true,
          },
        });

        // Si l'utilisateur n'existe pas, le créer
        if (!userWithOrg) {
          userWithOrg = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split('@')[0],
              image: user.image,
            },
            include: {
              organizations: true,
            },
          });
          console.log('Created new user:', userWithOrg.email);
        }

        // Si l'utilisateur n'a pas d'organisation, en créer une par défaut
        if (userWithOrg.organizations.length === 0) {
          try {
            await prisma.organization.create({
              data: {
                name: `${userWithOrg.name || userWithOrg.email?.split('@')[0]}'s Organization`,
                description: `Default organization for ${userWithOrg.name || userWithOrg.email}`,
                users: {
                  create: {
                    userId: userWithOrg.id,
                    role: 'OWNER' as OrganizationRole
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
            console.log('Created default organization for user:', userWithOrg.email);
          } catch (orgError) {
            console.error('Error creating organization:', orgError);
            // Continue même si la création de l'organisation échoue
          }
        }
        
        try {
          await resend.contacts.create({
            email: user.email,
            audienceId: process.env.RESEND_AUDIENCE_ID!,
            unsubscribed: false,
          });
          console.log(`Utilisateur ajouté à Resend: ${user.email}`);
        } catch (resendError) {
          console.error('Error adding user to Resend:', resendError);
          // Continue même si l'ajout à Resend échoue
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // Ensure baseUrl is correct for development
        if (process.env.NODE_ENV === 'development') {
          baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        }
        
        console.log('Redirect callback:', { url, baseUrl });
        
        // If relative URL, make it absolute
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        
        // If URL is already absolute, return it
        if (url.startsWith('http')) {
          return url;
        }
        
        // Default to baseUrl
        return baseUrl;
      } catch (error) {
        console.error("Error in redirect callback:", error);
        return baseUrl;
      }
    },
  },
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 