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
        password: hashedPassword,
        role: 'OWNER'
    },
    create: {
      email,
      name: email.split('@')[0],
      password: hashedPassword,
      role: 'OWNER'
    },
  });

  console.log(`User ${user.email} created/updated as OWNER.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
