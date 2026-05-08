"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/");
      } else if (user.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-botanical-terracotta"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background text-botanical-forest overflow-hidden font-body">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto border border-border/40 bg-white rounded-[32px] p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-botanical-clay/25 to-transparent" />
          <div className="relative z-10">{children}</div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
