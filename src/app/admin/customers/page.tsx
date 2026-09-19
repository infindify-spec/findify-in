import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate, formatINR } from '@/lib/utils';
import { Users } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { orders: true, addresses: true },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">CUSTOMER DIRECTORY</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Registered Customers ({customers.length})</h1>
      </div>

      <div className="bg-white border border-[#E5DED2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EF] border-b border-[#E5DED2] text-[#666666] font-bold">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Orders Count</th>
                <th className="p-3.5 text-right">Lifetime Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DED2]">
              {customers.map((c) => {
                const totalSpent = c.orders.reduce((acc, o) => acc + o.totalAmount, 0);
                return (
                  <tr key={c.id} className="hover:bg-[#FAF6EF]">
                    <td className="p-3.5 font-bold text-[#1F1F1F]">{c.name}</td>
                    <td className="p-3.5 text-[#666666]">
                      <span>{c.email}</span>
                      {c.phone && <span className="block text-[10px] font-mono">{c.phone}</span>}
                    </td>
                    <td className="p-3.5 font-semibold text-[#1F1F1F]">{c.orders.length} Orders</td>
                    <td className="p-3.5 text-right font-black text-[#C62828]">{formatINR(totalSpent)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
