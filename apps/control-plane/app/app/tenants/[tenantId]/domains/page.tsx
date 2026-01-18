import { prisma } from "database";

export default async function TenantDomains({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const domains = await prisma.domain.findMany({ where: { tenantId } });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Domains</h2>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add Domain</button>
            </div>
            <div className="bg-white shadow overflow-hidden rounded-md">
                <ul className="divide-y divide-gray-200">
                    {domains.map(d => (
                        <li key={d.id} className="px-6 py-4 flex justify-between items-center">
                            <div>
                                <div className="font-medium text-gray-900">{d.name}</div>
                                <div className="text-xs text-gray-500">ID: {d.id}</div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                            </span>
                        </li>
                    ))}
                    {domains.length === 0 && <li className="px-6 py-4 text-gray-500 text-center">No domains found.</li>}
                </ul>
            </div>
        </div>
    );
}
