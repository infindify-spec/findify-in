import React from 'react';
import { prisma } from '@/lib/prisma';
import { ClarityGa4Client } from '@/components/admin/ClarityGa4Client';

export const revalidate = 0;

export default async function AdminClarityGa4Page() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">ANALYTICS & HEATMAPS</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Microsoft Clarity & GA4 Setup</h1>
      </div>

      <ClarityGa4Client
        initialData={{
          clarityProjectId: settings?.clarityProjectId || '',
          clarityEnabled: settings?.clarityEnabled || false,
          ga4MeasurementId: settings?.ga4MeasurementId || '',
          ga4Enabled: settings?.ga4Enabled || false,
        }}
      />
    </div>
  );
}
