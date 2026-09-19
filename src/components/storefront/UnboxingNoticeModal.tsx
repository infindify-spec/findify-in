'use client';

import React, { useState } from 'react';
import { Video, AlertTriangle, ShieldAlert, Check, FileText } from 'lucide-react';

export function UnboxingNoticeModal() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* ── Persistent Warning Banner ── */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-left text-xs text-amber-900 space-y-3 shadow-xs my-6">
        <div className="flex items-center gap-2.5 text-amber-800 font-extrabold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>IMPORTANT NOTICE: Unboxing Video Mandatory</span>
        </div>
        <p className="leading-relaxed">
          To ensure valid claims for any transit damage, missing parts, or incorrect items, please shoot a <strong>continuous, unedited video</strong> while unboxing your package.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] font-medium text-amber-950">
          <div className="bg-white/80 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Uncut Single-Take Video</span>
          </div>
          <div className="bg-white/80 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Show Shipping Label</span>
          </div>
          <div className="bg-white/80 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Required for Damage Claims</span>
          </div>
        </div>
      </div>

      {/* ── Auto Popup Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5 text-center border border-amber-300 relative">
            
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Video className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Mandatory Policy Notice
              </span>
              <h3 className="text-lg font-black text-gray-900">Record Unboxing Video</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                For safety & smooth replacement processing, please record an <strong>unedited, continuous video</strong> starting from opening the sealed outer courier parcel.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-left text-[11.5px] text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Show parcel shipping label & seal clearly before opening.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Keep camera active without pauses or cuts during unboxing.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Claims for transit damage or missing items require this video.</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#1F5D42] hover:bg-[#174A35] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </>
  );
}
