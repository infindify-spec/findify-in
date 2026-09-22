import React from 'react';
import { getAdminSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If no session exists, render children directly (allows /admin/login to render without redirect loops)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FAF6EF]">
      <AdminSidebar adminName={session.name} adminRole={session.role} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

