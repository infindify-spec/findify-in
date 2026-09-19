'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface AdminChartsProps {
  salesData: Array<{ day: string; sales: number }>;
}

export function AdminCharts({ salesData }: AdminChartsProps) {
  return (
    <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E5DED2] pb-3">
        <div>
          <h3 className="font-extrabold text-base text-[#1F1F1F]">Revenue & Sales Trend</h3>
          <p className="text-xs text-[#666666]">Weekly sales trajectory across technology and household categories</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C62828" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DED2" />
            <XAxis dataKey="day" stroke="#666666" fontSize={11} />
            <YAxis stroke="#666666" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FAF6EF',
                borderColor: '#E5DED2',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#C62828"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
