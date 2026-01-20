import { prisma } from "database";
export const dynamic = 'force-dynamic';

export default async function TenantEdgePolicies({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const policy = await prisma.edgePolicy.findUnique({ where: { tenantId } });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Edge Policy</h2>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit Policy</button>
            </div>
            <div className="bg-white p-6 rounded shadow border border-gray-200">
                {policy ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Custom Headers</h3>
                            <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-sm mt-1 font-mono text-blue-800">{JSON.stringify(policy.headers, null, 2)}</pre>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Rate Limits</h3>
                            <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-sm mt-1 font-mono text-purple-800">{JSON.stringify(policy.rateLimit, null, 2)}</pre>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">CORS</h3>
                            <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-sm mt-1 font-mono text-green-800">{JSON.stringify(policy.cors || "Default", null, 2)}</pre>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-center">No policy defined (using defaults).</div>
                )}
            </div>
        </div>
    );
}
