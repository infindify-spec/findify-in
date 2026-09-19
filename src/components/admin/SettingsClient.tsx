'use client';

import React, { useState } from 'react';
import { Save, Building, CreditCard, Truck, Shield } from 'lucide-react';
import { toast } from 'sonner';

export interface SettingsClientProps {
  settings: {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    announcementBar: string;
    codEnabled: boolean;
    codCharge: number;
    freeShippingThreshold: number;
    standardShippingFee: number;
    razorpayKeyId: string;
    razorpayKeySecret: string;
  };
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Store Settings updated!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* General Store Branding */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-[#C62828]" />
          <span>Store Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Store Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-bold focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Support Email</label>
            <input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Support Phone</label>
            <input
              type="text"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 focus:outline-none focus:border-[#C62828]"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-bold text-[#1F1F1F]">Header Announcement Ticker Bar Text</label>
          <input
            type="text"
            value={formData.announcementBar}
            onChange={(e) => setFormData({ ...formData, announcementBar: e.target.value })}
            className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-bold focus:outline-none focus:border-[#C62828]"
          />
        </div>
      </div>

      {/* Shipping & COD Charges */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#C62828]" />
          <span>Shipping & COD Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={formData.freeShippingThreshold}
              onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Standard Shipping Fee (₹)</label>
            <input
              type="number"
              value={formData.standardShippingFee}
              onChange={(e) => setFormData({ ...formData, standardShippingFee: Number(e.target.value) })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">COD Handling Fee (₹)</label>
            <input
              type="number"
              value={formData.codCharge}
              onChange={(e) => setFormData({ ...formData, codCharge: Number(e.target.value) })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Keys */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#C62828]" />
          <span>Razorpay Payment Gateway API Keys</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Razorpay Key ID</label>
            <input
              type="text"
              placeholder="rzp_live_..."
              value={formData.razorpayKeyId}
              onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Razorpay Key Secret</label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              value={formData.razorpayKeySecret}
              onChange={(e) => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-mono"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-xs py-3.5 px-8 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{isSaving ? 'Saving...' : 'Save Global Settings'}</span>
      </button>

    </form>
  );
}
