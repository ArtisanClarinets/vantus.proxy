import { prisma } from "database";

export default async function TenantUpstreams({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const pools = await prisma.upstreamPool.findMany({ where: { tenantId } });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Upstream Pools</h2>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Create Pool</button>
            </div>
            <div className="grid gap-4">
                {pools.map(pool => (
                    <div key={pool.id} className="bg-white p-4 rounded shadow border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-900">{pool.name}</h3>
                        <div className="mt-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Targets</h4>
                            <div className="mt-1 bg-gray-50 p-3 rounded text-sm font-mono whitespace-pre-wrap text-gray-700">
                                {JSON.stringify(pool.targets, null, 2)}
                            </div>
                        </div>
                    </div>
                ))}
                {pools.length === 0 && <div className="text-gray-500 text-center py-4">No upstream pools defined.</div>}
            </div>
        </div>
    );
}
