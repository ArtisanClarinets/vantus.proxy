import { prisma } from "database";
import { redirect } from "next/navigation";
import { requireRole, logAudit } from "@/lib/actions";

export default async function CreateTenantPage() {
    await requireRole(['OWNER', 'ADMIN']);

    async function createTenant(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;

        // Basic validation
        if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(slug)) {
            throw new Error("Invalid slug");
        }

        const tenant = await prisma.tenant.create({
            data: { name, slug }
        });

        // Create default domain
        const baseDomain = process.env.BASE_TENANT_DOMAIN || "localtest.me";
        await prisma.domain.create({
            data: {
                name: `${slug}.${baseDomain}`,
                tenantId: tenant.id
            }
        });

        // Create default pool
        await prisma.upstreamPool.create({
            data: {
                name: 'default',
                targets: [{ host: 'example.com', port: 80, weight: 100 }],
                tenantId: tenant.id
            }
        });

        // Create default policy
        await prisma.edgePolicy.create({
            data: {
                tenantId: tenant.id,
                rateLimit: { rps: 10, burst: 20 }
            }
        });

        await logAudit("CREATE_TENANT", { id: tenant.id, name, slug }, tenant.id);
        redirect(`/app/tenants/${tenant.id}/overview`);
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
            <h1 className="text-xl font-bold mb-6">Create New Tenant</h1>
            <form action={createTenant} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input name="name" required className="mt-1 block w-full border border-gray-300 rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input name="slug" required pattern="[a-z0-9-]+" className="mt-1 block w-full border border-gray-300 rounded p-2" />
                    <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only.</p>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create Tenant</button>
            </form>
        </div>
    );
}
