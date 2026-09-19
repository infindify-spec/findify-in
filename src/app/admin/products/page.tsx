import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatINR } from '@/lib/utils';
import { Plus, Edit } from 'lucide-react';
import { DeleteProductButton } from '@/components/admin/DeleteProductButton';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' }, take: 1 },
      variants: true,
    },
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DED2] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">CATALOG MANAGEMENT</span>
          <h1 className="text-2xl font-black text-[#1F1F1F]">Products Directory ({products.length})</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#C62828] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl hover:bg-[#B71C1C] transition-colors flex items-center gap-1.5 shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EF] border-b border-[#E5DED2] text-[#666666] font-bold">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">MRP / Price</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DED2]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF6EF] transition-colors">
                  <td className="p-3.5 flex items-center gap-3">
                    <img
                      src={p.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
                      alt={p.name}
                      className="w-10 h-10 rounded object-cover border border-[#E5DED2]"
                    />
                    <div>
                      <span className="font-bold text-[#1F1F1F] block line-clamp-1">{p.name}</span>
                      <span className="text-[10px] text-[#666666] font-mono">SKU: {p.sku}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-[#666666] font-medium">{p.category.name}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-[#C62828] block">{formatINR(p.sellingPrice)}</span>
                    <span className="text-[10px] text-[#666666] line-through">{formatINR(p.mrp)}</span>
                  </td>
                  <td className="p-3.5">
                    {p.stock <= 0 ? (
                      <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px]">
                        0 Out of Stock
                      </span>
                    ) : p.stock <= p.lowStockThreshold ? (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                        Low: {p.stock} Units
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs">{p.stock} Units</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 bg-[#FAF6EF] hover:bg-[#C62828] text-[#1F1F1F] hover:text-white border border-[#E5DED2] px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
