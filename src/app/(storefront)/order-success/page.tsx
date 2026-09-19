import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';

import { UnboxingNoticeModal } from '@/components/storefront/UnboxingNoticeModal';

export const revalidate = 0;

interface OrderSuccessProps {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessProps) {
  const { orderNumber } = await searchParams;

  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      
      {/* Celebration Icon */}
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
          Thank You For Your Order!
        </span>
        <h1 className="text-3xl font-extrabold text-[#1F1F1F]">Order Placed Successfully</h1>
        <p className="text-xs text-[#666666]">
          We have received your order and dispatched confirmation to your mobile and email.
        </p>
      </div>

      {/* Unboxing Notice Modal & Banner */}
      <UnboxingNoticeModal />

      {order ? (
        <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto shadow-xs">
          
          <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3 text-xs">
            <div>
              <span className="text-[#666666]">Order Number</span>
              <h3 className="font-extrabold text-base text-[#1F1F1F]">{order.orderNumber}</h3>
            </div>
            <div className="text-right">
              <span className="text-[#666666]">Total Paid / Due</span>
              <h3 className="font-black text-base text-[#C62828]">{formatINR(order.totalAmount)}</h3>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#1F1F1F]">
            <div className="flex justify-between">
              <span className="text-[#666666]">Customer Name:</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">Mobile Number:</span>
              <span className="font-bold">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">Payment Method:</span>
              <span className="font-bold">{order.paymentMethod} ({order.paymentStatus})</span>
            </div>
          </div>

          {/* Ordered Items Preview */}
          <div className="pt-3 border-t border-[#E5DED2] space-y-2">
            <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Items Ordered:</h4>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="text-[#1F1F1F] line-clamp-1">{item.productName} (x{item.quantity})</span>
                <span className="font-bold">{formatINR(item.totalPrice)}</span>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-xl p-4 text-xs text-[#666666]">
          Order details confirmed. Check your email for tracking updates.
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {orderNumber && (
          <Link
            href={`/track-order?orderNumber=${orderNumber}`}
            className="w-full sm:w-auto bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-xs py-3.5 px-8 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>
        )}
        <Link
          href="/products"
          className="w-full sm:w-auto bg-white hover:bg-[#FAF6EF] text-[#1F1F1F] border border-[#E5DED2] font-bold text-xs py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
