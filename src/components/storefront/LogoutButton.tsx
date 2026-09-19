'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/customer/logout', { method: 'POST' });
      toast.info('Logged out');
      router.push('/account/login');
      router.refresh();
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-white hover:bg-red-50 text-[#C62828] border border-red-200 font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      <span>Log Out</span>
    </button>
  );
}
