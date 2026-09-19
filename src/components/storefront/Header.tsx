'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from './CartContext';

export function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userSession, setUserSession] = useState<{ name: string; email: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/auth/customer/me')
      .then((r) => r.json())
      .then((d) => { if (d.success && d.user) setUserSession(d.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-xs border-b border-[#F0F0F0]' : 'border-b border-[#F2F2F2]'}`}>
      
      {/* Micro Announcement Bar */}
      <div className="bg-[#171717] text-white text-[11px] font-normal text-center py-1 px-4 tracking-wide">
        Free India Delivery on orders over ₹999 &nbsp;·&nbsp; Use code <span className="font-semibold text-[#7FC9A1]">FIRST10</span> for 10% OFF
      </div>

      {/* Main Slim Navbar (60px) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group py-1">
            <img src="/logo.jpg" alt="FINDIFY.IN" className="h-12 sm:h-14 max-h-[52px] w-auto object-contain rounded-md" />
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#444444]">
            <Link href="/products" className="hover:text-[#1F5D42] transition-colors">
              All Products
            </Link>
            <Link href="/products?category=technology" className="hover:text-[#1F5D42] transition-colors">
              Technology
            </Link>
            <Link href="/products?category=household" className="hover:text-[#1F5D42] transition-colors">
              Household
            </Link>
            <Link href="/products?sort=trending" className="hover:text-[#1F5D42] transition-colors text-[#1F5D42] font-semibold">
              Trending
            </Link>
            <Link href="/track-order" className="hover:text-[#1F5D42] transition-colors text-[#666666]">
              Track Order
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 text-[#222222]">
            
            {/* Search Toggle / Input */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-44 sm:w-56 h-8 text-xs bg-[#F7F7F7] border border-[#E0E0E0] rounded-full px-3.5 focus:outline-none focus:border-[#1F5D42]"
                  />
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-1.5 p-1 text-[#888888] hover:text-[#111111]">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 rounded-full hover:bg-[#F5F5F5] text-[#333333] transition-colors"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* User Icon */}
            {userSession ? (
              <Link href="/account" className="p-1.5 rounded-full hover:bg-[#F5F5F5] text-[#333333] transition-colors" title={userSession.name}>
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <Link href="/account/login" className="p-1.5 rounded-full hover:bg-[#F5F5F5] text-[#333333] transition-colors" title="Login / Account">
                <User className="w-4 h-4" />
              </Link>
            )}

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-1.5 rounded-full hover:bg-[#F5F5F5] text-[#333333] transition-colors" title="Cart">
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#1F5D42] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full hover:bg-[#F5F5F5] text-[#333333] transition-colors ml-1"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#EDEDED] bg-white px-5 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#F5F5F5] border border-[#E0E0E0] rounded-full text-xs focus:outline-none focus:border-[#1F5D42]"
            />
          </form>
          <div className="flex flex-col text-xs font-medium text-[#222222] divide-y divide-[#F5F5F5]">
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5">All Products</Link>
            <Link href="/products?category=technology" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5">Technology</Link>
            <Link href="/products?category=household" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5">Household & Kitchen</Link>
            <Link href="/products?sort=trending" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 text-[#1F5D42] font-semibold">Trending Drops 🔥</Link>
            <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5">Track Order</Link>
            <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5">Account</Link>
            <Link href="/about-us" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 text-[#888888]">About Us</Link>
          </div>
        </div>
      )}
    </header>
  );
}
