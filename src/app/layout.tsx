import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { CartProvider } from '@/components/storefront/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'FINDIFY.IN | Technology & Smart Household Products India',
  description: 'Shop genuine AMOLED Smartwatches, ANC Wireless Earbuds, 4K Action Cameras, Automatic Touchless Soap Dispensers, and Smart Home Utilities in India with free shipping and Cash on Delivery.',
  keywords: ['tech store india', 'household gadgets', 'smartwatches', 'earbuds', 'dropshipping india', 'findify.in', 'findify commerce'],
  openGraph: {
    title: 'FINDIFY.IN | Technology & Smart Household Products India',
    description: 'Direct-to-Consumer technology and smart household products in India.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-[#171717] min-h-screen flex flex-col antialiased">
        <CartProvider>
          {children}
          <Toaster position="top-right" richColors />
        </CartProvider>
      </body>
    </html>
  );
}

