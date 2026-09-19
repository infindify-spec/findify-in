import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      name,
      slug,
      sku,
      brand,
      categoryId,
      subcategoryId,
      mrp,
      sellingPrice,
      costPrice,
      stock,
      lowStockThreshold,
      description,
      shortDescription,
      specifications,
      features,
      seoTitle,
      seoDescription,
      status,
      images,
      variants,
    } = payload;

    if (!name || !sku || !slug || !categoryId || !mrp || !sellingPrice) {
      return NextResponse.json({ success: false, message: 'Missing required product fields' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        brand: brand || 'FINDIFY.IN',
        categoryId,
        subcategoryId: subcategoryId || null,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        costPrice: costPrice ? Number(costPrice) : null,
        stock: Number(stock || 0),
        lowStockThreshold: Number(lowStockThreshold || 5),
        description,
        shortDescription: shortDescription || null,
        specifications: specifications ? JSON.stringify(specifications) : null,
        features: features ? JSON.stringify(features) : null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        status: status || 'PUBLISHED',
        images: {
          create: (images || []).map((url: string, idx: number) => ({ url, order: idx })),
        },
        variants: {
          create: (variants || []).map((v: any) => ({
            sku: v.sku,
            name: v.name,
            price: Number(v.price),
            stock: Number(v.stock || 0),
            optionColor: v.optionColor || null,
          })),
        },
        inventoryMovements: {
          create: {
            type: 'RESTOCK',
            quantity: Number(stock || 0),
            previousStock: 0,
            newStock: Number(stock || 0),
            note: 'Initial product creation',
            adminUser: session.name,
          },
        },
      },
    });

    // Activity Log
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: session.id,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: newProduct.id,
        metadata: JSON.stringify({ name: newProduct.name, sku: newProduct.sku }),
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Admin product create error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error creating product' }, { status: 500 });
  }
}
