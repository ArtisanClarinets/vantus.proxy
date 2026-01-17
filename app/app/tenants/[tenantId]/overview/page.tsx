import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Params = Promise<{ tenantId: string }>

export default async function TenantOverview(props: { params: Params }) {
  const { tenantId } = await props.params;
  const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { domains: true, policy: true }
  });

  if (!tenant) return <div className="text-white">Tenant not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-white">Tenant: {tenant.name}</h1>
         <Link href={`/app/nginx/render-preview?tenantId=${tenant.id}`} className="text-blue-400 hover:text-blue-300 underline">
            View Configuration
         </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-gray-900 shadow sm:rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-medium leading-6 text-white mb-4">Details</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-400">Slug</dt>
                      <dd className="mt-1 text-sm text-white">{tenant.slug}</dd>
                  </div>
                  <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-400">Status</dt>
                      <dd className="mt-1 text-sm text-white">{tenant.status}</dd>
                  </div>
                  <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-400">Created At</dt>
                      <dd className="mt-1 text-sm text-white">{tenant.createdAt.toString()}</dd>
                  </div>
              </dl>
          </div>

          <div className="bg-gray-900 shadow sm:rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-medium leading-6 text-white mb-4">Domains</h3>
              <ul className="space-y-2">
                  {tenant.domains.map(d => (
                      <li key={d.id} className="text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded flex justify-between">
                          <span>{d.hostname}</span>
                          <span className="text-green-500 text-xs uppercase tracking-wide">Active</span>
                      </li>
                  ))}
                  {tenant.domains.length === 0 && <li className="text-gray-500">No domains attached.</li>}
              </ul>
          </div>
      </div>
    </div>
  );
}
