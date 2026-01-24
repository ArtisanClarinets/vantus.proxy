import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "database";

/**
 * Email Sender Interface
 * In a real production environment, replace the implementation of sendEmail
 * with a provider like Resend, SendGrid, or AWS SES.
 */
interface EmailOptions {
    to: string;
    subject: string;
    text: string;
}

async function sendEmail({ to, subject, text }: EmailOptions) {
    // Check for production email provider API keys here
    // if (process.env.RESEND_API_KEY) { ... }

    // For now, structured logging for development/simulation
    console.info(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        component: 'AUTH_EMAIL',
        action: 'SEND_EMAIL',
        to,
        subject,
        body_preview: text.substring(0, 50) + '...'
    }));
}

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
        await sendEmail({
            to: user.email,
            subject: "Reset your password",
            text: `Click here to reset your password: ${url}`
        });
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
        await sendEmail({
            to: user.email,
            subject: "Verify your email address",
            text: `Click here to verify your email address: ${url}`
        });
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
