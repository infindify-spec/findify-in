import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { code, discountType, discountValue, minOrderValue, maxDiscount, isPrepaidOnly } = await req.json();

    if (!code || !discountValue) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        isPrepaidOnly: !!isPrepaidOnly,
        isActive: true,
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        adminUserId: session.id,
        action: 'COUPON_CREATED',
        entity: 'Coupon',
        entityId: coupon.id,
        metadata: JSON.stringify({ code: coupon.code, discountValue: coupon.discountValue }),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error('Coupon create error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error creating coupon' }, { status: 500 });
  }
}
