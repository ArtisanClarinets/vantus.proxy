import { prisma } from "database";

export default async function TenantOverview({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;

    const domainCount = await prisma.domain.count({ where: { tenantId } });
    const poolCount = await prisma.upstreamPool.count({ where: { tenantId } });
    const lastDeployment = await prisma.deploymentHistory.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <div className="text-gray-500 text-sm uppercase font-medium">Domains</div>
                    <div className="mt-2 text-3xl font-bold">{domainCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <div className="text-gray-500 text-sm uppercase font-medium">Upstream Pools</div>
                    <div className="mt-2 text-3xl font-bold">{poolCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <div className="text-gray-500 text-sm uppercase font-medium">Last Deployment</div>
                    <div className="mt-2 text-lg font-semibold">{lastDeployment ? lastDeployment.status : 'Never'}</div>
                    <div className="text-xs text-gray-400">{lastDeployment?.createdAt.toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
}
