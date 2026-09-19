'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Plus, Check } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { toast } from 'sonner';

export interface CouponsClientProps {
  coupons: Array<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number;
    usedCount: number;
    isPrepaidOnly: boolean;
    isActive: boolean;
  }>;
}

export function CouponsClient({ coupons }: CouponsClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 200,
    isPrepaidOnly: false,
  });

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Coupon "${formData.code}" created!`);
        setShowModal(false);
        router.refresh();
      } else {
        toast.error(data.message || 'Failed to create coupon');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C62828] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl hover:bg-[#B71C1C] flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white border border-[#E5DED2] rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <span className="font-extrabold text-base text-[#C62828] uppercase tracking-wider">{c.code}</span>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1 text-xs text-[#1F1F1F]">
              <div className="flex justify-between">
                <span className="text-[#666666]">Discount Value:</span>
                <span className="font-bold">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Min Order Value:</span>
                <span className="font-bold">{formatINR(c.minOrderValue)}</span>
              </div>
              {c.maxDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#666666]">Max Discount Cap:</span>
                  <span className="font-bold">{formatINR(c.maxDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#666666]">Times Used:</span>
                <span className="font-bold">{c.usedCount} Uses</span>
              </div>
              {c.isPrepaidOnly && (
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1">
                  Prepaid Only Coupon
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-[#1F1F1F]">Create Discount Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold">Coupon Code (e.g. FESTIVE20) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 font-bold uppercase focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 font-bold"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED">FIXED AMOUNT (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white border border-[#E5DED2] py-2 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#C62828] text-white py-2 rounded-lg font-bold hover:bg-[#B71C1C]"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
