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
      slug: rawSlug,
      sku: rawSku,
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

    if (!name || !categoryId || !mrp || !sellingPrice) {
      return NextResponse.json({ success: false, message: 'Missing required product fields' }, { status: 400 });
    }

    // Sanitize and generate unique slug if needed
    let baseSlug = (rawSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    if (!baseSlug) baseSlug = `product-${Date.now()}`;

    let slug = baseSlug;
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Sanitize and generate unique SKU if needed
    let sku = rawSku?.trim() || `SKU-${Date.now()}`;
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      sku = `${sku}-${Math.floor(100 + Math.random() * 900)}`;
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
        description: description || '',
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
          create: (variants || []).map((v: any, idx: number) => ({
            sku: v.sku || `${sku}-V${idx + 1}`,
            name: v.name || `Variant ${idx + 1}`,
            price: Number(v.price || sellingPrice),
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

    // Safely attempt Activity Logging without blocking product creation
    try {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: session.id,
          action: 'PRODUCT_CREATED',
          entity: 'Product',
          entityId: newProduct.id,
          metadata: JSON.stringify({ name: newProduct.name, sku: newProduct.sku }),
        },
      });
    } catch (logErr) {
      console.warn('Failed to write admin activity log:', logErr);
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Admin product create error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error creating product' }, { status: 500 });
  }
}

