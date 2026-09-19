import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, RotateCcw, Headphones, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E2DC]">

      {/* ── Trust Strip ── */}
      <div className="border-b border-[#E5E2DC] py-10">
        <div className="container-site">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: Truck, title: 'Pan-India Delivery', sub: 'Free on orders above ₹999' },
              { Icon: ShieldCheck, title: '100% Genuine Products', sub: 'Verified & quality-checked' },
              { Icon: RotateCcw, title: '7-Day Replacement', sub: 'Easy hassle-free returns' },
              { Icon: Headphones, title: 'Dedicated Support', sub: 'Mon–Sat, 10 AM – 7 PM IST' },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#EAF3EE] rounded-[8px] flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-[#1F5D42]" size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#171717]">{title}</p>
                  <p className="text-[12px] text-[#888888] mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="bg-[#1A4F39]">
        <div className="container-site py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

            {/* Brand */}
            <div className="lg:col-span-2 space-y-5">
              <Link href="/" className="flex items-center gap-2.5">
                <img src="/logo.jpg" alt="FINDIFY.IN Logo" className="h-12 w-auto object-contain rounded-md bg-white p-0.5" />
              </Link>

              <p className="text-[13px] text-[#9DBFB0] leading-relaxed max-w-[280px]">
                India's trusted destination for smart electronics, wearables, and premium household essentials. Quality products, guaranteed.
              </p>

              <div className="space-y-2.5 text-[13px] text-[#9DBFB0]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#7FC9A1]" />
                  <span>102 Tech Park, Sector 62, Noida, UP 201309</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0 text-[#7FC9A1]" />
                  <span>support@findify.in</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 shrink-0 text-[#7FC9A1]" />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-[11px] font-semibold text-[#7FC9A1] uppercase tracking-[0.08em] mb-4">Categories</h4>
              <ul className="space-y-2.5 text-[13px] text-[#9DBFB0]">
                <li><Link href="/products?category=technology" className="hover:text-white transition-colors">Technology &amp; Smart Devices</Link></li>
                <li><Link href="/products?category=household" className="hover:text-white transition-colors">Household &amp; Kitchen</Link></li>
                <li><Link href="/products?sort=best_selling" className="hover:text-white transition-colors">Best Sellers</Link></li>
                <li><Link href="/products?sort=trending" className="hover:text-white transition-colors">Trending Drops</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-[11px] font-semibold text-[#7FC9A1] uppercase tracking-[0.08em] mb-4">Support</h4>
              <ul className="space-y-2.5 text-[13px] text-[#9DBFB0]">
                <li><Link href="/track-order" className="hover:text-white transition-colors font-medium text-white">Track Your Order</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors">My Account &amp; Orders</Link></li>
                <li><Link href="/contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="text-[11px] font-semibold text-[#7FC9A1] uppercase tracking-[0.08em] mb-4">Policies</h4>
              <ul className="space-y-2.5 text-[13px] text-[#9DBFB0]">
                <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund &amp; Cancellation</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[#7A9E90]">
              © {new Date().getFullYear()} FINDIFY.IN. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              {['Razorpay', 'UPI', 'Cards', 'COD'].map((method) => (
                <span key={method} className="bg-white/10 text-white/70 text-[10px] font-medium px-2.5 py-1 rounded-[5px]">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
