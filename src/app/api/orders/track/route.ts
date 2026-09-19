import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackCourierShipment, getUniversalTrackingUrl } from '@/lib/shipping';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const mobile = searchParams.get('mobile')?.trim();

    if (!orderNumber && !mobile) {
      return NextResponse.json(
        { success: false, message: 'Please provide an Order Number or Mobile Number.' },
        { status: 400 }
      );
    }

    const whereClause: any = {};
    if (orderNumber) whereClause.orderNumber = orderNumber;
    if (mobile) {
      const cleanDigits = mobile.replace(/\D/g, '').slice(-10);
      whereClause.customerPhone = { contains: cleanDigits };
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        items: true,
        shipments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'No matching order found with provided details.' },
        { status: 404 }
      );
    }

    const awb = order.awbNumber || (order.shipments[0] ? order.shipments[0].awbNumber : '');
    const courier = order.courierName || (order.shipments[0] ? order.shipments[0].courier : 'Courier Partner');
    const universalTrackingUrl = getUniversalTrackingUrl(awb, courier);

    let liveTracking = null;
    if (awb) {
      liveTracking = await trackCourierShipment(awb, courier, order.createdAt.toISOString());
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderStatus: order.orderStatus,
        courierName: courier,
        awbNumber: awb,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
        trackingUrl: universalTrackingUrl,
        timeline: order.timeline ? JSON.parse(order.timeline) : [],
        items: order.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          price: i.price,
        })),
      },
      liveTracking,
    });
  } catch (error: any) {
    console.error('Public tracking error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve tracking info.' },
      { status: 500 }
    );
  }
}
