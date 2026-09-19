import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Star, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">COMMUNITY REVIEWS</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Customer Reviews Moderation ({reviews.length})</h1>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-[#E5DED2] rounded-2xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#1F1F1F]">{r.authorName}</h4>
                <span className="text-[10px] text-[#666666]">Product: {r.product.name}</span>
              </div>
              <div className="flex items-center text-amber-500 text-xs font-bold">
                {'★'.repeat(r.rating)}
              </div>
            </div>
            <p className="text-xs italic text-[#1F1F1F] bg-[#FAF6EF] border border-[#E5DED2] p-3 rounded-xl">
              "{r.comment}"
            </p>
            <div className="flex justify-between items-center text-[10px] text-[#666666] pt-1">
              <span>Status: <strong className="text-emerald-700 font-bold uppercase">{r.status}</strong></span>
              {r.isVerified && <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">Verified Purchaser</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
