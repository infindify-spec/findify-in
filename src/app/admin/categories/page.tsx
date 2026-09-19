import React from 'react';
import { prisma } from '@/lib/prisma';
import { Layers, Plus } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { subcategories: true, _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DED2] pb-4">
        <div>
          <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">TAXONOMY</span>
          <h1 className="text-2xl font-black text-[#1F1F1F]">Categories & Collections ({categories.length})</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <h3 className="font-extrabold text-lg text-[#1F1F1F]">{cat.name}</h3>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded border border-emerald-200">
                {cat._count.products} Products
              </span>
            </div>
            <p className="text-xs text-[#666666]">{cat.description}</p>
            {cat.subcategories.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#1F1F1F] block mb-1.5 uppercase tracking-wider">Subcategories:</span>
                <div className="flex flex-wrap gap-2">
                  {cat.subcategories.map((sub) => (
                    <span key={sub.id} className="bg-[#FAF6EF] border border-[#E5DED2] text-[#1F1F1F] text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
