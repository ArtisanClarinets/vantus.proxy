import { NextResponse } from 'next/server';
import { prisma } from 'database';
import { getCurrentUser } from '@/lib/actions';
import { billing } from '@/lib/billing';

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tenantId } = await req.json();
    if (!tenantId) return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
    });

    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    // Ensure customer exists
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
        const customer = await billing.customers.create({
            email: user.email,
            name: tenant.name,
            metadata: { tenantId: tenant.id }
        });
        customerId = customer.id;
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: { stripeCustomerId: customerId }
        });
    }

    const session = await billing.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/tenants/${tenantId}/settings`
    });

    return NextResponse.json({ url: session.url });
}
