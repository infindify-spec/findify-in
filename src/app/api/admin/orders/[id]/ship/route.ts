import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { createNimbusShipmentBooking, getUniversalTrackingUrl } from '@/lib/shipping';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, courierName, awbNumber, estimatedDelivery } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        shipments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // ── CASE A: Automated NimbusPost One-Shot Booking ──
    if (action === 'auto_nimbus') {
      let bookingResult;
      try {
        bookingResult = await createNimbusShipmentBooking({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          shippingAddress: order.shippingAddress,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          items: order.items,
        });
      } catch (err: any) {
        return NextResponse.json(
          { success: false, message: err.message || 'NimbusPost shipment booking failed.' },
          { status: 400 }
        );
      }

      const { awb, courierName: assignedCarrier, trackingUrl, labelUrl } = bookingResult;

      // Upsert shipment record
      if (awb) {
        await prisma.shipment.upsert({
          where: { awbNumber: awb },
          update: {
            courier: assignedCarrier,
            status: 'BOOKED',
          },
          create: {
            orderId: order.id,
            courier: assignedCarrier,
            awbNumber: awb,
            status: 'BOOKED',
          },
        }).catch(() => {});
      }

      // Update Order record with courier, AWB, and SHIPPED status
      const existingTimeline = order.timeline ? JSON.parse(order.timeline) : [];
      const updatedTimeline = [
        ...existingTimeline,
        {
          status: 'SHIPPED',
          title: `Dispatched via ${assignedCarrier}`,
          note: `AWB: ${awb}`,
          timestamp: new Date().toISOString(),
        },
      ];

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          courierName: assignedCarrier,
          awbNumber: awb,
          orderStatus: 'SHIPPED',
          timeline: JSON.stringify(updatedTimeline),
        },
      });

      // Audit log
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: session.id,
          action: 'SHIPMENT_BOOKED_NIMBUS',
          entity: 'Order',
          entityId: id,
          metadata: JSON.stringify({
            orderNumber: order.orderNumber,
            carrier: assignedCarrier,
            awb,
          }),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `Shipment booked successfully with ${assignedCarrier}! AWB: ${awb}`,
        awb,
        courierName: assignedCarrier,
        trackingUrl,
        labelUrl,
        order: updatedOrder,
      });
    }

    // ── CASE B: Manual Courier Partner Assignment ──
    if (!courierName || !awbNumber) {
      return NextResponse.json(
        { success: false, message: 'Both Courier Name and AWB Number are required.' },
        { status: 400 }
      );
    }

    const cleanCarrier = courierName.trim();
    const cleanAwb = awbNumber.trim();
    const trackingUrl = getUniversalTrackingUrl(cleanAwb, cleanCarrier);

    // Upsert shipment
    await prisma.shipment.upsert({
      where: { awbNumber: cleanAwb },
      update: {
        courier: cleanCarrier,
        status: 'SHIPPED',
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      },
      create: {
        orderId: order.id,
        courier: cleanCarrier,
        awbNumber: cleanAwb,
        status: 'SHIPPED',
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      },
    }).catch(() => {});

    // Update order
    const existingTimeline = order.timeline ? JSON.parse(order.timeline) : [];
    const updatedTimeline = [
      ...existingTimeline,
      {
        status: 'SHIPPED',
        title: `Assigned to ${cleanCarrier}`,
        note: `AWB: ${cleanAwb}`,
        timestamp: new Date().toISOString(),
      },
    ];

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        courierName: cleanCarrier,
        awbNumber: cleanAwb,
        orderStatus: order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PROCESSING' || order.orderStatus === 'PACKED'
          ? 'SHIPPED'
          : order.orderStatus,
        timeline: JSON.stringify(updatedTimeline),
      },
    });

    // Audit log
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: session.id,
        action: 'COURIER_ASSIGNED',
        entity: 'Order',
        entityId: id,
        metadata: JSON.stringify({
          orderNumber: order.orderNumber,
          carrier: cleanCarrier,
          awb: cleanAwb,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Courier partner ${cleanCarrier} assigned. AWB: ${cleanAwb}`,
      awb: cleanAwb,
      courierName: cleanCarrier,
      trackingUrl,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Shipment assignment error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error while assigning courier.' },
      { status: 500 }
    );
  }
}
