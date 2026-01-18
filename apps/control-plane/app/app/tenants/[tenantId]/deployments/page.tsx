import { prisma } from "database";
import { getCurrentUser } from "@/lib/actions";

export default async function TenantDeployments({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    await getCurrentUser();

    const deployments = await prisma.deploymentHistory.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Deployment History</h2>
            <div className="bg-white shadow overflow-hidden rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hash</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logs</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {deployments.map(d => (
                            <tr key={d.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.createdAt.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{d.hash.substring(0, 8)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{d.logs}</td>
                            </tr>
                        ))}
                         {deployments.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No deployments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
