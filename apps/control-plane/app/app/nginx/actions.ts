'use server';
import { deployConfig } from '@/lib/proxy-control';
import { prisma } from '@/lib/db';
import { generateNginxConfig } from '@/lib/nginx-generator';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function deployTenantConfig(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { domains: true, upstreamPools: true, edgePolicies: true }
    });
    if (!tenant) throw new Error("Tenant not found");

    const config = generateNginxConfig(tenant);

    // Validate & Deploy
    await deployConfig(tenant.slug, config);

    const hash = crypto.createHash('sha256').update(config).digest('hex');

    // Record Deployment
    await prisma.deploymentHistory.create({
        data: {
            tenantId: tenant.id,
            hash: hash,
            status: 'SUCCESS',
            logs: 'Config Snapshot: ' + config.substring(0, 1000)
        }
    });

    revalidatePath(`/app/nginx/render-preview`);
    return { success: true };
}
