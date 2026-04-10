"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { LocalProvider } from "@/contexts/LocalContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SetupLocalScreen from "@/components/SetupLocalScreen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <LocalProvider>
      {user.localId === null ? (
        <SetupLocalScreen />
      ) : (
        <div suppressHydrationWarning className="flex h-screen bg-slate-50 print:block print:h-auto print:overflow-visible">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:block">
            <Header />
            <main className="flex-1 overflow-y-scroll p-6 custom-scrollbar print:overflow-visible print:h-auto">
              <div className="max-w-[1600px] mx-auto fade-in">
                <ErrorBoundary section="dashboard">{children}</ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
      )}
    </LocalProvider>
  );
}
