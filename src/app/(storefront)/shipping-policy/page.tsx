import React from 'react';
import { prisma } from '@/lib/prisma';

export const revalidate = 30;

export default async function ShippingPolicyPage() {
  const page = await prisma.cMSPage.findUnique({ where: { slug: 'shipping-policy' } });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-[#1F1F1F]">
        {page?.title || 'Shipping & Delivery Policy'}
      </h1>
      <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-2xl p-8 text-xs text-[#1F1F1F] leading-relaxed space-y-4">
        {page ? (
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <div className="space-y-4">
            <p><strong>Processing Time:</strong> All orders are processed and handed over to premier courier partners (Delhivery, BlueDart, Ecom Express) within 24 business hours.</p>
            <p><strong>Delivery Timelines:</strong> Standard delivery takes 3 to 5 business days for major metro cities and 5 to 7 days for regional pincodes across India.</p>
            <p><strong>Shipping Charges:</strong> Free delivery on all prepaid orders over ₹999. A nominal ₹79 standard shipping fee applies for orders under ₹999. Cash on Delivery (COD) incurs a ₹49 handling fee.</p>
          </div>
        )}
      </div>
    </div>
  );
}
