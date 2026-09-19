'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Warehouse,
  Tag,
  MessageSquare,
  Users,
  Truck,
  CreditCard,
  Share2,
  FileText,
  Inbox,
  UserCheck,
  History,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export interface AdminSidebarProps {
  adminName: string;
  adminRole: string;
}

export function AdminSidebar({ adminName, adminRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Inventory', href: '/admin/inventory', icon: Warehouse },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Shipping', href: '/admin/shipping', icon: Truck },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Meta Pixel & CAPI', href: '/admin/marketing/meta', icon: Share2 },
    { label: 'Clarity & GA4', href: '/admin/marketing/clarity', icon: FileText },
    { label: 'CMS Content', href: '/admin/cms', icon: FileText },
    { label: 'Support Messages', href: '/admin/contact-messages', icon: Inbox },
    { label: 'Admin Staff', href: '/admin/admin-users', icon: UserCheck },
    { label: 'Activity Logs', href: '/admin/activity-logs', icon: History },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { method: 'POST' });
      toast.info('Admin logged out');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white border-b border-[#E5DED2] p-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#C62828] text-white rounded-lg flex items-center justify-center font-black text-lg">
            A
          </div>
          <span className="font-extrabold text-base text-[#1F1F1F]">ADMIN PORTAL</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-[#1F1F1F]"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-[#E5DED2] flex flex-col justify-between transition-transform duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header Brand */}
          <div className="p-5 border-b border-[#E5DED2] flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C62828] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-xs">
              F
            </div>
            <div>
              <h2 className="font-black text-base text-[#1F1F1F] leading-none">FINDIFY ADMIN</h2>
              <span className="text-[10px] font-bold text-[#C62828] uppercase tracking-widest block mt-0.5">
                Dropshipping OS
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#C62828] text-white shadow-xs'
                      : 'text-[#1F1F1F] hover:bg-[#FAF6EF] hover:text-[#C62828]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#666666]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-[#E5DED2] bg-[#FAF6EF] flex items-center justify-between">
            <div className="truncate">
              <span className="font-bold text-xs text-[#1F1F1F] block truncate">{adminName}</span>
              <span className="text-[10px] text-[#C62828] font-semibold uppercase">{adminRole}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-[#666666] hover:text-[#C62828] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
