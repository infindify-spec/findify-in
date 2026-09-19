import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatINR, formatDate } from '@/lib/utils';
import { OrderDetailAdminClient } from '@/components/admin/OrderDetailAdminClient';

export const revalidate = 0;

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      shipments: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = JSON.parse(order.shippingAddress);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DED2] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">ORDER CONTROL CENTER</span>
          <h1 className="text-2xl font-black text-[#1F1F1F]">{order.orderNumber}</h1>
          <span className="text-xs text-[#666666]">Placed on {formatDate(order.createdAt)}</span>
        </div>
      </div>

      {/* Interactive Admin Order Detail Client Component */}
      <OrderDetailAdminClient
        order={{
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          shippingAddress,
          subtotal: order.subtotal,
          discount: order.discount,
          shippingFee: order.shippingFee,
          codFee: order.codFee,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          courierName: order.courierName || '',
          awbNumber: order.awbNumber || '',
          internalNotes: order.internalNotes || '',
          items: order.items.map((i) => ({
            id: i.id,
            productName: i.productName,
            variantName: i.variantName || undefined,
            price: i.price,
            quantity: i.quantity,
            totalPrice: i.totalPrice,
          })),
          shipments: order.shipments.map((s) => ({
            id: s.id,
            courier: s.courier,
            awbNumber: s.awbNumber,
            status: s.status,
            trackingEvents: s.trackingEvents,
            estimatedDelivery: s.estimatedDelivery?.toISOString() || null,
          })),
        }}
      />

    </div>
  );
}
