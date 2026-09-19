'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/storefront/CartContext';
import { formatINR } from '@/lib/utils';
import { addressSchema } from '@/lib/validation';
import { ShieldCheck, Truck, Lock, CreditCard, Banknote, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, appliedCoupon, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address form state
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    houseFlat: '',
    street: '',
    area: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    landmark: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pricing calculations
  const freeShippingThreshold = 999;
  const standardShippingFee = 79;
  const codFee = paymentMethod === 'COD' ? 49 : 0;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingFee + codFee);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // 1. Zod Address Validation
    const validationResult = addressSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue: any) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error('Please fix the highlighted errors in your delivery address');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Server-side Order Creation Payload
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          paymentMethod,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Order placed successfully! Order ID: ${data.orderNumber}`);
        clearCart();
        router.push(`/order-success?orderNumber=${data.orderNumber}`);
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (err) {
      toast.error('Network error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-[#1F1F1F]">Your Cart is Empty</h1>
        <p className="text-xs text-[#666666]">Please add products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-[#C62828] text-white font-bold text-xs py-3 px-6 rounded-lg hover:bg-[#B71C1C]"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-[#E5DED2] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1F1F1F]">Secure Checkout</h1>
          <p className="text-xs text-[#666666]">Enter shipping details and choose your payment method</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#666666]">
          <Lock className="w-4 h-4 text-[#C62828]" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Address & Payment Methods */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Customer Shipping Address */}
          <div className="bg-white border border-[#E5DED2] rounded-xl p-6 space-y-6 shadow-xs">
            <h2 className="text-base font-extrabold text-[#1F1F1F] flex items-center gap-2 border-b border-[#E5DED2] pb-3">
              <span className="w-6 h-6 bg-[#C62828] text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
              <span>Delivery & Shipping Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-[#1F1F1F]">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full bg-[#FAF6EF] border rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828] ${
                    errors.fullName ? 'border-red-500' : 'border-[#E5DED2]'
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-[10px]">{errors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F1F1F]">Mobile Number (10 Digits) *</label>
                <input
                  type="text"
                  name="mobile"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`w-full bg-[#FAF6EF] border rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828] ${
                    errors.mobile ? 'border-red-500' : 'border-[#E5DED2]'
                  }`}
                />
                {errors.mobile && <p className="text-red-500 text-[10px]">{errors.mobile}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F1F1F]">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-[#FAF6EF] border rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828] ${
                    errors.email ? 'border-red-500' : 'border-[#E5DED2]'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F1F1F]">Flat / House No. / Building *</label>
                <input
                  type="text"
                  name="houseFlat"
                  placeholder="e.g. Flat 402, Sunshine Apts"
                  value={formData.houseFlat}
                  onChange={handleInputChange}
                  className={`w-full bg-[#FAF6EF] border rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828] ${
                    errors.houseFlat ? 'border-red-500' : 'border-[#E5DED2]'
                  }`}
                />
                {errors.houseFlat && <p className="text-red-500 text-[10px]">{errors.houseFlat}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F1F1F]">Street / Road / Colony *</label>
                <input
                  type="text"
                  name="street"
                  placeholder="e.g. MG Road, Koramangala"
                  value={formData.street}
                  onChange={handleInputChange}
                  className={`w-full bg-[#FAF6EF] border rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828] ${
                    errors.street ? 'border-red-500' : 'border-[#E5DED2]'
                  }`}
                />
                {errors.street && <p className="text-red-500 text-[10px]">{errors.street}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F1F1F]">Area / Locality *</label>
                <input
                  type="text"
                  name="area"
                  placeholder="e.g. 4th Block"
                  value={formData.area}
                  onChange={handleInputChange}
                  className={`w-full bg-[#FAF6EF] border rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828] ${
                    errors.area ? 'border-red-500' : 'border-[#E5DED2]'
                  }`}
                />
                {errors.area && <p className="text-red-500 text-[10px]">{errors.area}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F1F1F]">City *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full bg-[#FAF6EF] border rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828] ${
                    errors.city ? 'border-red-500' : 'border-[#E5DED2]'
                  }`}
                />
                {errors.city && <p className="text-red-500 text-[10px]">{errors.city}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F1F1F]">Indian 6-Digit Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  placeholder="e.g. 560034"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={`w-full bg-[#FAF6EF] border rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#C62828] ${
                    errors.pincode ? 'border-red-500' : 'border-[#E5DED2]'
                  }`}
                />
                {errors.pincode && <p className="text-red-500 text-[10px]">{errors.pincode}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F1F1F]">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C62828]"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Other">Other States</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="bg-white border border-[#E5DED2] rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-extrabold text-[#1F1F1F] flex items-center gap-2 border-b border-[#E5DED2] pb-3">
              <span className="w-6 h-6 bg-[#C62828] text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
              <span>Payment Option</span>
            </h2>

            <div className="space-y-3">
              
              {/* Cash on Delivery */}
              <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'border-[#C62828] bg-[#FAF6EF]' : 'border-[#E5DED2] bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-[#C62828] w-4 h-4"
                    />
                    <Banknote className="w-5 h-5 text-[#C62828]" />
                    <div>
                      <span className="font-bold text-xs text-[#1F1F1F] block">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-[#666666]">Pay cash to courier agent upon delivery. ₹49 COD fee applies.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#C62828]">+₹49 Fee</span>
                </div>
              </label>

              {/* Prepaid / Online Gateway */}
              <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${
                paymentMethod === 'PREPAID' ? 'border-[#C62828] bg-[#FAF6EF]' : 'border-[#E5DED2] bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PREPAID"
                      checked={paymentMethod === 'PREPAID'}
                      onChange={() => setPaymentMethod('PREPAID')}
                      className="accent-[#C62828] w-4 h-4"
                    />
                    <CreditCard className="w-5 h-5 text-[#C62828]" />
                    <div>
                      <span className="font-bold text-xs text-[#1F1F1F] flex items-center gap-2">
                        <span>Prepaid Online Payment</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">RECOMMENDED</span>
                      </span>
                      <span className="text-[10px] text-[#666666]">UPI, GooglePay, PhonePe, Paytm, Cards & NetBanking via Razorpay.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">FREE Shipping</span>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5DED2] rounded-xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#1F1F1F] border-b border-[#E5DED2] pb-3 uppercase tracking-wider">
              Order Items ({cart.length})
            </h3>

            {/* Item Breakdown */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-[#E5DED2]" />
                  <div className="flex-1">
                    <h4 className="font-bold text-[#1F1F1F] line-clamp-1">{item.name}</h4>
                    <span className="text-[#666666] text-[10px]">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#1F1F1F]">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5DED2] pt-4 space-y-2 text-xs text-[#1F1F1F]">
              <div className="flex justify-between">
                <span className="text-[#666666]">Items Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-[#666666]">Shipping Charges</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(shippingFee)}</span>
              </div>

              {paymentMethod === 'COD' && (
                <div className="flex justify-between text-[#C62828] font-medium">
                  <span>COD Convenience Fee</span>
                  <span>+{formatINR(codFee)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-[#E5DED2] pt-3 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-[#1F1F1F]">Total Amount</span>
              <span className="text-2xl font-black text-[#C62828]">{formatINR(finalTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-sm py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#666666] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#C62828]" />
              <span>Includes 7-Day Money Back Guarantee</span>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
