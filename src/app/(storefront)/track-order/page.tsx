import React from 'react';
import { prisma } from '@/lib/prisma';
import { TrackOrderClient } from '@/components/storefront/TrackOrderClient';
import { trackCourierShipment, getUniversalTrackingUrl } from '@/lib/shipping';

export const revalidate = 30;

interface TrackOrderPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    mobile?: string;
  }>;
}

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const { orderNumber, mobile } = await searchParams;

  let orderData = null;
  let liveTracking = null;

  if (orderNumber || mobile) {
    const whereClause: any = {};
    if (orderNumber) whereClause.orderNumber = orderNumber.trim();
    if (mobile) {
      const cleanDigits = mobile.replace(/\D/g, '').slice(-10);
      whereClause.customerPhone = { contains: cleanDigits };
    }

    orderData = await prisma.order.findFirst({
      where: whereClause,
      include: {
        items: true,
        shipments: true,
      },
    });

    if (orderData && orderData.awbNumber) {
      try {
        liveTracking = await trackCourierShipment(
          orderData.awbNumber,
          orderData.courierName || '',
          orderData.createdAt.toISOString()
        );
      } catch {}
    }
  }

  const awb = orderData?.awbNumber || (orderData?.shipments[0]?.awbNumber || '');
  const courier = orderData?.courierName || (orderData?.shipments[0]?.courier || '');
  const trackingUrl = awb ? getUniversalTrackingUrl(awb, courier) : '';

  return (
    <div className="container-site py-8 space-y-6">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
          LIVE COURIER TRACKING
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1F1F1F]">Track Your Shipment</h1>
        <p className="text-xs text-[#666666]">
          Enter your Order ID (e.g. ORD-IN-10001) or registered mobile number to check real-time courier updates.
        </p>
      </div>

      <TrackOrderClient
        initialOrderNumber={orderNumber || ''}
        initialMobile={mobile || ''}
        initialOrder={
          orderData
            ? {
                id: orderData.id,
                orderNumber: orderData.orderNumber,
                customerName: orderData.customerName,
                customerPhone: orderData.customerPhone,
                orderStatus: orderData.orderStatus,
                courierName: courier || 'Courier Partner',
                awbNumber: awb,
                trackingUrl,
                totalAmount: orderData.totalAmount,
                createdAt: orderData.createdAt.toISOString(),
                timeline: orderData.timeline ? JSON.parse(orderData.timeline) : [],
                items: orderData.items.map((i) => ({
                  name: i.productName,
                  quantity: i.quantity,
                  price: i.price,
                })),
              }
            : null
        }
        initialLiveTracking={liveTracking}
      />

    </div>
  );
}
