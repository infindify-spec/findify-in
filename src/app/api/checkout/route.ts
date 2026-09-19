import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addressSchema } from '@/lib/validation';
import { trackMetaCAPI } from '@/lib/meta-capi';

export async function POST(req: Request) {
  try {
    const { customer, items, paymentMethod, couponCode } = await req.json();

    // 1. Validate Customer Address
    const addressValidation = addressSchema.safeParse(customer);
    if (!addressValidation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid address parameters' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart items empty' },
        { status: 400 }
      );
    }

    // 2. Fetch and Recalculate Prices Server-side from Database
    let subtotal = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true, images: { orderBy: { order: 'asc' } } },
      });

      if (!dbProduct || dbProduct.status !== 'PUBLISHED') {
        return NextResponse.json(
          { success: false, message: `Product not available` },
          { status: 400 }
        );
      }

      let price = dbProduct.sellingPrice;
      let variantName: string | undefined;

      if (item.variantId) {
        const variant = dbProduct.variants.find((v) => v.id === item.variantId);
        if (variant) {
          price = variant.price;
          variantName = variant.name;
        }
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItemsToCreate.push({
        productId: dbProduct.id,
        variantId: item.variantId || null,
        productName: dbProduct.name,
        variantName: variantName || null,
        price,
        mrp: dbProduct.mrp,
        quantity: item.quantity,
        totalPrice: itemTotal,
        image: dbProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      });
    }

    // 3. Coupon Server-Side Validation & Discount
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        } else {
          discount = coupon.discountValue;
        }

        // Increment coupon used count
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    // 4. Shipping & Fees Calculation
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 999;
    const isFreeShipping = subtotal >= freeShippingThreshold;
    const shippingFee = isFreeShipping ? 0 : (settings?.standardShippingFee ?? 79);
    const codFee = paymentMethod === 'COD' ? (settings?.codCharge ?? 49) : 0;

    const totalAmount = Math.max(0, subtotal - discount + shippingFee + codFee);

    // 5. Generate Order Number (e.g. ORD-IN-10023)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-IN-${randomNum}`;

    const timeline = JSON.stringify([
      { status: 'PENDING', title: 'Order Placed', timestamp: new Date().toISOString() },
      { status: 'CONFIRMED', title: 'Order Confirmed', timestamp: new Date().toISOString() },
    ]);

    // 6. Create Database Order in Transaction
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerPhone: customer.mobile,
        shippingAddress: JSON.stringify(customer),
        subtotal,
        discount,
        shippingFee,
        codFee,
        totalAmount,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'PREPAID',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        orderStatus: 'CONFIRMED',
        couponCode: couponCode || null,
        timeline,
        items: {
          create: orderItemsToCreate,
        },
      },
    });

    // 7. Deduct Inventory & Record Movement
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          type: 'SALE',
          quantity: -item.quantity,
          previousStock: 0,
          newStock: 0,
          note: `Order ${orderNumber} placed`,
        },
      });
    }

    // 8. Meta CAPI Purchase Event with Deduplication Event ID
    const metaEventId = `purch_${newOrder.id}`;
    await trackMetaCAPI({
      eventName: 'Purchase',
      eventId: metaEventId,
      userEmail: customer.email,
      userPhone: customer.mobile,
      customData: {
        currency: 'INR',
        value: totalAmount,
        order_id: orderNumber,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: newOrder.id,
      totalAmount,
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error creating order' },
      { status: 500 }
    );
  }
}
