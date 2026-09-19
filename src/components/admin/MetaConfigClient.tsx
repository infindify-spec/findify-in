'use client';

import React, { useState } from 'react';
import { Share2, Save, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

export interface MetaConfigClientProps {
  initialConfig: {
    metaPixelId: string;
    metaDatasetId: string;
    metaAccessToken: string;
    metaTestEventCode: string;
    metaEnabled: boolean;
  };
  events: Array<{
    id: string;
    eventName: string;
    source: string;
    createdAt: string;
    dataSnippet: string;
  }>;
}

export function MetaConfigClient({ initialConfig, events }: MetaConfigClientProps) {
  const [config, setConfig] = useState(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  const isConfigured = !!config.metaPixelId && !!config.metaAccessToken;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaPixelId: config.metaPixelId,
          metaDatasetId: config.metaDatasetId,
          metaAccessToken: config.metaAccessToken,
          metaTestEventCode: config.metaTestEventCode,
          metaEnabled: config.metaEnabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Meta Pixel & CAPI Settings Saved!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Network error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Integration Status Indicator */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FAF6EF] text-[#C62828] rounded-xl flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#1F1F1F]">Meta (Facebook/Instagram) Pixel & CAPI</h3>
            <span className="text-xs text-[#666666]">
              Server-Side Deduplicated Tracking: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
            </span>
          </div>
        </div>

        <div>
          {isConfigured && config.metaEnabled ? (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Integration Active & Configured</span>
            </span>
          ) : (
            <span className="bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Not Configured</span>
            </span>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
          API Credentials & Tokens
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Meta Pixel ID</label>
            <input
              type="text"
              placeholder="e.g. 123456789012345"
              value={config.metaPixelId}
              onChange={(e) => setConfig({ ...config, metaPixelId: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Meta Dataset ID</label>
            <input
              type="text"
              placeholder="e.g. 987654321098765"
              value={config.metaDatasetId}
              onChange={(e) => setConfig({ ...config, metaDatasetId: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-bold text-[#1F1F1F]">Conversions API (CAPI) System User Access Token</label>
            <textarea
              rows={2}
              placeholder="EAAG..."
              value={config.metaAccessToken}
              onChange={(e) => setConfig({ ...config, metaAccessToken: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-mono text-[11px] focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#1F1F1F]">Test Event Code (Optional for Sandbox Testing)</label>
            <input
              type="text"
              placeholder="e.g. TEST12345"
              value={config.metaTestEventCode}
              onChange={(e) => setConfig({ ...config, metaTestEventCode: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <div className="space-y-1 flex items-center justify-between bg-[#FAF6EF] border border-[#E5DED2] p-3 rounded-lg mt-5">
            <span className="font-bold text-[#1F1F1F]">Enable Meta Events Dispatcher:</span>
            <input
              type="checkbox"
              checked={config.metaEnabled}
              onChange={(e) => setConfig({ ...config, metaEnabled: e.target.checked })}
              className="accent-[#C62828] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Meta Configuration'}</span>
        </button>
      </form>

      {/* Deduplication Event Logger Table */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
          Event Audit Logger (Deduplication Check)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EF] border-b border-[#E5DED2] text-[#666666]">
              <tr>
                <th className="p-2.5">Event Name</th>
                <th className="p-2.5">Source</th>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Event Data Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DED2]">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-[#666666]">No event logs captured yet.</td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id}>
                    <td className="p-2.5 font-bold text-[#C62828]">{e.eventName}</td>
                    <td className="p-2.5 font-semibold text-[#1F1F1F]">{e.source}</td>
                    <td className="p-2.5 text-[#666666]">{new Date(e.createdAt).toLocaleTimeString()}</td>
                    <td className="p-2.5 font-mono text-[10px] text-[#666666] truncate max-w-xs">{e.dataSnippet}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
