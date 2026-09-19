import React from 'react';
import { prisma } from '@/lib/prisma';
import { SettingsClient } from '@/components/admin/SettingsClient';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">SYSTEM CONFIGURATION</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Global Store Settings</h1>
      </div>

      <SettingsClient
        settings={{
          storeName: settings?.storeName || 'FINDIFY.IN',
          supportEmail: settings?.supportEmail || 'support@findify.in',
          supportPhone: settings?.supportPhone || '+91 98765 43210',
          announcementBar: settings?.announcementBar || '',
          codEnabled: settings?.codEnabled ?? true,
          codCharge: settings?.codCharge ?? 49,
          freeShippingThreshold: settings?.freeShippingThreshold ?? 999,
          standardShippingFee: settings?.standardShippingFee ?? 79,
          razorpayKeyId: settings?.razorpayKeyId || '',
          razorpayKeySecret: settings?.razorpayKeySecret || '',
        }}
      />
    </div>
  );
}
