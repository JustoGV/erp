import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { LocalProvider } from '@/contexts/LocalContext';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocalProvider>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-[1600px] mx-auto fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LocalProvider>
  );
}
