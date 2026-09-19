import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';

export const revalidate = 30; // Cache for 30s — reduces DB load and speeds up page loads

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      variants: true,
      category: true,
      subcategory: true,
      reviews: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product || product.status === 'ARCHIVED') {
    notFound();
  }

  // Fetch related products in same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'PUBLISHED',
    },
    take: 4,
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  });

  return (
    <div className="container-site py-5 space-y-8">

      {/* Breadcrumb */}
      <nav className="text-[11px] text-[#999999] flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-[#1F5D42]">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#1F5D42]">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#1F5D42]">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-[#333] font-medium truncate max-w-[220px]">{product.name}</span>
      </nav>

      {/* Main Interactive Product Detail Component */}
      <ProductDetailClient
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          brand: product.brand || 'FINDIFY.IN',
          mrp: product.mrp,
          sellingPrice: product.sellingPrice,
          stock: product.stock,
          description: product.description,
          shortDescription: product.shortDescription || undefined,
          specifications: product.specifications ? JSON.parse(product.specifications) : null,
          features: product.features ? JSON.parse(product.features) : [],
          images: product.images.length > 0 ? product.images.map((img) => img.url) : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            name: v.name,
            price: v.price,
            stock: v.stock,
          })),
        }}
        reviews={product.reviews.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          rating: r.rating,
          comment: r.comment,
          isVerified: r.isVerified,
          createdAt: r.createdAt.toISOString(),
        }))}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-6 border-t border-[#E5E2DC] space-y-4">
          <h2 className="text-[15px] font-[700] text-[#171717]">You might also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                sku={p.sku}
                mrp={p.mrp}
                sellingPrice={p.sellingPrice}
                stock={p.stock}
                image={p.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
