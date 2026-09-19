'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/utils';
import {
  Printer,
  Save,
  Truck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Zap,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { COURIER_PARTNERS, getUniversalTrackingUrl } from '@/lib/shipping';

export interface OrderDetailAdminClientProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: {
      fullName: string;
      mobile: string;
      houseFlat: string;
      street: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
    };
    subtotal: number;
    discount: number;
    shippingFee: number;
    codFee: number;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    courierName: string;
    awbNumber: string;
    internalNotes: string;
    items: Array<{
      id: string;
      productName: string;
      variantName?: string;
      price: number;
      quantity: number;
      totalPrice: number;
    }>;
    shipments?: Array<{
      id: string;
      courier: string;
      awbNumber: string;
      status: string;
      trackingEvents: string | null;
      estimatedDelivery: string | null;
    }>;
  };
}

export function OrderDetailAdminClient({ order }: OrderDetailAdminClientProps) {
  const router = useRouter();

  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [courierName, setCourierName] = useState(order.courierName || 'Delhivery Express');
  const [awbNumber, setAwbNumber] = useState(order.awbNumber || '');
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoBooking, setIsAutoBooking] = useState(false);
  const [isTrackingSyncing, setIsTrackingSyncing] = useState(false);
  const [showScans, setShowScans] = useState(false);
  const [liveTrackingData, setLiveTrackingData] = useState<any>(() => {
    if (order.shipments && order.shipments.length > 0 && order.shipments[0].trackingEvents) {
      try {
        const scans = JSON.parse(order.shipments[0].trackingEvents);
        return {
          liveStatus: order.shipments[0].status || 'In Transit',
          scans: Array.isArray(scans) ? scans : [],
          lastLocation: scans.length > 0 ? scans[scans.length - 1].location : '',
          lastRemark: scans.length > 0 ? scans[scans.length - 1].remark : '',
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  const activeTrackingUrl = awbNumber ? getUniversalTrackingUrl(awbNumber, courierName) : '';

  // 1. General Order Status & Notes Save
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          courierName,
          awbNumber,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Order details & status updated!');
        router.refresh();
      } else {
        toast.error(data.message || 'Failed to update order');
      }
    } catch {
      toast.error('Network error updating order');
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Automated NimbusPost Booking (1-Click)
  const handleAutoBookNimbus = async () => {
    if (!confirm(`Book shipment on NimbusPost for Order #${order.orderNumber}?\nThis will automatically select the best courier partner, assign an AWB, and mark as Shipped.`)) {
      return;
    }

    setIsAutoBooking(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_nimbus' }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Shipment booked via NimbusPost!');
        if (data.awb) setAwbNumber(data.awb);
        if (data.courierName) setCourierName(data.courierName);
        setOrderStatus('SHIPPED');
        router.refresh();
      } else {
        toast.error(data.message || 'NimbusPost booking failed');
      }
    } catch (err: any) {
      toast.error('Error connecting to courier booking service');
    } finally {
      setIsAutoBooking(false);
    }
  };

  // 3. Manual Courier Partner Assignment
  const handleAssignCourier = async () => {
    if (!courierName.trim()) {
      toast.error('Please select or enter a Courier Partner');
      return;
    }
    if (!awbNumber.trim()) {
      toast.error('Please enter the AWB / Tracking Number');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_assign',
          courierName: courierName.trim(),
          awbNumber: awbNumber.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Assigned to ${courierName}. AWB: ${awbNumber}`);
        setOrderStatus('SHIPPED');
        router.refresh();
      } else {
        toast.error(data.message || 'Failed to assign courier');
      }
    } catch {
      toast.error('Network error assigning courier');
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Live Tracking Sync from Shipping Partner
  const handleSyncLiveTracking = async () => {
    if (!awbNumber.trim()) {
      toast.error('No AWB number available to track');
      return;
    }

    setIsTrackingSyncing(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/track`);
      const data = await res.json();

      if (data.success && data.tracking) {
        setLiveTrackingData(data.tracking);
        setShowScans(true);
        toast.success(`Live status updated: ${data.tracking.liveStatus}`);
      } else {
        toast.error(data.message || 'Could not fetch live tracking data');
      }
    } catch {
      toast.error('Failed to connect to tracking service');
    } finally {
      setIsTrackingSyncing(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-[#E5DED2] p-4 rounded-xl shadow-xs gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#666666]">Fulfillment Status:</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
            orderStatus === 'DELIVERED'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : orderStatus === 'SHIPPED' || orderStatus === 'IN_TRANSIT'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {orderStatus}
          </span>
          {awbNumber && (
            <span className="text-xs bg-[#FAF6EF] border border-[#E5DED2] px-2.5 py-1 rounded-md text-[#1F1F1F] font-mono">
              AWB: {awbNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTrackingUrl && (
            <a
              href={activeTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Track Live on Courier</span>
            </a>
          )}

          <button
            onClick={handlePrintInvoice}
            className="bg-[#FAF6EF] hover:bg-white border border-[#E5DED2] text-[#1F1F1F] text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#C62828]" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Items, Shipping Address, and Live Tracking Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── COURIER PARTNER & LIVE TRACKING CARD ── */}
          <div className="bg-white border-2 border-emerald-500/20 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs bg-gradient-to-br from-white via-white to-emerald-50/20">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-[#1F1F1F] uppercase tracking-wider">
                  Courier Partner & Live Tracking
                </h3>
              </div>
              {awbNumber && (
                <button
                  type="button"
                  onClick={handleSyncLiveTracking}
                  disabled={isTrackingSyncing}
                  className="text-xs bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTrackingSyncing ? 'animate-spin' : ''}`} />
                  <span>{isTrackingSyncing ? 'Syncing...' : 'Sync Live Status'}</span>
                </button>
              )}
            </div>

            {/* Quick Courier Partner Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F]">Select Courier Partner</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-bold text-[#1F1F1F] focus:outline-none focus:border-[#C62828]"
                >
                  {COURIER_PARTNERS.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1F1F]">AWB / Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1423456789 or FMPC0123"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-mono font-bold text-[#1F1F1F] focus:outline-none focus:border-[#C62828]"
                />
              </div>
            </div>

            {/* Action Buttons: Auto-Book Nimbus vs Assign Courier */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleAutoBookNimbus}
                disabled={isAutoBooking}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isAutoBooking ? 'Booking on NimbusPost...' : '⚡ 1-Click Push & Book (NimbusPost)'}</span>
              </button>

              <button
                type="button"
                onClick={handleAssignCourier}
                disabled={isSaving}
                className="bg-[#FAF6EF] hover:bg-[#F2ECE0] border border-[#E5DED2] text-[#1F1F1F] text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4 text-[#C62828]" />
                <span>Save Courier Partner & AWB</span>
              </button>

              {activeTrackingUrl && (
                <a
                  href={activeTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 ml-auto"
                >
                  <span>Open Carrier Tracking Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Live Tracking Information & Timeline */}
            {liveTrackingData && (
              <div className="border border-emerald-200 bg-white rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-[#1F1F1F]">Live Courier Status:</span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md uppercase">
                      {liveTrackingData.liveStatus || 'In Transit'}
                    </span>
                  </div>

                  {liveTrackingData.scans && liveTrackingData.scans.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowScans(!showScans)}
                      className="text-[11px] font-bold text-[#666666] hover:text-[#1F1F1F] flex items-center gap-1"
                    >
                      <span>{showScans ? 'Hide Checkpoints' : `View ${liveTrackingData.scans.length} Checkpoints`}</span>
                      {showScans ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {liveTrackingData.lastLocation && (
                  <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Last Location: <strong>{liveTrackingData.lastLocation}</strong></span>
                    {liveTrackingData.lastRemark && (
                      <span className="text-[#999999]">({liveTrackingData.lastRemark})</span>
                    )}
                  </div>
                )}

                {/* Detailed Checkpoint Timeline */}
                {showScans && liveTrackingData.scans && (
                  <div className="pt-3 border-t border-[#E5DED2] space-y-2.5">
                    <span className="text-[11px] font-bold text-[#1F1F1F] block uppercase tracking-wider">
                      Partner Scan History:
                    </span>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                      {liveTrackingData.scans.map((s: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-[#FAF6EF] p-2.5 rounded-lg border border-[#E5DED2]/60">
                          <Clock className="w-3.5 h-3.5 text-[#666666] mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-2">
                              <span className="font-bold text-[#1F1F1F]">{s.status}</span>
                              <span className="text-[10px] text-[#888888] shrink-0">
                                {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(s.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#666666] truncate">{s.location} - {s.remark}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ordered Items Table */}
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
              Package Contents ({order.items.length})
            </h3>

            <div className="divide-y divide-[#E5DED2]">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-[#1F1F1F]">{item.productName}</h4>
                    {item.variantName && <span className="text-[#666666] text-[11px]">Option: {item.variantName}</span>}
                    <span className="text-[#666666] text-[11px] block">{formatINR(item.price)} x {item.quantity}</span>
                  </div>
                  <span className="font-black text-[#C62828] text-sm">{formatINR(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Financial Totals Summary */}
            <div className="pt-4 border-t border-[#E5DED2] space-y-1.5 text-xs text-[#1F1F1F]">
              <div className="flex justify-between">
                <span className="text-[#666666]">Items Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#666666]">Shipping Charge</span>
                <span>{order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee)}</span>
              </div>
              {order.codFee > 0 && (
                <div className="flex justify-between text-[#C62828]">
                  <span>COD Convenience Fee</span>
                  <span>+{formatINR(order.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-2 border-t border-[#E5DED2]">
                <span>Total Amount ({order.paymentMethod})</span>
                <span className="text-[#C62828]">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Address Card */}
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-3 shadow-xs text-xs">
            <h3 className="font-bold text-sm text-[#1F1F1F] border-b border-[#E5DED2] pb-2 uppercase tracking-wider">
              Customer Shipping Address
            </h3>
            <p className="font-bold text-[#1F1F1F]">{order.shippingAddress.fullName}</p>
            <p className="text-[#666666]">{order.shippingAddress.houseFlat}, {order.shippingAddress.street}</p>
            <p className="text-[#666666]">{order.shippingAddress.area}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-[#1F1F1F] font-bold">Mobile: {order.shippingAddress.mobile} | Email: {order.customerEmail}</p>
          </div>

        </div>

        {/* Right Column: Update Order Form & Internal Notes */}
        <div className="space-y-6">
          <form onSubmit={handleSaveChanges} className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
              Order Controls & Status
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-[#C62828]"
              >
                <option value="PENDING">PENDING</option>
                <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="PACKED">PACKED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="RTO">RTO (Returned to Origin)</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-[#C62828]"
              >
                <option value="PENDING">PENDING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Courier Partner</label>
              <input
                type="text"
                placeholder="e.g. Delhivery, Ekart, NimbusPost"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 text-xs focus:outline-none focus:border-[#C62828]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">AWB / Tracking Number</label>
              <input
                type="text"
                placeholder="e.g. AWB987654321"
                value={awbNumber}
                onChange={(e) => setAwbNumber(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-[#C62828]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Internal Staff Notes</label>
              <textarea
                rows={4}
                placeholder="Add private staff notes for this order..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 text-xs focus:outline-none focus:border-[#C62828]"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Order Changes'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
