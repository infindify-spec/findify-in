import React from 'react';
import { prisma } from '@/lib/prisma';
import { FileText, Image as ImageIcon } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCMSPage() {
  const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } });
  const cmsPages = await prisma.cMSPage.findMany();

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">STOREFRONT CONTENT</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">CMS Content & Banners</h1>
      </div>

      {/* Hero Banners */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="font-extrabold text-base text-[#1F1F1F] border-b border-[#E5DED2] pb-3">
          Homepage Hero Banners ({banners.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-[#FAF6EF] border border-[#E5DED2] rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-bold text-[#C62828] uppercase bg-white px-2 py-0.5 rounded border border-[#E5DED2]">
                {b.badgeText || 'BANNER'}
              </span>
              <h4 className="font-bold text-sm text-[#1F1F1F]">{b.title}</h4>
              <p className="text-xs text-[#666666] line-clamp-2">{b.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Information Pages */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="font-extrabold text-base text-[#1F1F1F] border-b border-[#E5DED2] pb-3">
          Editable CMS Policy Pages ({cmsPages.length})
        </h3>
        <div className="space-y-2">
          {cmsPages.map((p) => (
            <div key={p.id} className="flex justify-between items-center bg-[#FAF6EF] border border-[#E5DED2] p-3 rounded-xl text-xs">
              <span className="font-bold text-[#1F1F1F]">{p.title} (/slug: /{p.slug})</span>
              <span className="text-emerald-700 font-bold">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
