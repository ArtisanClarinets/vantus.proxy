import { prisma } from "database";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type Role = 'OWNER' | 'ADMIN' | 'OPERATOR' | 'VIEWER';

export async function getCurrentUser() {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { memberships: true }
    });
    return user;
}

export async function requireRole(allowedRoles: Role[], tenantId?: string) {
    const user = await getCurrentUser();
    if (!user) redirect('/auth/login');

    if (user.email === 'admin@vantus.systems') return user; // Super admin bypass for MVP

    if (tenantId) {
        const membership = user.memberships.find(m => m.tenantId === tenantId);
        if (!membership || !allowedRoles.includes(membership.role as Role)) {
            throw new Error("Unauthorized: Insufficient role");
        }
    } else {
        // Platform level check (must be OWNER of at least one tenant or have specific platform flag)
        // For now, allow if logged in, but in real app we'd have platform roles.
    }
    return user;
}

export async function logAudit(action: string, metadata: Prisma.InputJsonValue, tenantId?: string) {
    const user = await getCurrentUser();
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const ua = headersList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
        data: {
            actorId: user?.id || 'system',
            action,
            metadata: metadata ?? Prisma.JsonNull,
            tenantId,
            ip,
            userAgent: ua
        }
    });
}
