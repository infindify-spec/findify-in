import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { History, Shield } from 'lucide-react';

export const revalidate = 0;

export default async function AdminActivityLogsPage() {
  const logs = await prisma.adminActivityLog.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { adminUser: true },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5DED2] pb-4">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">SECURITY & COMPLIANCE</span>
        <h1 className="text-2xl font-black text-[#1F1F1F]">Admin Activity Logs ({logs.length})</h1>
        <p className="text-xs text-[#666666] mt-1">Audit log trail capturing administrative operations, price edits, order fulfillment changes, and settings updates.</p>
      </div>

      <div className="bg-white border border-[#E5DED2] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF6EF] border-b border-[#E5DED2] text-[#666666] font-bold">
              <tr>
                <th className="p-3.5">Admin Staff</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DED2]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[#666666]">No activity logs recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF6EF]">
                    <td className="p-3.5 font-bold text-[#1F1F1F]">{log.adminUser.name}</td>
                    <td className="p-3.5">
                      <span className="bg-[#FAF6EF] border border-[#E5DED2] text-[#C62828] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#666666] font-medium">{log.entity}</td>
                    <td className="p-3.5 text-[#666666]">{formatDate(log.createdAt)}</td>
                    <td className="p-3.5 font-mono text-[10px] text-[#666666] max-w-xs truncate">{log.metadata}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
