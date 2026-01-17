import { prisma } from '@/lib/db';
import { generateNginxConfig } from '@/lib/nginx-generator';
import { ConfigViewer } from '@/components/ConfigViewer';
import Link from 'next/link';
import { DeployButton } from '@/components/DeployButton';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function RenderPreviewPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams;
  const tenantId = searchParams.tenantId as string;

  const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true, slug: true }
  });

  let configCode = '# Select a tenant to view configuration';
  let selectedTenant = null;

  if (tenantId) {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { domains: { include: { certificate: true } }, policy: true }
    });

    if (tenant) {
        selectedTenant = tenant;
        configCode = generateNginxConfig(tenant);
    } else {
        configCode = '# Tenant not found';
    }
  } else if (tenants.length > 0) {
      // Default to first
      // Actually, let's just ask user to select to avoid confusion
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">NGINX Configuration Preview</h1>
      </div>

      <div className="flex h-full gap-4">
          <div className="w-64 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-lg overflow-y-auto p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Tenants</h3>
              <ul className="space-y-1">
                  {tenants.map(t => (
                      <li key={t.id}>
                          <Link
                            href={`/app/nginx/render-preview?tenantId=${t.id}`}
                            className={`block px-3 py-2 rounded-md text-sm ${t.id === tenantId ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                          >
                              {t.name}
                              <span className="block text-xs text-gray-500 opacity-75">{t.slug}</span>
                          </Link>
                      </li>
                  ))}
                  {tenants.length === 0 && <li className="text-gray-500 text-sm">No tenants.</li>}
              </ul>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
               <div className="bg-gray-900 border border-gray-800 rounded-t-lg px-4 py-2 flex items-center justify-between">
                   <div className="text-sm text-gray-300 font-mono">
                       {selectedTenant ? `/etc/nginx/sites-available/${selectedTenant.slug}.conf` : 'nginx.conf'}
                   </div>
                   <div className="flex items-center space-x-4">
                       <div className="flex space-x-2">
                           <span className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/20">
                               Valid
                           </span>
                           <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                               Generated
                           </span>
                       </div>
                       {selectedTenant && <DeployButton tenantId={selectedTenant.id} />}
                   </div>
               </div>
               <div className="flex-1 overflow-auto bg-[#0d1117] border-x border-b border-gray-800 rounded-b-lg">
                   <ConfigViewer code={configCode} />
               </div>
          </div>
      </div>
    </div>
  );
}
