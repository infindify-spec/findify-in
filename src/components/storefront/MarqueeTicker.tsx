'use client';

import React from 'react';
import { Zap, ShieldCheck, Truck, RotateCcw, Award, Sparkles } from 'lucide-react';

export function MarqueeTicker() {
  const items = [
    { icon: Zap, text: 'FREE Pan-India Shipping on Prepaid Orders > ₹999' },
    { icon: Sparkles, text: 'Use Code FIRST10 for Extra 10% OFF' },
    { icon: ShieldCheck, text: '100% Genuine Certified Quality Guarantee' },
    { icon: Truck, text: 'Dispatched within 24 Hours · Live Courier Tracking' },
    { icon: RotateCcw, text: '7-Day Easy Replacement Policy' },
    { icon: Award, text: '26,000+ Indian Pincodes Covered with COD' },
  ];

  return (
    <div className="bg-[#171717] text-white py-2.5 overflow-hidden border-y border-white/10 select-none">
      <div className="animate-marquee gap-8">
        {[...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold tracking-wide whitespace-nowrap text-white/90">
              <Icon className="w-3.5 h-3.5 text-[#7FC9A1]" />
              <span>{item.text}</span>
              <span className="ml-6 text-white/20">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
