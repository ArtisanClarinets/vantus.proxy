import Link from "next/link";
import { getCurrentUser } from "@/lib/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();
    const memberships = user?.memberships || [];
    
    // For MVP, we'll check if user has any membership or if they are the super admin
    const isSuperAdmin = user?.email === 'admin@vantus.systems';
    
    // In a real app, we'd have a selected tenant context.
    // For now, let's assume if they have any OWNER or ADMIN role, they see more.
    const hasAdminAccess = isSuperAdmin || memberships.some(m => m.role === 'OWNER' || m.role === 'ADMIN');

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
                <div className="font-bold text-xl mb-6">Vantus Proxy</div>
                <nav className="space-y-2 flex-1">
                    <Link href="/app/dashboard" className="block p-2 hover:bg-gray-800 rounded">Dashboard</Link>
                    
                    {hasAdminAccess && (
                        <>
                            <div className="text-xs uppercase text-gray-500 mt-4 mb-2">Platform</div>
                            <Link href="/app/tenants" className="block p-2 hover:bg-gray-800 rounded">Tenants</Link>
                            <Link href="/app/users" className="block p-2 hover:bg-gray-800 rounded">Users</Link>
                        </>
                    )}
                    
                    <div className="text-xs uppercase text-gray-500 mt-4 mb-2">Ops</div>
                    <Link href="/app/nginx/config-status" className="block p-2 hover:bg-gray-800 rounded">NGINX Status</Link>
                    <Link href="/app/observability/platform-metrics" className="block p-2 hover:bg-gray-800 rounded">Observability</Link>
                    
                    {hasAdminAccess && (
                        <Link href="/app/audit/logs" className="block p-2 hover:bg-gray-800 rounded">Audit</Link>
                    )}
                    
                    <div className="text-xs uppercase text-gray-500 mt-4 mb-2">System</div>
                    <Link href="/system/status" className="block p-2 hover:bg-gray-800 rounded">System Status</Link>
                </nav>
                <div className="mt-auto pt-4 border-t border-gray-800">
                    <div className="px-2 py-1 text-xs text-gray-400 mb-2 truncate">
                        {user?.email}
                    </div>
                    <Link href="/auth/logout" className="block p-2 hover:bg-red-900 rounded text-red-400">Logout</Link>
                </div>
            </aside>
            <main className="flex-1 p-8 bg-gray-100 overflow-auto">
                {children}
            </main>
        </div>
    );
}
