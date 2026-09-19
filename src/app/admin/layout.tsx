import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getAdminSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';

  // Skip auth check for the login page — let it render freely
  const isLoginPage = pathname.includes('/admin/login');
  if (isLoginPage) {
    return <>{children}</>;
  }

  const session = await getAdminSession();

  // If accessing protected admin page without session, redirect to login
  if (!session) {
    redirect('/admin/login');
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
