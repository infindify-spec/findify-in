'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setShowConfirm(false);
        if (data.archived) {
          toast.info(data.message); // archived because it has orders
        } else {
          toast.success(data.message); // fully deleted
        }
        router.refresh();
      } else {
        toast.error(data.message || 'Failed to delete product');
      }
    } catch {
      toast.error('Network error — could not delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1 bg-red-50 hover:bg-[#C62828] text-[#C62828] hover:text-white border border-red-200 hover:border-[#C62828] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
        title="Delete product"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5DED2] w-full max-w-sm p-6 space-y-4">
            
            {/* Icon + Title */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#C62828]" />
              </div>
              <div>
                <h2 className="font-black text-[#1F1F1F] text-sm">Delete Product?</h2>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  This action is <span className="font-bold text-[#C62828]">permanent</span> and cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="ml-auto text-[#666666] hover:text-[#1F1F1F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product name */}
            <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-xl px-4 py-3">
              <p className="text-[11px] text-[#666666] mb-0.5">Product to delete:</p>
              <p className="font-bold text-[#1F1F1F] text-xs line-clamp-2">{productName}</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-[#FAF6EF] hover:bg-[#F3E9D8] border border-[#E5DED2] text-[#1F1F1F] font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
