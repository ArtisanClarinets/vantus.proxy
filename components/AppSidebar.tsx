'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Server,
  Shield,
  FileText,
  Activity,
  Settings,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Tenants', href: '/app/tenants', icon: Users },
  { name: 'Nginx Configs', href: '/app/nginx/render-preview', icon: Server },
  { name: 'Security Policies', href: '/app/security/global-policies', icon: Shield },
  { name: 'Observability', href: '/app/observability/platform-metrics', icon: Activity },
  { name: 'Audit Logs', href: '/app/audit/logs', icon: FileText },
  { name: 'Settings', href: '/app/settings/organization', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-800 h-screen text-gray-100">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-white">VANTUS<span className="text-blue-500">PROXY</span></h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                      'mr-3 h-5 w-5 flex-shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-400 rounded-md hover:bg-gray-800 hover:text-white"
        >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
        </button>
      </div>
    </div>
  );
}
