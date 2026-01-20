import { prisma } from "database";
import Link from "next/link";
import { requireRole } from "@/lib/actions";

export const dynamic = 'force-dynamic';

export default async function TenantsPage(props: { searchParams: Promise<{ page?: string, limit?: string }> }) {
    await requireRole(['OWNER', 'ADMIN']);
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams.page || "1");
    const limit = parseInt(searchParams.limit || "10");
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
        prisma.tenant.findMany({
            include: { domains: true },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.tenant.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Tenants ({total})</h1>
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

            <div className="flex justify-between items-center bg-white px-6 py-4 rounded shadow">
                <div className="text-sm text-gray-500">
                    Showing {skip + 1} to {Math.min(skip + limit, total)} of {total} tenants
                </div>
                <div className="flex space-x-2">
                    {page > 1 && (
                        <Link 
                            href={`/app/tenants?page=${page - 1}`} 
                            className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                            Previous
                        </Link>
                    )}
                    {page < totalPages && (
                        <Link 
                            href={`/app/tenants?page=${page + 1}`} 
                            className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                            Next
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
