import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatINR, formatDate } from '@/lib/utils';
import { Eye, Download, ExternalLink } from 'lucide-react';
import { DeleteOrderButton } from '@/components/admin/DeleteOrderButton';
import { getUniversalTrackingUrl } from '@/lib/shipping';

export const revalidate = 0;

interface AdminOrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { search, status } = await searchParams;

  const where: any = {};
  if (status) where.orderStatus = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
      { awbNumber: { contains: search } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DED2] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">COMMERCE FULFILLMENT</span>
          <h1 className="text-2xl font-black text-[#1F1F1F]">Order Management ({orders.length})</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-[#E5DED2] px-3 py-2 rounded-lg text-xs font-bold text-[#1F1F1F] hover:bg-[#FAF6EF] flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-[#C62828]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E5DED2] rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <form method="GET" className="flex-1 w-full flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search Order ID, Customer Name, Mobile, or AWB..."
            className="flex-1 bg-[#FAF6EF] border border-[#E5DED2] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C62828]"
          />
          <button type="submit" className="bg-[#C62828] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#B71C1C]">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#666666] font-bold">Status:</span>
          <Link href="/admin/orders" className={`px-2.5 py-1 rounded-lg ${!status ? 'bg-[#C62828] text-white font-bold' : 'bg-[#FAF6EF] text-[#1F1F1F]'}`}>
            All
          </Link>
          <Link href="/admin/orders?status=PENDING" className={`px-2.5 py-1 rounded-lg ${status === 'PENDING' ? 'bg-[#C62828] text-white font-bold' : 'bg-[#FAF6EF] text-[#1F1F1F]'}`}>
            Pending
          </Link>
          <Link href="/admin/orders?status=SHIPPED" className={`px-2.5 py-1 rounded-lg ${status === 'SHIPPED' ? 'bg-[#C62828] text-white font-bold' : 'bg-[#FAF6EF] text-[#1F1F1F]'}`}>
            Shipped
          </Link>
          <Link href="/admin/orders?status=DELIVERED" className={`px-2.5 py-1 rounded-lg ${status === 'DELIVERED' ? 'bg-[#C62828] text-white font-bold' : 'bg-[#FAF6EF] text-[#1F1F1F]'}`}>
            Delivered
          </Link>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EF] border-b border-[#E5DED2] text-[#666666] font-bold">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Courier / AWB</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DED2]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#666666]">
                    No orders matching criteria found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF6EF] transition-colors">
                    <td className="p-3.5">
                      <span className="font-extrabold text-[#1F1F1F] block">{ord.orderNumber}</span>
                      <span className="text-[10px] text-[#666666]">{formatDate(ord.createdAt)}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#1F1F1F] block">{ord.customerName}</span>
                      <span className="text-[10px] text-[#666666]">{ord.customerPhone}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-[#1F1F1F] block">{ord.paymentMethod}</span>
                      <span className={`text-[10px] font-bold ${ord.paymentStatus === 'SUCCESS' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {ord.awbNumber ? (
                        <div>
                          <span className="font-bold text-[#1F1F1F] block">{ord.courierName || 'Partner'}</span>
                          <a
                            href={getUniversalTrackingUrl(ord.awbNumber, ord.courierName || '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-[#C62828] hover:underline inline-flex items-center gap-1 font-bold"
                            title="Open live courier tracking"
                          >
                            <span>{ord.awbNumber}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#666666] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-[#C62828]">
                      {formatINR(ord.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 bg-[#FAF6EF] hover:bg-[#C62828] text-[#1F1F1F] hover:text-white border border-[#E5DED2] px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Link>
                        <DeleteOrderButton
                          orderId={ord.id}
                          orderNumber={ord.orderNumber}
                          customerName={ord.customerName}
                        />
                      </div>
                    </td>
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
