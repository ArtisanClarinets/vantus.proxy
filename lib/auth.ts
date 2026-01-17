import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Strict Domain Restriction for Internal Control Plane
        if (!credentials.email.endsWith('@vantus.systems')) {
            console.log('Access denied: Invalid email domain');
            return null;
        }

        let user = await prisma.user.findUnique({
            where: { email: credentials.email }
        });

        // First time login for a valid domain user -> Create them (JIT Provisioning)
        // In production, this might be connected to an IdP (Okta/Google Workspace)
        if (!user) {
            const userCount = await prisma.user.count();
            user = await prisma.user.create({
                data: {
                    email: credentials.email,
                    name: credentials.email.split('@')[0],
                    role: userCount === 0 ? 'OWNER' : 'VIEWER' // First user is Owner
                }
            });
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.role = (user as any).role;
            token.id = user.id;
        }
        return token;
    },
    async session({ session, token }) {
        if (session.user) {
            (session.user as any).role = token.role;
            (session.user as any).id = token.id;
        }
        return session;
    }
  },
  pages: {
      signIn: '/auth/login',
  }
};
