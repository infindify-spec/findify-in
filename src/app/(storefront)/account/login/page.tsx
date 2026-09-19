'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Phone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const action = isRegister ? 'register' : 'login';
    try {
      const res = await fetch(`/api/auth/customer/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isRegister ? 'Account created successfully!' : 'Logged in successfully!');
        router.push('/account');
        router.refresh();
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch {
      toast.error('Network authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#FAF6EF] border border-[#E5DED2] text-[#C62828] rounded-full flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1F1F1F]">
          {isRegister ? 'Create Customer Account' : 'Customer Login'}
        </h1>
        <p className="text-xs text-[#666666]">
          {isRegister ? 'Register to view order history & track shipments' : 'Log in to access your saved addresses & order history'}
        </p>
      </div>

      <div className="bg-white border border-[#E5DED2] rounded-2xl p-6 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ananya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F1F1F]">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. ananya@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
            />
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1F1F1F]">Mobile Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 9812345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1F1F1F]">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C62828] text-white font-extrabold text-xs py-3 rounded-xl hover:bg-[#B71C1C] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Processing...' : isRegister ? 'Create Account' : 'Log In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5DED2] text-center text-xs text-[#666666]">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsRegister(false)} className="text-[#C62828] font-bold hover:underline">
                Log In Here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button onClick={() => setIsRegister(true)} className="text-[#C62828] font-bold hover:underline">
                Register New Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
