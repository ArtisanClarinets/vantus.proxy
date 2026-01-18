'use server';
import { deployConfig } from '@/lib/proxy-control';
import { prisma } from '@/lib/db';
import { generateNginxConfig } from '@/lib/nginx-generator';
import { revalidatePath } from 'next/cache';

export async function deployTenantConfig(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { domains: { include: { certificate: true } }, policy: true }
    });
    if (!tenant) throw new Error("Tenant not found");

    const config = generateNginxConfig(tenant);

    // Validate & Deploy
    await deployConfig(tenant.slug, config);

    // Record Deployment
    await prisma.deployment.create({
        data: {
            tenantId: tenant.id,
            configSnapshot: config,
            status: 'SUCCESS',
            deployedBy: 'SYSTEM'
        }
    });

    revalidatePath(`/app/nginx/render-preview`);
    return { success: true };
}
