import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatINR, formatDate } from '@/lib/utils';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { LogoutButton } from '@/components/storefront/LogoutButton';

export const revalidate = 0;

export default async function CustomerAccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    redirect('/account/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      },
    },
  });

  if (!user) {
    redirect('/account/login');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Account Header */}
      <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#C62828] text-white rounded-full flex items-center justify-center font-black text-xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1F1F1F]">{user.name}</h1>
            <span className="text-xs text-[#666666]">{user.email} {user.phone ? `• ${user.phone}` : ''}</span>
          </div>
        </div>

        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-extrabold text-[#1F1F1F] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C62828]" />
            <span>Order History ({user.orders.length})</span>
          </h2>

          {user.orders.length === 0 ? (
            <div className="bg-white border border-[#E5DED2] rounded-xl p-8 text-center space-y-3">
              <p className="text-xs text-[#666666]">You haven't placed any orders yet.</p>
              <Link href="/products" className="inline-block bg-[#C62828] text-white font-bold text-xs py-2 px-4 rounded-lg">
                Shop Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {user.orders.map((order) => (
                <div key={order.id} className="bg-white border border-[#E5DED2] rounded-xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3 text-xs">
                    <div>
                      <span className="font-extrabold text-[#1F1F1F] block">{order.orderNumber}</span>
                      <span className="text-[10px] text-[#666666]">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#C62828] text-sm block">{formatINR(order.totalAmount)}</span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-[#666666]">
                        <span>{item.productName} (x{item.quantity})</span>
                        <span>{formatINR(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#E5DED2] flex justify-end">
                    <Link
                      href={`/track-order?orderNumber=${order.orderNumber}`}
                      className="text-xs font-bold text-[#C62828] hover:underline"
                    >
                      Track Order Status →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Saved Addresses */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#1F1F1F] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C62828]" />
            <span>Saved Addresses</span>
          </h2>

          <div className="space-y-3">
            {user.addresses.map((addr) => (
              <div key={addr.id} className="bg-white border border-[#E5DED2] rounded-xl p-4 text-xs space-y-1 shadow-xs">
                <span className="font-bold text-[#1F1F1F] block">{addr.fullName}</span>
                <p className="text-[#666666]">{addr.houseFlat}, {addr.street}, {addr.area}</p>
                <p className="text-[#666666]">{addr.city}, {addr.state} - {addr.pincode}</p>
                <span className="text-[10px] font-semibold text-[#1F1F1F] block">Mobile: {addr.mobile}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
