import React from 'react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How long does delivery take across India?',
      a: 'Orders are dispatched within 24 hours. Delivery takes 3 to 5 business days for major metros and 5 to 7 days for regional pincodes.',
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, Cash on Delivery is available across 26,000+ Indian pincodes. A flat ₹49 COD convenience fee is applied to COD orders.',
    },
    {
      q: 'How can I track my order shipment?',
      a: 'You can track your order status in real time by visiting our Track Order page (/track-order) and entering your Order ID or registered mobile number.',
    },
    {
      q: 'Are the products original and genuine?',
      a: 'Yes! All products sold on FINDIFY.IN are 100% brand new, authentic, and sourced directly from certified manufacturers with brand warranty.',
    },
    {
      q: 'What is the return and replacement policy?',
      a: 'We offer a hassle-free 7-day replacement policy for any damaged, defective, or incorrect items delivered.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[#1F1F1F]">Frequently Asked Questions</h1>
        <p className="text-xs text-[#666666]">Find quick answers to common questions about orders, shipping, and payments.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-[#FAF6EF] border border-[#E5DED2] rounded-xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-[#1F1F1F] flex items-center gap-2">
              <span className="text-[#C62828]">Q:</span> {faq.q}
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed pl-5">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
