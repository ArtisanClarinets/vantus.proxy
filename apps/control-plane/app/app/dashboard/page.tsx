import { prisma } from "database";
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // const headersList = await headers();
    // const userId = headersList.get("x-user-id");

    const tenantCount = await prisma.tenant.count();
    const domainCount = await prisma.domain.count();
    const deploymentCount = await prisma.deploymentHistory.count();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Platform Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <div className="text-sm font-medium text-gray-500 uppercase">Total Tenants</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{tenantCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                    <div className="text-sm font-medium text-gray-500 uppercase">Active Domains</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{domainCount}</div>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <div className="text-sm font-medium text-gray-500 uppercase">Total Deployments</div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{deploymentCount}</div>
                </div>
            </div>
        </div>
    );
}
