'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { toast } from 'sonner';

export interface TrackOrderClientProps {
  initialOrderNumber: string;
  initialMobile: string;
  initialOrder: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    orderStatus: string;
    courierName: string;
    awbNumber: string;
    trackingUrl?: string;
    totalAmount: number;
    createdAt: string;
    timeline: Array<{ status: string; title: string; timestamp: string }>;
    items: Array<{ name: string; quantity: number; price: number }>;
  } | null;
  initialLiveTracking?: {
    status: string;
    awb: string;
    carrier: string;
    liveStatus: string;
    lastLocation: string;
    lastRemark: string;
    lastScanTime: string;
    trackingUrl: string;
    scans: Array<{
      status: string;
      location: string;
      remark: string;
      timestamp: string;
    }>;
  } | null;
}

export function TrackOrderClient({
  initialOrderNumber,
  initialMobile,
  initialOrder,
  initialLiveTracking,
}: TrackOrderClientProps) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [mobile, setMobile] = useState(initialMobile);
  const [copied, setCopied] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim() || mobile.trim()) {
      const query = new URLSearchParams();
      if (orderNumber.trim()) query.set('orderNumber', orderNumber.trim());
      if (mobile.trim()) query.set('mobile', mobile.trim());
      router.push(`/track-order?${query.toString()}`);
    }
  };

  const handleCopyAwb = (awb: string) => {
    if (!awb) return;
    navigator.clipboard.writeText(awb);
    setCopied(true);
    toast.success('AWB copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const statusSteps = [
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  const currentStatus = initialLiveTracking?.liveStatus || initialOrder?.orderStatus || 'CONFIRMED';
  const normalizedStatus = currentStatus.toUpperCase().replace(/\s+/g, '_');

  const currentStatusIndex = initialOrder
    ? statusSteps.indexOf(normalizedStatus) !== -1
      ? statusSteps.indexOf(normalizedStatus)
      : normalizedStatus.includes('DELIVER')
      ? 6
      : normalizedStatus.includes('TRANSIT') || normalizedStatus.includes('DISPATCH')
      ? 4
      : normalizedStatus.includes('SHIP')
      ? 3
      : 1
    : 0;

  const trackingUrl = initialOrder?.trackingUrl || initialLiveTracking?.trackingUrl;
  const scans = initialLiveTracking?.scans || [];

  return (
    <div className="space-y-6">
      
      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white border border-[#E5DED2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F1F1F]">Order ID</label>
            <input
              type="text"
              placeholder="e.g. ORD-IN-10001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#C62828]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F1F1F]">Registered Mobile Number</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#C62828]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#C62828] text-white font-extrabold text-xs py-3 rounded-xl hover:bg-[#B71C1C] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Search className="w-4 h-4" />
          <span>Track Shipment Status</span>
        </button>
      </form>

      {/* Results Display */}
      {initialOrder ? (
        <div className="bg-white border border-[#E5DED2] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xs">
          
          {/* Order & Courier Header Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5DED2] pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#C62828] uppercase tracking-wider">
                  Verified Order Shipment
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1F1F1F]">{initialOrder.orderNumber}</h2>
              <span className="text-xs text-[#666666]">Recipient: {initialOrder.customerName}</span>
            </div>

            {/* Courier Card & Live Portal Button */}
            <div className="bg-[#FAF6EF] border border-[#E5DED2] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#666666] uppercase font-bold tracking-wider block">Assigned Logistics Partner</span>
                <strong className="text-xs text-[#1F1F1F] block flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  {initialOrder.courierName}
                </strong>
                {initialOrder.awbNumber ? (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[#C62828] font-mono text-[11px] font-bold">
                      AWB: {initialOrder.awbNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAwb(initialOrder.awbNumber)}
                      className="text-[#666666] hover:text-[#1F1F1F] p-0.5"
                      title="Copy AWB Number"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#888888]">AWB generation in progress</span>
                )}
              </div>

              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
                >
                  <span>Live Courier Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Visual Progress Stepper */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Shipment Status:</h3>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md uppercase">
                {currentStatus}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <div
                    key={step}
                    className={`p-2.5 rounded-xl border text-center space-y-1 transition-all ${
                      isCurrent
                        ? 'bg-[#FAF6EF] border-[#C62828] text-[#C62828] shadow-xs scale-105'
                        : isCompleted
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-[#FAF6EF] border-[#E5DED2] text-[#666666] opacity-50'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold">
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : idx + 1}
                    </div>
                    <span className="text-[9.5px] font-bold block leading-tight">{step.replace(/_/g, ' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Checkpoints Feed */}
          {scans.length > 0 && (
            <div className="border border-[#E5DED2] rounded-xl p-4 bg-[#FAF6EF]/60 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
                  Live Courier Tracking Checkpoints
                </h3>
              </div>

              <div className="space-y-2">
                {scans.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-[#E5DED2] text-xs">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-[#1F1F1F]">{s.status}</span>
                        <span className="text-[10px] text-[#888888] shrink-0">
                          {new Date(s.timestamp).toLocaleDateString()}, {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666]">{s.location} — {s.remark}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ordered Items Breakdown */}
          <div className="border-t border-[#E5DED2] pt-5 space-y-3">
            <h3 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Package Contents ({initialOrder.items.length}):</h3>
            <div className="space-y-2">
              {initialOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-[#FAF6EF] p-2.5 rounded-lg border border-[#E5DED2]">
                  <span className="font-bold text-[#1F1F1F]">{item.name} (x{item.quantity})</span>
                  <span className="font-bold text-[#C62828]">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (initialOrderNumber || initialMobile) ? (
        <div className="bg-[#FAF6EF] border border-amber-200 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-sm font-bold text-[#1F1F1F]">No matching shipment found</h3>
          <p className="text-xs text-[#666666]">
            Please check your Order ID (e.g. ORD-IN-10001) or 10-digit mobile number and try again.
          </p>
        </div>
      ) : null}

    </div>
  );
}
