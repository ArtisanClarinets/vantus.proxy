import { prisma } from "database";
import { getCurrentUser } from "@/lib/actions";

export default async function AuditLogsPage() {
    await getCurrentUser(); // Auth check
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { actor: true, tenant: true }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Platform Audit Logs</h1>
            <div className="bg-white shadow overflow-hidden rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.createdAt.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.actor.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.tenant?.name || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{JSON.stringify(log.metadata)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
