import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { orderStatus, paymentStatus, courierName, awbNumber, internalNotes } = body;

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true, orderStatus: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(courierName !== undefined && { courierName }),
        ...(awbNumber !== undefined && { awbNumber }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
    });

    // Audit log
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: session.id,
        action: 'ORDER_UPDATED',
        entity: 'Order',
        entityId: id,
        metadata: JSON.stringify({
          orderNumber: existing.orderNumber,
          prevStatus: existing.orderStatus,
          newStatus: orderStatus,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true, customerName: true, totalAmount: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { orderId: id } });
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    await prisma.adminActivityLog.create({
      data: {
        adminUserId: session.id,
        action: 'ORDER_DELETED',
        entity: 'Order',
        entityId: id,
        metadata: JSON.stringify({
          orderNumber: existing.orderNumber,
          customer: existing.customerName,
          amount: existing.totalAmount,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Order ${existing.orderNumber} deleted permanently.`,
    });
  } catch (error) {
    console.error('Order delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while deleting order. Please try again.' },
      { status: 500 }
    );
  }
}
