'use client';

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: string; // unique item key (productId or productId-variantId)
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'id'> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalDiscount: number;
  cartCount: number;
  appliedCoupon: { code: string; discount: number } | null;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [, startTransition] = useTransition();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('findify_cart') || localStorage.getItem('aan_cart');
      if (saved) setCart(JSON.parse(saved));
      const savedCoupon = localStorage.getItem('findify_coupon') || localStorage.getItem('aan_coupon');
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('findify_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity' | 'id'> & { quantity?: number }) => {
    const qty = item.quantity || 1;
    const itemId = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;

    // Show toast immediately — don't wait for state update
    toast.success(`"${item.name}" added to cart`, { duration: 2000 });

    startTransition(() => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === itemId);
        if (existing) {
          const newQty = Math.min(existing.quantity + qty, item.stock);
          return prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i));
        }
        return [...prev, { ...item, id: itemId, quantity: qty }];
      });
    });
  };


  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          if (newQty > item.stock) {
            toast.error(`Maximum stock available is ${item.stock}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('findify_cart');
    localStorage.removeItem('findify_coupon');
    localStorage.removeItem('aan_cart');
    localStorage.removeItem('aan_coupon');
  };

  const applyCoupon = (code: string, discount: number) => {
    setAppliedCoupon({ code, discount });
    localStorage.setItem('findify_coupon', JSON.stringify({ code, discount }));
    toast.success(`Coupon "${code}" applied! You saved ₹${discount}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('findify_coupon');
    localStorage.removeItem('aan_coupon');
    toast.info('Coupon removed');
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalMrp = cart.reduce((acc, item) => acc + item.mrp * item.quantity, 0);
  const totalDiscount = Math.max(0, totalMrp - subtotal);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalDiscount,
        cartCount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
