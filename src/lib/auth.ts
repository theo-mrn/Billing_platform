import { type NextAuthOptions } from "next-auth";   
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { Session } from "next-auth";
import { type JWT } from "next-auth/jwt";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          },
        });

        if (!user || !user.password) return null;

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) return null;

        // Return user data without the password
        const { id, email, name } = user;
        return { id, email, name };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile });
      
      if (!user.email) {
        console.log('No email provided');
        return false;
      }
      
      try {
        await resend.contacts.create({
          email: user.email,
          audienceId: process.env.RESEND_AUDIENCE_ID!,
          unsubscribed: false,
        });
        console.log(`Utilisateur ajouté à Resend: ${user.email}`);
        return true;
      } catch (error) {
        console.error("Erreur lors de l'ajout à Resend", error);
        return true; // Continue même si Resend échoue
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl });
      
      // Use the environment variable for the base URL
      const correctBaseUrl = process.env.NEXT_PUBLIC_APP_URL || baseUrl;
      
      // If the url is already an absolute URL that starts with the correct base URL
      if (url.startsWith(correctBaseUrl)) {
        console.log('Returning full URL:', url);
        return url;
      }
      
      // If the url is a relative path
      if (url.startsWith('/')) {
        const finalUrl = `${correctBaseUrl}${url}`;
        console.log('Returning relative URL:', finalUrl);
        return finalUrl;
      }
      
      // If the url is an absolute URL to a different domain
      if (url.startsWith('http')) {
        // For development, ensure we're using the correct URL
        if (process.env.NODE_ENV === 'development') {
          const localUrl = url.replace(baseUrl, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
          console.log('Returning local URL:', localUrl);
          return localUrl;
        }
        console.log('Returning external URL:', url);
        return url;
      }
      
      // Default fallback
      console.log('Returning baseUrl:', correctBaseUrl);
      return correctBaseUrl;
    },
  },
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
}; 