import React from "react"
import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { TopNav } from "@/components/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 overflow-auto p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:p-6">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </AuthGuard>
  );
}
