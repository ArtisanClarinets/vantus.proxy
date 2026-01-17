import { AppSidebar } from '@/components/AppSidebar';
import { Providers } from '@/components/Providers';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
        <div className="flex h-screen bg-gray-100 dark:bg-black">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
    </Providers>
  );
}
