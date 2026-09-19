import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';

export default function AdminShippingPage() {
  const providers = [
    { name: 'Delhivery Surface & Express', code: 'DELHIVERY', status: 'ACTIVE', serviceablePincodes: '26,000+' },
    { name: 'BlueDart Air Priority', code: 'BLUEDART', status: 'ACTIVE', serviceablePincodes: '18,500+' },
    { name: 'Ecom Express COD Specialist', code: 'ECOM_EXPRESS', status: 'ACTIVE', serviceablePincodes: '22,000+' },
    { name: 'Shiprocket Aggregator API', code: 'SHIPROCKET', status: 'NOT_CONFIGURED', serviceablePincodes: 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">LOGISTICS & FULFILLMENT</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Courier Provider Integration</h1>
        <p className="text-xs text-[#666666] mt-1">Abstraction engine for pan-India shipping aggregators and courier APIs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p) => (
          <div key={p.code} className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <h3 className="font-extrabold text-base text-[#1F1F1F]">{p.name}</h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                {p.status === 'ACTIVE' ? 'ACTIVE' : 'NOT CONFIGURED'}
              </span>
            </div>
            <p className="text-xs text-[#666666]">Serviceable Pincodes: <strong className="text-[#1F1F1F]">{p.serviceablePincodes}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
}
