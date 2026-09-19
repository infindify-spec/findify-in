'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface ClarityGa4ClientProps {
  initialData: {
    clarityProjectId: string;
    clarityEnabled: boolean;
    ga4MeasurementId: string;
    ga4Enabled: boolean;
  };
}

export function ClarityGa4Client({ initialData }: ClarityGa4ClientProps) {
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success('Clarity & GA4 Settings Saved!');
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
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Microsoft Clarity Card */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
          <h3 className="font-extrabold text-base text-[#1F1F1F]">Microsoft Clarity Heatmaps & Session Recording</h3>
          {data.clarityProjectId && data.clarityEnabled ? (
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              Active
            </span>
          ) : (
            <span className="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
              Not Configured
            </span>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Clarity Project ID</label>
            <input
              type="text"
              placeholder="e.g. k9x8w7v6"
              value={data.clarityProjectId}
              onChange={(e) => setData({ ...data, clarityProjectId: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div className="flex items-center justify-between bg-[#FAF6EF] border border-[#E5DED2] p-3 rounded-lg">
            <span className="font-bold text-[#1F1F1F]">Enable Clarity Script Injection:</span>
            <input
              type="checkbox"
              checked={data.clarityEnabled}
              onChange={(e) => setData({ ...data, clarityEnabled: e.target.checked })}
              className="accent-[#C62828] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Google Analytics 4 Card */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
          <h3 className="font-extrabold text-base text-[#1F1F1F]">Google Analytics 4 (GA4)</h3>
          {data.ga4MeasurementId && data.ga4Enabled ? (
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              Active
            </span>
          ) : (
            <span className="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
              Not Configured
            </span>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">GA4 Measurement ID</label>
            <input
              type="text"
              placeholder="e.g. G-XXXXXXXXXX"
              value={data.ga4MeasurementId}
              onChange={(e) => setData({ ...data, ga4MeasurementId: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div className="flex items-center justify-between bg-[#FAF6EF] border border-[#E5DED2] p-3 rounded-lg">
            <span className="font-bold text-[#1F1F1F]">Enable GA4 Script Injection:</span>
            <input
              type="checkbox"
              checked={data.ga4Enabled}
              onChange={(e) => setData({ ...data, ga4Enabled: e.target.checked })}
              className="accent-[#C62828] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        <span>{isSaving ? 'Saving Analytics...' : 'Save Clarity & GA4 Settings'}</span>
      </button>

    </form>
  );
}
