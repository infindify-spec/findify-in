import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, cartAmount } = await req.json();

    if (!code || typeof cartAmount !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Invalid payload' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired coupon code' },
        { status: 400 }
      );
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json(
        { success: false, message: 'Coupon code has expired' },
        { status: 400 }
      );
    }

    if (cartAmount < coupon.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
        },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'Coupon usage limit reached' },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((cartAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error validating coupon' },
      { status: 500 }
    );
  }
}
