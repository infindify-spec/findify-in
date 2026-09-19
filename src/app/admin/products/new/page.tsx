import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductFormClient } from '@/components/admin/ProductFormClient';

export const revalidate = 0;

export default async function AdminNewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { subcategories: true },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">CATALOG MANAGEMENT</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Create New Product</h1>
      </div>

      <ProductFormClient
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          subcategories: c.subcategories.map((s) => ({ id: s.id, name: s.name })),
        }))}
      />
    </div>
  );
}
