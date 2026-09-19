'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, MapPin, Check, Zap } from 'lucide-react';
import { formatINR, calculateDiscount } from '@/lib/utils';
import { useCart } from './CartContext';
import { pincodeRegex } from '@/lib/validation';
import { toast } from 'sonner';

export interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    brand: string;
    mrp: number;
    sellingPrice: number;
    stock: number;
    description: string;
    shortDescription?: string;
    specifications?: Record<string, string> | null;
    features?: string[];
    images: string[];
    variants: Array<{ id: string; sku: string; name: string; price: number; stock: number }>;
  };
  reviews: Array<{ id: string; authorName: string; rating: number; comment: string; isVerified: boolean; createdAt: string }>;
}

export function ProductDetailClient({ product, reviews }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');

  const currentPrice = selectedVariant ? selectedVariant.price : product.sellingPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const discountPercent = calculateDiscount(product.mrp, currentPrice);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeRegex.test(pincode)) {
      setPincodeStatus('Serviceable · 3–5 business days');
      toast.success('Pincode serviceable!');
    } else {
      setPincodeStatus('Enter a valid 6-digit pincode.');
      toast.error('Invalid Pincode');
    }
  };

  const handleAddToCart = () => {
    if (currentStock <= 0) return;
    addToCart({ productId: product.id, variantId: selectedVariant?.id, name: product.name, variantName: selectedVariant?.name, price: currentPrice, mrp: product.mrp, image: selectedImage, quantity, stock: currentStock });
  };

  const handleBuyNow = () => {
    if (currentStock <= 0) return;
    handleAddToCart();
    router.push('/checkout');
  };

  const tabs = [
    { key: 'desc', label: 'Overview' },
    { key: 'specs', label: 'Specifications' },
    { key: 'shipping', label: 'Shipping & Returns' },
    { key: 'reviews', label: `Reviews (${reviews.length})` },
  ] as const;

  return (
    <div className="space-y-8">

      {/* Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Image Gallery (9:16 Ultra-tall vertical portrait) */}
        <div className="lg:col-span-4 w-full max-w-[360px] mx-auto lg:max-w-none space-y-3">
          <div className="aspect-[9/16] bg-[#F8F7F3] border border-[#E5E2DC] rounded-[18px] overflow-hidden relative shadow-md">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover object-center" />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-[#1F5D42] text-white font-semibold text-[11px] px-2.5 py-1 rounded-[6px] shadow-sm">
                -{discountPercent}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-12 h-20 bg-[#F8F7F3] rounded-[8px] border-2 overflow-hidden shrink-0 transition-all ${selectedImage === img ? 'border-[#1F5D42] ring-1 ring-[#1F5D42]' : 'border-[#E5E2DC] opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Purchase Info */}
        <div className="lg:col-span-8 space-y-4">

          {/* Brand + Title */}
          <div>
            <span className="text-[10px] font-semibold text-[#1F5D42] uppercase tracking-widest">{product.brand}</span>
            <h1 className="text-[20px] sm:text-[22px] font-[700] text-[#171717] mt-1 leading-snug">{product.name}</h1>
            <p className="text-[11px] text-[#999999] mt-1">SKU: {selectedVariant ? selectedVariant.sku : product.sku}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-[5px] text-[11px] font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>4.8</span>
            </div>
            <span className="text-[11px] text-[#888888]">({reviews.length} Verified Reviews)</span>
          </div>

          {/* Pricing */}
          <div className="bg-[#F8F7F3] border border-[#E5E2DC] rounded-[10px] px-4 py-3 space-y-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[22px] font-[800] text-[#171717]">{formatINR(currentPrice)}</span>
              {product.mrp > currentPrice && (
                <span className="text-[12px] text-[#BBBBBB] line-through">MRP {formatINR(product.mrp)}</span>
              )}
              {discountPercent > 0 && (
                <span className="text-[11px] font-semibold text-[#1F5D42] bg-[#EAF3EE] px-2 py-0.5 rounded-[4px]">
                  Save {formatINR(product.mrp - currentPrice)}
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-[#999999]">Incl. of all taxes. Free shipping on prepaid orders ₹999+</p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#444] uppercase tracking-wider">Select Option:</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-[7px] border transition-all ${selectedVariant?.id === v.id ? 'border-[#1F5D42] bg-[#EAF3EE] text-[#1F5D42]' : 'border-[#E5E2DC] bg-white text-[#444] hover:border-[#444]'}`}
                  >
                    {v.name} — {formatINR(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + CTA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[#444] uppercase tracking-wider">Quantity:</label>
              {currentStock <= 0 ? (
                <span className="text-[11px] font-semibold text-red-600">Out of Stock</span>
              ) : (
                <span className="text-[11px] font-medium text-[#1F5D42]">In Stock ({currentStock} available)</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E5E2DC] rounded-[8px] bg-white overflow-hidden h-9">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="w-9 h-9 text-[#333] hover:bg-[#F8F7F3] font-bold text-sm disabled:opacity-30">−</button>
                <span className="px-3 text-[13px] font-bold text-[#171717]">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))} disabled={quantity >= currentStock} className="w-9 h-9 text-[#333] hover:bg-[#F8F7F3] font-bold text-sm disabled:opacity-30">+</button>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="h-9 flex items-center justify-center gap-1.5 bg-[#EAF3EE] hover:bg-[#1F5D42] text-[#1F5D42] hover:text-white border border-[#C8DDD3] hover:border-[#1F5D42] font-semibold text-[12px] rounded-[8px] transition-all disabled:opacity-40 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className="h-9 flex items-center justify-center gap-1.5 bg-[#1F5D42] hover:bg-[#174A35] text-white font-semibold text-[12px] rounded-[8px] transition-all shadow-sm disabled:opacity-40 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Pincode Check */}
          <div className="bg-white border border-[#E5E2DC] rounded-[10px] px-4 py-3 space-y-2">
            <label className="text-[11px] font-semibold text-[#444] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1F5D42]" />
              Check Delivery Pincode
            </label>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 110001 or 560034"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 bg-[#F8F7F3] border border-[#E5E2DC] rounded-[7px] px-3 py-1.5 text-[12px] focus:outline-none focus:border-[#1F5D42]"
                suppressHydrationWarning
              />
              <button type="submit" className="bg-[#171717] hover:bg-black text-white text-[11px] font-semibold px-4 py-1.5 rounded-[7px] transition-colors">
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className={`text-[11px] ${pincodeStatus.includes('Serviceable') ? 'text-[#1F5D42] font-medium' : 'text-red-600'}`}>
                {pincodeStatus}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-[#E5E2DC] pt-6 space-y-4">
        <div className="flex border-b border-[#E5E2DC] gap-5 text-[12px] font-semibold overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-2.5 border-b-2 transition-all whitespace-nowrap ${activeTab === key ? 'border-[#1F5D42] text-[#1F5D42]' : 'border-transparent text-[#888888] hover:text-[#333]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="text-[13px] text-[#444] leading-relaxed">

          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#555] leading-relaxed">{product.description}</p>
              {product.features && product.features.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[12px] font-semibold text-[#333] uppercase tracking-wider">Key Highlights</h4>
                  <ul className="space-y-1.5">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[12px] text-[#555]">
                        <Check className="w-3.5 h-3.5 text-[#1F5D42] shrink-0 mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-[#F8F7F3] border border-[#E5E2DC] rounded-[10px] p-4">
              {product.specifications ? (
                <div className="divide-y divide-[#E5E2DC]">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="py-2 grid grid-cols-3 text-[12px]">
                      <span className="font-semibold text-[#333]">{key}</span>
                      <span className="col-span-2 text-[#666666]">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#888888]">Standard specifications apply for this item.</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3 text-[12px] text-[#666666]">
              <p><strong className="text-[#333]">Pan-India Shipping:</strong> Orders dispatched within 24 hours. Estimated delivery 3–5 business days.</p>
              <p><strong className="text-[#333]">7-Day Returns:</strong> Defective or damaged? Request a replacement within 7 days of delivery.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-[12px] text-[#888888]">No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="bg-[#F8F7F3] border border-[#E5E2DC] rounded-[10px] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 text-[12px]">{'★'.repeat(r.rating)}</span>
                      {r.isVerified && <span className="text-[10px] font-semibold text-[#1F5D42] bg-[#EAF3EE] px-2 py-0.5 rounded-[4px]">Verified</span>}
                    </div>
                    <p className="text-[12px] italic text-[#555]">"{r.comment}"</p>
                    <span className="text-[10.5px] text-[#999999] block">— {r.authorName}</span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* Sticky Mobile Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E2DC] px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-[#888888] block">Price</span>
          <span className="text-[15px] font-[800] text-[#171717]">{formatINR(currentPrice)}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className="bg-[#1F5D42] text-white font-semibold text-[12px] py-2 px-5 rounded-[8px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>

    </div>
  );
}
