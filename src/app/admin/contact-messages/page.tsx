import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Inbox, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminContactMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">CUSTOMER HELP DESK</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Support Messages Inbox ({messages.length})</h1>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-8 text-center text-xs text-[#666666]">
            No contact messages received yet.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white border border-[#E5DED2] rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5DED2] pb-2 text-xs">
                <div>
                  <h3 className="font-extrabold text-[#1F1F1F] text-sm">{msg.name}</h3>
                  <span className="text-[#666666] text-[10px]">{msg.email} {msg.phone ? `• ${msg.phone}` : ''}</span>
                </div>
                <span className="text-[10px] text-[#666666]">{formatDate(msg.createdAt)}</span>
              </div>

              <div className="space-y-1 text-xs text-[#1F1F1F]">
                <strong className="block text-[#C62828]">Subject: {msg.subject || 'General Inquiry'}</strong>
                <p className="bg-[#FAF6EF] border border-[#E5DED2] p-3 rounded-xl text-[#1F1F1F] leading-relaxed">
                  "{msg.message}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
