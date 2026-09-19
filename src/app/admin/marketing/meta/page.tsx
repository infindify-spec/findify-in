import React from 'react';
import { prisma } from '@/lib/prisma';
import { MetaConfigClient } from '@/components/admin/MetaConfigClient';

export const revalidate = 0;

export default async function AdminMetaMarketingPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });

  const recentEvents = await prisma.analyticsEvent.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">MARKETING INTEGRATIONS</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Meta Pixel & Conversions API (CAPI) Setup</h1>
        <p className="text-xs text-[#666666] mt-1">Configure Meta Pixel ID, CAPI Access Token, Dataset ID, and verify client/server event deduplication.</p>
      </div>

      <MetaConfigClient
        initialConfig={{
          metaPixelId: settings?.metaPixelId || '',
          metaDatasetId: settings?.metaDatasetId || '',
          metaAccessToken: settings?.metaAccessToken || '',
          metaTestEventCode: settings?.metaTestEventCode || '',
          metaEnabled: settings?.metaEnabled || false,
        }}
        events={recentEvents.map((e) => ({
          id: e.id,
          eventName: e.eventName,
          source: e.source,
          createdAt: e.createdAt.toISOString(),
          dataSnippet: e.eventData,
        }))}
      />
    </div>
  );
}
