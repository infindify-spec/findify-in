import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatINR, formatDate } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { order: true },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">GATEWAY TRANSACTIONS</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Payment Audit Log ({payments.length})</h1>
      </div>

      <div className="bg-white border border-[#E5DED2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EF] border-b border-[#E5DED2] text-[#666666] font-bold">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DED2]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#666666]">No payment transactions logged.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF6EF]">
                    <td className="p-3.5 font-bold text-[#1F1F1F]">{p.order.orderNumber}</td>
                    <td className="p-3.5 text-[#666666] font-semibold">{p.paymentMethod}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#666666]">{formatDate(p.createdAt)}</td>
                    <td className="p-3.5 text-right font-black text-[#C62828]">{formatINR(p.amount)}</td>
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
