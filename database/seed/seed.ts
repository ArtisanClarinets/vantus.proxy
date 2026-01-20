import { prisma, Role } from '../index';
import { hash } from 'bcryptjs';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vantus.systems';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  const passwordHash = await hash(adminPassword, 10);

  // Platform owner
  const owner = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Platform Owner',
      emailVerified: true,
    },
  });

  // Account for owner (Better Auth credential)
  // Check if account exists
  const existingAccount = await prisma.account.findFirst({
    where: { userId: owner.id, providerId: 'credential' }
  });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        userId: owner.id,
        accountId: owner.id,
        providerId: 'credential',
        password: passwordHash,
      }
    });
  }

  const tenants = [
    {
      slug: 'tenant1',
      name: 'Tenant One',
      domain: 'tenant1.localtest.me',
      upstream: 'tenant1-upstream:80'
    },
    {
      slug: 'tenant2',
      name: 'Tenant Two',
      domain: 'tenant2.localtest.me',
      upstream: 'tenant2-upstream:80'
    }
  ];

  for (const t of tenants) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        slug: t.slug,
        name: t.name,
      }
    });

    await prisma.domain.upsert({
      where: { name: t.domain },
      update: {},
      create: {
        name: t.domain,
        tenantId: tenant.id
      }
    });

    // Upstream Pool
    const existingPool = await prisma.upstreamPool.findFirst({
        where: { tenantId: tenant.id, name: 'default-pool' }
    });

    if (!existingPool) {
        const targets = [{ host: t.upstream.split(':')[0], port: 80, weight: 100 }];
        await prisma.upstreamPool.create({
            data: {
                name: 'default-pool',
                targets: targets,
                tenantId: tenant.id
            }
        });
    }

    // Edge Policy
    await prisma.edgePolicy.upsert({
        where: { tenantId: tenant.id },
        update: {},
        create: {
            tenantId: tenant.id,
            headers: { "X-Powered-By": "Vantus Proxy" },
            rateLimit: { rps: 100, burst: 200 }
        }
    });

    // Deployment History
    await prisma.deploymentHistory.create({
        data: {
            tenantId: tenant.id,
            hash: 'init-hash-' + t.slug,
            status: 'SUCCESS',
            logs: 'Initial seed deployment'
        }
    });

    // Membership for owner
    await prisma.membership.upsert({
        where: { userId_tenantId: { userId: owner.id, tenantId: tenant.id } },
        update: {},
        create: {
            userId: owner.id,
            tenantId: tenant.id,
            role: Role.OWNER
        }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
