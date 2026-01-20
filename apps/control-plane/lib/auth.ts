import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "database";

/**
 * Better Auth Configuration
 * 
 * Configures the authentication system using Prisma adapter.
 * Supports Email/Password authentication with verification.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    /**
     * Send Reset Password Email
     * @param {Object} params - The params object.
     * @param {Object} params.user - The user object.
     * @param {string} params.url - The reset URL.
     */
    sendResetPassword: async ({ user, url, token }) => {
        // In production, use a real email provider (e.g., Resend, SendGrid)
        console.log(`[AUTH] Reset password for ${user.email}: ${url}`);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    /**
     * Send Verification Email
     * @param {Object} params - The params object.
     * @param {Object} params.user - The user object.
     * @param {string} params.url - The verification URL.
     */
    sendVerificationEmail: async ({ user, url, token }) => {
        // In production, use a real email provider
        console.log(`[AUTH] Verify email for ${user.email}: ${url}`);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      // mapping if needed, but we use standard fields
    }
  },
  plugins: [
      // Add rate limiting or other plugins here if needed
  ]
});
