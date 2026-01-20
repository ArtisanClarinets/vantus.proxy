import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const logLevels: ('query' | 'info' | 'warn' | 'error')[] =
  process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error', 'warn'];

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: logLevels,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
