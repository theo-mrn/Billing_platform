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
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
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
    error: "/login",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.sub = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      try {
        console.log('SignIn callback started:', { user, account, profile });
        
        if (!user.email) {
          console.error('No email provided');
          return false;
        }

        // Vérifier si l'utilisateur existe et récupérer ses organisations
        console.log('Checking if user exists:', user.email);
        let userWithOrg = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            organizations: true,
          },
        });
        console.log('User found:', userWithOrg ? 'yes' : 'no');

        // Si l'utilisateur n'existe pas, le créer
        if (!userWithOrg) {
          console.log('Creating new user:', user.email);
          try {
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
            console.log('Created new user successfully:', userWithOrg.email);
          } catch (createError) {
            console.error('Error creating user:', createError);
            throw createError;
          }
        }

        // Si l'utilisateur n'a pas d'organisation, en créer une par défaut
        if (userWithOrg.organizations.length === 0) {
          console.log('Creating default organization for user:', userWithOrg.email);
          try {
            const organization = await prisma.organization.create({
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
              }
            });
            console.log('Created default organization successfully:', {
              organizationId: organization.id
            });
          } catch (orgError) {
            console.error('Error creating organization:', orgError);
            throw orgError;
          }
        }
        
        return true;
      } catch (error) {
        console.error('Fatal error in signIn callback:', error);
        return false;
      }
    },
  },
  events: {
    async signIn({ user }) {
      console.log('User signed in:', user.email);
    },
    async signOut({ token }) {
      console.log('User signed out:', token.sub);
    },
    async error(error) {
      console.error('Auth error:', error);
    }
  }
}; 