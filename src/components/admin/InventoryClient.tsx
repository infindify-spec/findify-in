'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Warehouse, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export interface InventoryClientProps {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    categoryName: string;
    stock: number;
    reservedStock: number;
    lowStockThreshold: number;
    movements: Array<{
      id: string;
      type: string;
      quantity: number;
      previousStock: number;
      newStock: number;
      note: string;
      createdAt: string;
    }>;
  }>;
}

export function InventoryClient({ products }: InventoryClientProps) {
  const router = useRouter();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(10);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedProduct,
          stock: (selectedProduct?.stock || 0) + adjustmentQuantity,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Stock updated for ${selectedProduct?.name}`);
        setSelectedProductId(null);
        router.refresh();
      } else {
        toast.error('Failed to update stock');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Inventory Table */}
      <div className="bg-white border border-[#E5DED2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EF] border-b border-[#E5DED2] text-[#666666] font-bold">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Available Stock</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DED2]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF6EF]">
                  <td className="p-3.5">
                    <span className="font-bold text-[#1F1F1F] block">{p.name}</span>
                    <span className="text-[10px] text-[#666666] font-mono">SKU: {p.sku}</span>
                  </td>
                  <td className="p-3.5 text-[#666666] font-medium">{p.categoryName}</td>
                  <td className="p-3.5 text-center font-black text-sm text-[#1F1F1F]">
                    {p.stock} Units
                  </td>
                  <td className="p-3.5 text-center">
                    {p.stock <= 0 ? (
                      <span className="bg-red-50 text-red-700 font-bold px-2.5 py-0.5 rounded text-[10px]">
                        OUT OF STOCK
                      </span>
                    ) : p.stock <= p.lowStockThreshold ? (
                      <span className="bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded text-[10px]">
                        LOW STOCK
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded text-[10px]">
                        HEALTHY
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setSelectedProductId(p.id)}
                      className="bg-[#FAF6EF] hover:bg-[#C62828] text-[#1F1F1F] hover:text-white border border-[#E5DED2] font-bold text-xs py-1.5 px-3 rounded-lg transition-all"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-[#1F1F1F]">
              Adjust Stock for "{selectedProduct.name}"
            </h3>
            <p className="text-xs text-[#666666]">Current stock: <strong>{selectedProduct.stock} units</strong></p>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">Stock Delta (+ to add, - to reduce)</label>
                <input
                  type="number"
                  required
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">Adjustment Note</label>
                <input
                  type="text"
                  placeholder="e.g. Restock shipment received"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2 text-xs focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductId(null)}
                  className="flex-1 bg-white border border-[#E5DED2] text-[#1F1F1F] text-xs font-bold py-2.5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#C62828] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#B71C1C]"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
