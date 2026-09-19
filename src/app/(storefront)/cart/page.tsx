'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/storefront/CartContext';
import { formatINR } from '@/lib/utils';
import { Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const freeShippingThreshold = 999;
  const standardShippingFee = 79;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const finalShippingFee = isFreeShipping || cart.length === 0 ? 0 : standardShippingFee;

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount + finalShippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          cartAmount: subtotal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        applyCoupon(data.coupon.code, data.discount);
        setCouponInput('');
      } else {
        toast.error(data.message || 'Invalid Coupon Code');
      }
    } catch {
      toast.error('Failed to validate coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-[#FAF6EF] border border-[#E5DED2] rounded-full flex items-center justify-center mx-auto text-[#C62828]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#1F1F1F]">Your Cart is Empty</h1>
          <p className="text-xs text-[#666666]">Looks like you haven't added any tech or household items yet.</p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#C62828] text-white font-bold text-xs py-3.5 px-8 rounded-xl hover:bg-[#B71C1C] transition-colors shadow-md"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-[#E5DED2] pb-4">
        <h1 className="text-3xl font-extrabold text-[#1F1F1F]">Shopping Cart ({cart.length} Items)</h1>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#1F1F1F]">
          <span>
            {isFreeShipping ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>You unlocked FREE Delivery across India!</span>
              </span>
            ) : (
              <span>Add {formatINR(remainingForFreeShipping)} more for FREE Delivery!</span>
            )}
          </span>
          <span>Target: {formatINR(freeShippingThreshold)}</span>
        </div>
        <div className="w-full bg-[#E5DED2] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#C62828] h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white border border-[#E5DED2] rounded-xl p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-[#FAF6EF] rounded-lg overflow-hidden shrink-0 border border-[#E5DED2]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-bold text-[#1F1F1F] line-clamp-1">{item.name}</h3>
                {item.variantName && (
                  <span className="text-[11px] text-[#666666] block">Option: {item.variantName}</span>
                )}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-sm font-bold text-[#C62828]">{formatINR(item.price)}</span>
                  {item.mrp > item.price && (
                    <span className="text-xs text-[#666666] line-through">{formatINR(item.mrp)}</span>
                  )}
                </div>
              </div>

              {/* Quantity Modifier */}
              <div className="flex items-center border border-[#E5DED2] rounded-lg bg-[#FAF6EF]">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="px-2.5 py-1 text-xs font-bold text-[#1F1F1F] hover:bg-white"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-bold text-[#1F1F1F]">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-2.5 py-1 text-xs font-bold text-[#1F1F1F] hover:bg-white"
                >
                  +
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-[#666666] hover:text-[#C62828] transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="space-y-6">
          
          {/* Coupon Entry Box */}
          <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#C62828]" />
              <span>Apply Discount Coupon</span>
            </h3>

            {appliedCoupon ? (
              <div className="bg-white border border-emerald-300 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase">{appliedCoupon.code}</span>
                  <span className="text-[10px] text-emerald-600 block">Saved {formatINR(appliedCoupon.discount)}</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try FIRST10 or PREPAID100"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-white border border-[#E5DED2] rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#C62828]"
                />
                <button
                  type="submit"
                  disabled={isValidatingCoupon}
                  className="bg-[#C62828] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#B71C1C] transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Order Summary Box */}
          <div className="bg-white border border-[#E5DED2] rounded-xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-[#1F1F1F]">
              <div className="flex justify-between">
                <span className="text-[#666666]">Subtotal ({cart.length} items)</span>
                <span>{formatINR(subtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Product Savings</span>
                  <span>-{formatINR(totalDiscount)}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatINR(appliedCoupon.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#666666]">Estimated Shipping</span>
                <span>{isFreeShipping ? <strong className="text-emerald-700">FREE</strong> : formatINR(finalShippingFee)}</span>
              </div>
            </div>

            <div className="border-t border-[#E5DED2] pt-3 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-[#1F1F1F]">Final Total</span>
              <span className="text-2xl font-black text-[#C62828]">{formatINR(finalTotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#666666] pt-2">
              <ShieldCheck className="w-4 h-4 text-[#C62828]" />
              <span>100% Secure SSL Checkout & Price Protection</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
