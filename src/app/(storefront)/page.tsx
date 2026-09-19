import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Truck, ShieldCheck, RotateCcw, Headphones, Star } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ScrollReveal } from '@/components/storefront/ScrollReveal';
import { MarqueeTicker } from '@/components/storefront/MarqueeTicker';

export const revalidate = 30;

export default async function HomePage() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    take: 4,
  });

  // Fetch exactly 4 products for the homepage — no overflow
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED', OR: [{ isFeatured: true }, { isBestSeller: true }, { isTrending: true }] },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    take: 4,
  });

  // Fallback: if no featured/trending, just show first 4 published products
  const displayProducts = products.length > 0 ? products : await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    take: 4,
  });

  const reviews = await prisma.review.findMany({
    where: { status: 'APPROVED' },
    take: 3,
  });

  const heroBanner = banners[0] || {
    title: 'Next-Gen Smart Electronics & Wearables',
    subtitle: 'Upgrade your digital lifestyle with smart electronics, innovative gadgets and everyday essentials — delivered across India.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '/products?category=technology',
    badgeText: 'FESTIVE SALE — UP TO 60% OFF',
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="border-b border-[#E5E2DC] bg-[#F8F7F3] overflow-hidden">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-0 items-stretch min-h-[480px]">

            {/* Left: Content */}
            <ScrollReveal className="flex flex-col justify-center py-8 lg:py-16 pr-0 lg:pr-12">
              {heroBanner.badgeText && (
                <div className="inline-flex items-center gap-2 bg-[#EAF3EE] text-[#1F5D42] text-[11px] font-semibold px-3 py-1.5 rounded-[6px] self-start mb-5 shadow-xs animate-pulse-glow">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F5D42]" />
                  {heroBanner.badgeText}
                </div>
              )}

              <h1 className="text-[36px] sm:text-[44px] font-[700] text-[#171717] tracking-[-0.02em] leading-[1.1] mb-4">
                {heroBanner.title}
              </h1>

              <p className="text-[15px] text-[#666666] leading-[1.65] max-w-[420px] mb-7">
                {heroBanner.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-7">
                <Link
                  href={heroBanner.linkUrl || '/products'}
                  className="inline-flex items-center gap-2 h-[46px] px-6 bg-[#1F5D42] hover:bg-[#174A35] text-white text-[13.5px] font-semibold rounded-[8px] transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Explore Products
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products?sort=trending"
                  className="inline-flex items-center gap-2 h-[46px] px-5 bg-white hover:bg-[#F2EDE3] text-[#333] text-[13.5px] font-medium rounded-[8px] border border-[#E5E2DC] transition-all active:scale-[0.98]"
                >
                  View Deals
                </Link>
              </div>

              {/* Compact trust row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] font-medium text-[#666666]">
                {['Pan-India Delivery', 'COD Available', '7-Day Replacement'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1F5D42] shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            {/* Right: Image */}
            <ScrollReveal delay={150} className="hidden lg:block relative overflow-hidden">
              <img
                src={heroBanner.imageUrl}
                alt={heroBanner.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Floating trust badge */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2.5 bg-white/95 backdrop-blur-sm border border-[#E5E2DC] shadow-lg rounded-[10px] px-3.5 py-2.5 animate-float">
                <div className="w-7 h-7 bg-[#EAF3EE] rounded-[6px] flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-[#1F5D42]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#171717] leading-none">Free Shipping</p>
                  <p className="text-[10px] text-[#999999] mt-0.5">On orders above ₹999</p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ── INFINITE MARQUEE TICKER ── */}
      <MarqueeTicker />

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-[#F8F7F3] border-y border-[#E5E2DC]">
        <div className="container-site py-12">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10.5px] font-semibold text-[#1F5D42] uppercase tracking-[0.08em] mb-1">Handpicked for you</p>
                <h2 className="text-[22px] sm:text-[24px] font-[700] text-[#171717] tracking-[-0.01em]">Featured Products</h2>
              </div>
              <Link href="/products" className="text-[12.5px] font-medium text-[#1F5D42] hover:text-[#174A35] flex items-center gap-1 group">
                View all <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {displayProducts.map((product, idx) => (
              <ScrollReveal key={product.id} delay={idx * 100}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  sku={product.sku}
                  mrp={product.mrp}
                  sellingPrice={product.sellingPrice}
                  stock={product.stock}
                  image={product.images[0]?.url || fallbackImage}
                  isTrending={product.isTrending}
                  isBestSeller={product.isBestSeller}
                />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200} className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 h-[44px] px-7 bg-white border border-[#E5E2DC] hover:border-[#1F5D42] text-[#171717] hover:text-[#1F5D42] text-[13px] font-semibold rounded-[8px] transition-all shadow-xs hover:shadow-md"
            >
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── WHY SHOP WITH US ── */}
      <section className="container-site py-12">
        <ScrollReveal>
          <h2 className="text-[22px] font-[700] text-[#171717] tracking-[-0.01em] mb-8 text-center sm:text-left">Why Shop with FINDIFY.IN?</h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { Icon: ShieldCheck, title: 'Quality Products', sub: 'Verified & quality-checked' },
            { Icon: Truck, title: 'Pan-India Delivery', sub: 'Free above ₹999' },
            { Icon: RotateCcw, title: 'Easy Returns', sub: '7-day replacement' },
            { Icon: Headphones, title: 'Support', sub: 'Mon–Sat, 10AM–7PM' },
          ].map(({ Icon, title, sub }, idx) => (
            <ScrollReveal key={title} delay={idx * 80}>
              <div className="flex items-start gap-3 p-4 bg-[#F8F7F3] rounded-[12px] border border-[#E5E2DC] hover:border-[#1F5D42] hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="w-9 h-9 bg-[#EAF3EE] rounded-[8px] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#1F5D42]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#171717]">{title}</p>
                  <p className="text-[11.5px] text-[#888888] mt-0.5">{sub}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      {reviews.length > 0 && (
        <section className="bg-[#F8F7F3] border-t border-[#E5E2DC]">
          <div className="container-site py-12">
            <ScrollReveal>
              <h2 className="text-[22px] font-[700] text-[#171717] tracking-[-0.01em] mb-8">Customer Stories</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.map((rev, idx) => (
                <ScrollReveal key={rev.id} delay={idx * 100}>
                  <div className="bg-white border border-[#E5E2DC] rounded-[14px] p-6 space-y-3.5 hover:shadow-md hover:border-[#1F5D42] transition-all duration-300">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-[13.5px] text-[#444] leading-relaxed italic">"{rev.comment}"</p>
                    <div className="flex items-center justify-between pt-3 border-t border-[#F0EDE8]">
                      <div>
                        <p className="text-[12.5px] font-bold text-[#171717]">{rev.authorName}</p>
                        <p className="text-[11px] text-[#AAAAAA]">Verified Buyer</p>
                      </div>
                      {rev.isVerified && (
                        <span className="text-[10.5px] font-medium text-[#1F5D42] bg-[#EAF3EE] px-2.5 py-1 rounded-[6px]">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ── */}
      <section className="border-t border-[#E5E2DC]">
        <div className="container-site py-12">
          <ScrollReveal>
            <div className="max-w-[480px] mx-auto text-center space-y-3">
              <h2 className="text-[20px] font-[700] text-[#171717]">Get Exclusive Deals</h2>
              <p className="text-[13px] text-[#888888]">Early access to sales and new arrivals. No spam, ever.</p>
              <form className="flex gap-2 pt-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 h-[44px] px-4 bg-[#F8F7F3] border border-[#E5E2DC] rounded-[8px] text-[13px] placeholder-[#BBBBBB] focus:outline-none focus:border-[#1F5D42] transition-colors"
                />
                <button
                  type="submit"
                  className="h-[44px] px-6 bg-[#1F5D42] hover:bg-[#174A35] text-white text-[13px] font-semibold rounded-[8px] transition-all shadow-md active:scale-[0.98] shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}


