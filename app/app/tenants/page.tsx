import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createTenant } from './actions';

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    include: { domains: true, deployments: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tenants</h1>
        {/* Simple creation form inline for demo */}
        <form action={createTenant} className="flex gap-2">
            <input name="name" placeholder="Tenant Name" className="rounded bg-gray-800 border border-gray-700 px-3 py-1 text-white" required />
            <input name="slug" placeholder="Slug" className="rounded bg-gray-800 border border-gray-700 px-3 py-1 text-white" required />
            <button type="submit" className="bg-blue-600 px-3 py-1 rounded text-white flex items-center hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" /> Create
            </button>
        </form>
      </div>

      <div className="bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-800">
        <ul role="list" className="divide-y divide-gray-800">
          {tenants.map((tenant) => (
            <li key={tenant.id}>
              <Link href={`/app/nginx/render-preview?tenantId=${tenant.id}`} className="block hover:bg-gray-800 transition">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-blue-500">{tenant.name}</p>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="inline-flex rounded-full bg-green-900 px-2 text-xs font-semibold leading-5 text-green-100">
                        {tenant.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-400">
                         {tenant.domains.length} Domain(s)
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-400 sm:mt-0 sm:ml-6">
                         Slug: {tenant.slug}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-400 sm:mt-0">
                      <p>
                        Created on {tenant.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {tenants.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">No tenants found. Create one above.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
