import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, Truck, HeartHandshake } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const revalidate = 30;

export default async function AboutUsPage() {
  const pageContent = await prisma.cMSPage.findUnique({
    where: { slug: 'about-us' },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
          Direct-To-Consumer Tech & Household Store
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F1F1F]">
          {pageContent?.title || 'About FINDIFY.IN'}
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] max-w-xl mx-auto">
          Delivering premium AMOLED smartwatches, ANC earbuds, 4K action cameras, and smart home innovations directly to Indian consumers.
        </p>
      </div>

      <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-2xl p-8 space-y-6 shadow-xs">
        {pageContent ? (
          <div
            className="prose prose-sm max-w-none text-xs leading-relaxed text-[#1F1F1F]"
            dangerouslySetInnerHTML={{ __html: pageContent.content }}
          />
        ) : (
          <div className="space-y-4 text-xs text-[#1F1F1F] leading-relaxed">
            <p>
              FINDIFY.IN is an established Indian e-commerce platform dedicated to curating modern technology products and smart household utilities. We cut out middleman overheads to deliver direct factory-to-doorstep prices with 100% genuine quality guarantees.
            </p>
          </div>
        )}
      </div>

      {/* Brand Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white border border-[#E5DED2] rounded-xl p-6 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-[#C62828] mx-auto" />
          <h3 className="font-bold text-sm text-[#1F1F1F]">Quality Verification</h3>
          <p className="text-xs text-[#666666]">Every batch is tested for performance and safety standard compliance.</p>
        </div>

        <div className="bg-white border border-[#E5DED2] rounded-xl p-6 text-center space-y-2">
          <Truck className="w-8 h-8 text-[#C62828] mx-auto" />
          <h3 className="font-bold text-sm text-[#1F1F1F]">Fast Logistics</h3>
          <p className="text-xs text-[#666666]">Partnered with Delhivery and BlueDart covering 26,000+ Indian pincodes.</p>
        </div>

        <div className="bg-white border border-[#E5DED2] rounded-xl p-6 text-center space-y-2">
          <HeartHandshake className="w-8 h-8 text-[#C62828] mx-auto" />
          <h3 className="font-bold text-sm text-[#1F1F1F]">Customer First</h3>
          <p className="text-xs text-[#666666]">Dedicated phone and email support for all inquiries and warranties.</p>
        </div>
      </div>

    </div>
  );
}
