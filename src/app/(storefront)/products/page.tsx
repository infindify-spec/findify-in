import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';

export const revalidate = 30;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    inStock?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, search, sort, inStock } = await searchParams;

  // Build Prisma Filter Query
  const where: any = {
    status: 'PUBLISHED',
  };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  if (inStock === 'true') {
    where.stock = { gt: 0 };
  }

  // Sorting
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_low') orderBy = { sellingPrice: 'asc' };
  if (sort === 'price_high') orderBy = { sellingPrice: 'desc' };
  if (sort === 'best_selling') orderBy = { isBestSeller: 'desc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-[#E5DED2] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1F1F1F] capitalize">
            {category ? `${category} Products` : search ? `Search Results for "${search}"` : 'All Products'}
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Showing {products.length} genuine tech & household items
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#666666]">Sort by:</label>
          <form method="GET" className="inline-block">
            {category && <input type="hidden" name="category" value={category} />}
            {search && <input type="hidden" name="search" value={search} />}
            <select
              name="sort"
              defaultValue={sort || 'newest'}
              className="bg-[#FAF6EF] border border-[#E5DED2] text-[#1F1F1F] text-xs font-bold py-2 px-3 rounded-lg focus:outline-none focus:border-[#C62828]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="best_selling">Best Selling</option>
            </select>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-xl p-5 space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
              <h3 className="font-bold text-sm text-[#1F1F1F] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#C62828]" />
                <span>Filters</span>
              </h3>
              {(category || search || inStock) && (
                <Link href="/products" className="text-[11px] font-bold text-[#C62828] hover:underline">
                  Reset
                </Link>
              )}
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Category</h4>
              <ul className="space-y-1.5 text-xs text-[#666666]">
                <li>
                  <Link
                    href={`/products${search ? `?search=${search}` : ''}`}
                    className={`block py-1 hover:text-[#C62828] ${!category ? 'font-bold text-[#C62828]' : ''}`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}${search ? `&search=${search}` : ''}`}
                      className={`block py-1 hover:text-[#C62828] ${category === cat.slug ? 'font-bold text-[#C62828]' : ''}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2 pt-4 border-t border-[#E5DED2]">
              <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">Availability</h4>
              <Link
                href={`/products?${category ? `category=${category}&` : ''}${inStock === 'true' ? '' : 'inStock=true'}`}
                className={`inline-flex items-center gap-2 text-xs py-1 ${inStock === 'true' ? 'font-bold text-[#C62828]' : 'text-[#666666]'}`}
              >
                <input type="checkbox" checked={inStock === 'true'} readOnly className="accent-[#C62828]" />
                <span>In Stock Only</span>
              </Link>
            </div>

          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-2xl p-12 text-center space-y-4">
              <Search className="w-12 h-12 text-[#666666] mx-auto opacity-50" />
              <h3 className="text-lg font-bold text-[#1F1F1F]">No products found</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto">
                We couldn't find any products matching your current search or filter criteria.
              </p>
              <Link
                href="/products"
                className="inline-block bg-[#C62828] text-white font-bold text-xs py-2.5 px-5 rounded-lg hover:bg-[#B71C1C] transition-colors"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  sku={product.sku}
                  mrp={product.mrp}
                  sellingPrice={product.sellingPrice}
                  stock={product.stock}
                  image={product.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
                  isTrending={product.isTrending}
                  isBestSeller={product.isBestSeller}
                />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
