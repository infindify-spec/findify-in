import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductFormClient } from '@/components/admin/ProductFormClient';

export const revalidate = 0;

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variants: true },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { subcategories: true },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">CATALOG MANAGEMENT</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Edit Product: {product.name}</h1>
      </div>

      <ProductFormClient
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          subcategories: c.subcategories.map((s) => ({ id: s.id, name: s.name })),
        }))}
        initialProduct={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          slug: product.slug,
          brand: product.brand,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          mrp: product.mrp,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          description: product.description,
          shortDescription: product.shortDescription,
          status: product.status as any,
          images: product.images.map((img) => img.url),
        }}
      />
    </div>
  );
}
