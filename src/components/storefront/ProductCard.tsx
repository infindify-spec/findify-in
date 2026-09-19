'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingBag } from 'lucide-react';
import { formatINR, calculateDiscount } from '@/lib/utils';
import { useCart } from './CartContext';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  stock: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  isTrending?: boolean;
  isBestSeller?: boolean;
}

export function ProductCard({
  id, name, slug, mrp, sellingPrice, stock, image,
  rating = 4.8, reviewCount = 24, isTrending, isBestSeller,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const discountPercent = calculateDiscount(mrp, sellingPrice);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock <= 0) return;
    addToCart({ productId: id, name, price: sellingPrice, mrp, image, stock });
  };

  // Pick ONE label badge — bestseller > trending (discount shown separately in price row)
  const labelBadge = isBestSeller
    ? { text: 'Bestseller', cls: 'bg-[#171717] text-white' }
    : isTrending
    ? { text: 'Trending', cls: 'bg-[#EAF3EE] text-[#1F5D42]' }
    : null;

  return (
    <div className="group bg-white border border-[#E5E2DC] rounded-[14px] overflow-hidden hover:border-[#1F5D42] hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(31,93,66,0.12)] transition-all duration-300 flex flex-col">

      {/* Image */}
      <Link href={`/products/${slug}`} className="block relative aspect-square bg-[#F8F7F3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Badges — discount top-left, label top-right */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-[#1F5D42] text-white text-[11px] font-semibold px-2 py-[3px] rounded-[5px] z-10 shadow-xs">
            -{discountPercent}%
          </span>
        )}
        {labelBadge && (
          <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-[3px] rounded-[5px] z-10 shadow-xs ${labelBadge.cls}`}>
            {labelBadge.text}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
          <span className="text-[12px] font-semibold text-[#333]">{rating}</span>
          <span className="text-[11px] text-[#AAAAAA]">({reviewCount})</span>
        </div>

        {/* Title */}
        <Link href={`/products/${slug}`} className="block flex-1">
          <h3 className="text-[13.5px] font-medium text-[#171717] line-clamp-2 hover:text-[#1F5D42] transition-colors leading-snug">
            {name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[15px] font-bold text-[#171717]">
            {formatINR(sellingPrice)}
          </span>
          {mrp > sellingPrice && (
            <span className="text-[12px] text-[#BBBBBB] line-through">
              {formatINR(mrp)}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[12px] font-semibold text-[#1F5D42]">
              {discountPercent}% off
            </span>
          )}
        </div>

        {/* Low stock indicator */}
        {stock > 0 && stock <= 5 && (
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-[4px] self-start">
            Only {stock} left
          </span>
        )}

        {/* CTA */}
        <button
          onClick={handleQuickAdd}
          disabled={stock <= 0}
          className="w-full flex items-center justify-center gap-1.5 h-9 bg-[#EAF3EE] hover:bg-[#1F5D42] text-[#1F5D42] hover:text-white border border-[#C8DDD3] hover:border-[#1F5D42] rounded-[8px] text-[12.5px] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-1"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
