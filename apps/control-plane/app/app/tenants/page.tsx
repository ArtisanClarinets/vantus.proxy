import { prisma } from "database";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function TenantsPage() {
    const tenants = await prisma.tenant.findMany({
        include: { domains: true }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Tenants</h1>
                <Link href="/app/tenants/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Create Tenant
                </Link>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domains</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map(t => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{t.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{t.slug}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {t.domains.map(d => d.name).join(", ")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/app/tenants/${t.id}/overview`} className="text-blue-600 hover:text-blue-900">Manage</Link>
                                </td>
                            </tr>
                        ))}
                        {tenants.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No tenants found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
