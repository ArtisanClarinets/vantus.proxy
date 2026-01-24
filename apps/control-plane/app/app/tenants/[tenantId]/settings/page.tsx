import { prisma } from "database";
import { redirect } from "next/navigation";
import { requireRole, logAudit } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function TenantSettings({ params }: { params: Promise<{ tenantId: string }> }) {
    const { tenantId } = await params;
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect("/auth/login");
    }

    const membership = await prisma.membership.findUnique({
        where: {
            userId_tenantId: {
                userId: session.user.id,
                tenantId: tenantId
            }
        }
    });

    const isOwner = membership?.role === 'OWNER';

    async function deleteTenant() {
        "use server";
        await requireRole(['OWNER']);
        // Verify tenant exists again or check permissions

        await prisma.tenant.delete({ where: { id: tenantId } });
        await logAudit("DELETE_TENANT", { id: tenantId }, tenantId);
        redirect("/app/tenants");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold">Settings</h1>
            <div className="bg-white p-6 rounded shadow border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">General</h2>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                    <input type="text" disabled value={tenant?.name} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50" />
                </div>
            </div>

            {isOwner && (
                <div className="bg-white p-6 rounded shadow border border-red-200">
                    <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>
                    <p className="mt-1 text-sm text-gray-500">Irreversibly delete this tenant and all its configuration.</p>
                    <div className="mt-4">
                        <form action={deleteTenant}>
                            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                Delete Tenant
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
