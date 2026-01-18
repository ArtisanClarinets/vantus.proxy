import Link from "next/link";
import { prisma } from "database";
import { notFound } from "next/navigation";

export default async function TenantLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: Promise<{ tenantId: string }>
}) {
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
    });

    if (!tenant) notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{tenant.name} <span className="text-gray-400 text-lg">({tenant.slug})</span></h1>
                <Link href="/app/tenants" className="text-gray-500 hover:text-gray-900">Back to List</Link>
            </div>
            <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="-mb-px flex space-x-8">
                    {[
                        ['Overview', `/app/tenants/${tenantId}/overview`],
                        ['Domains', `/app/tenants/${tenantId}/domains`],
                        ['Certificates', `/app/tenants/${tenantId}/certificates`],
                        ['Upstreams', `/app/tenants/${tenantId}/upstreams`],
                        ['Edge Policies', `/app/tenants/${tenantId}/edge-policies`],
                        ['Deployments', `/app/tenants/${tenantId}/deployments`],
                        ['Logs', `/app/tenants/${tenantId}/logs`],
                        ['Metrics', `/app/tenants/${tenantId}/metrics`],
                        ['Audit', `/app/tenants/${tenantId}/audit-log`],
                        ['Settings', `/app/tenants/${tenantId}/settings`],
                    ].map(([name, href]) => (
                        <Link
                            key={name}
                            href={href}
                            className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        >
                            {name}
                        </Link>
                    ))}
                </nav>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}
