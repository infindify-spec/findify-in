import React from 'react';
import { prisma } from '@/lib/prisma';
import { UserCheck, Shield } from 'lucide-react';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const adminUsers = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">STAFF ACCESS CONTROL</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Admin Staff Users & RBAC ({adminUsers.length})</h1>
      </div>

      <div className="bg-white border border-[#E5DED2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EF] border-b border-[#E5DED2] text-[#666666] font-bold">
              <tr>
                <th className="p-3.5">Staff Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DED2]">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF6EF]">
                  <td className="p-3.5 font-bold text-[#1F1F1F]">{u.name}</td>
                  <td className="p-3.5 text-[#666666] font-mono">{u.email}</td>
                  <td className="p-3.5">
                    <span className="bg-[#C62828] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
