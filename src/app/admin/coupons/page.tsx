import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';
import { Tag, Plus } from 'lucide-react';
import { CouponsClient } from '@/components/admin/CouponsClient';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DED2] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">PROMOTIONS ENGINE</span>
          <h1 className="text-2xl font-black text-[#1F1F1F]">Coupons & Discounts ({coupons.length})</h1>
        </div>
      </div>

      <CouponsClient
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          discountType: c.discountType,
          discountValue: c.discountValue,
          minOrderValue: c.minOrderValue,
          maxDiscount: c.maxDiscount || 0,
          usedCount: c.usedCount,
          isPrepaidOnly: c.isPrepaidOnly,
          isActive: c.isActive,
        }))}
      />
    </div>
  );
}
