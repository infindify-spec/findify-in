import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { trackCourierShipment } from '@/lib/shipping';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        shipments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const awb = order.awbNumber || (order.shipments[0] ? order.shipments[0].awbNumber : '');

    if (!awb) {
      return NextResponse.json(
        { success: false, message: 'No AWB tracking number assigned to this order yet.' },
        { status: 400 }
      );
    }

    const trackingResult = await trackCourierShipment(
      awb,
      order.courierName || '',
      order.createdAt.toISOString()
    );

    // If scans received, save to Shipment record
    if (order.shipments.length > 0) {
      await prisma.shipment.update({
        where: { id: order.shipments[0].id },
        data: {
          status: trackingResult.liveStatus,
          trackingEvents: JSON.stringify(trackingResult.scans),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      tracking: trackingResult,
    });
  } catch (error: any) {
    console.error('Tracking fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error querying courier tracking service.' },
      { status: 500 }
    );
  }
}
