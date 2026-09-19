import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const payload = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Check stock difference for audit log
    const stockDelta = Number(payload.stock) - existing.stock;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: payload.name,
        mrp: Number(payload.mrp),
        sellingPrice: Number(payload.sellingPrice),
        costPrice: payload.costPrice ? Number(payload.costPrice) : null,
        stock: Number(payload.stock),
        description: payload.description,
        status: payload.status,
      },
    });

    if (stockDelta !== 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: id,
          type: 'MANUAL_ADJUSTMENT',
          quantity: stockDelta,
          previousStock: existing.stock,
          newStock: Number(payload.stock),
          note: 'Manual admin stock adjustment',
          adminUser: session.name,
        },
      });
    }

    // Audit log
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: session.id,
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: id,
        metadata: JSON.stringify({ name: updatedProduct.name, price: updatedProduct.sellingPrice }),
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Admin product update error:', error);
    return NextResponse.json({ success: false, message: 'Server error updating product' }, { status: 500 });
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

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, sku: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Check if any orders reference this product
    const linkedOrderCount = await prisma.orderItem.count({ where: { productId: id } });

    if (linkedOrderCount > 0) {
      // Cannot hard-delete — archive instead to preserve order history
      await prisma.product.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });

      await prisma.adminActivityLog.create({
        data: {
          adminUserId: session.id,
          action: 'PRODUCT_ARCHIVED',
          entity: 'Product',
          entityId: id,
          metadata: JSON.stringify({ id, name: existing.name, reason: 'Has linked orders — archived instead of deleted' }),
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        archived: true,
        message: `"${existing.name}" has ${linkedOrderCount} linked order(s) and was archived instead of deleted. Archived products are hidden from the storefront.`,
      });
    }

    // No orders — safe to fully delete in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.wishlistItem.deleteMany({ where: { productId: id } });
      await tx.inventoryMovement.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    await prisma.adminActivityLog.create({
      data: {
        adminUserId: session.id,
        action: 'PRODUCT_DELETED',
        entity: 'Product',
        entityId: id,
        metadata: JSON.stringify({ id, name: existing.name, sku: existing.sku }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      archived: false,
      message: `"${existing.name}" deleted permanently.`,
    });
  } catch (error) {
    console.error('Admin product delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while deleting product. Please try again.' },
      { status: 500 }
    );
  }
}


