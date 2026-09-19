'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@dropship.in');
  const [password, setPassword] = useState('Admin@123456');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Welcome back, ${data.admin.name}!`);
        router.push('/admin');
        router.refresh();
      } else {
        toast.error(data.message || 'Invalid admin credentials');
      }
    } catch {
      toast.error('Network authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E5DED2] rounded-2xl p-8 space-y-6 shadow-md">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#C62828] text-white rounded-xl flex items-center justify-center font-black text-2xl mx-auto shadow-xs">
            F
          </div>
          <h1 className="text-2xl font-black text-[#1F1F1F]">Admin Operations Login</h1>
          <p className="text-xs text-[#666666]">
            FINDIFY.IN Commerce Portal • Role-Based Access Control
          </p>
        </div>

        <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-xl p-3 text-[11px] text-[#1F1F1F] space-y-1">
          <span className="font-bold text-[#C62828] block">Default Super Admin Credentials:</span>
          <p>Email: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5DED2]">admin@dropship.in</code></p>
          <p>Password: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5DED2]">Admin@123456</code></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F1F1F]">Admin Email *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-[#C62828]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F1F1F]">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-[#C62828]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#666666] pt-2 border-t border-[#E5DED2]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C62828]" />
          <span>Protected by Next.js JWT Session & RBAC Guards</span>
        </div>

      </div>
    </div>
  );
}
