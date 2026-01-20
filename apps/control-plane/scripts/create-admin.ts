import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <password>');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
        // role: 'OWNER' // User has no role in this schema
    },
    create: {
      email,
      name: email.split('@')[0],
      emailVerified: true,
      // role: 'OWNER'
    },
  });

  // Create/Update Credential Account
  const account = await prisma.account.findFirst({
      where: { userId: user.id, providerId: 'credential' }
  });

  if (account) {
      await prisma.account.update({
          where: { id: account.id },
          data: { password: hashedPassword }
      });
  } else {
      await prisma.account.create({
          data: {
              userId: user.id,
              accountId: email, // Usually the email for credentials
              providerId: 'credential',
              password: hashedPassword,
          }
      });
  }

  console.log(`User ${user.email} created/updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
