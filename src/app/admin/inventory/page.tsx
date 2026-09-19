import React from 'react';
import { prisma } from '@/lib/prisma';
import { InventoryClient } from '@/components/admin/InventoryClient';

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { stock: 'asc' },
    include: {
      category: true,
      inventoryMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DED2] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">STOCK MANAGEMENT</span>
          <h1 className="text-2xl font-black text-[#1F1F1F]">Inventory Control</h1>
        </div>
        {lowStockCount > 0 && (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            ⚠️ {lowStockCount} Products Low on Stock
          </span>
        )}
      </div>

      <InventoryClient
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          categoryName: p.category.name,
          stock: p.stock,
          reservedStock: p.reservedStock,
          lowStockThreshold: p.lowStockThreshold,
          movements: p.inventoryMovements.map((m) => ({
            id: m.id,
            type: m.type,
            quantity: m.quantity,
            previousStock: m.previousStock,
            newStock: m.newStock,
            note: m.note || '',
            createdAt: m.createdAt.toISOString(),
          })),
        }))}
      />
    </div>
  );
}
