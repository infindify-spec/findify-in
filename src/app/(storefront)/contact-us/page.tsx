'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch {
      toast.error('Network error submitting inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
          WE ARE HERE TO HELP
        </span>
        <h1 className="text-3xl font-extrabold text-[#1F1F1F]">Contact Customer Support</h1>
        <p className="text-xs text-[#666666]">
          Have a question about an order, shipment tracking, or warranty? Send us a message!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Sidebar */}
        <div className="bg-[#FAF6EF] border border-[#E5DED2] rounded-2xl p-6 space-y-6">
          <h3 className="font-extrabold text-base text-[#1F1F1F] border-b border-[#E5DED2] pb-3">
            Contact Information
          </h3>

          <div className="space-y-4 text-xs text-[#1F1F1F]">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Headquarters Address:</strong>
                <span className="text-[#666666]">102 Tech Park, Sector 62, Noida, UP 201309</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Email Support:</strong>
                <span className="text-[#666666]">support@findify.in</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Helpline Phone:</strong>
                <span className="text-[#666666]">+91 98765 43210</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Operating Hours:</strong>
                <span className="text-[#666666]">Monday – Saturday: 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-[#E5DED2] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          
          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900">Inquiry Submitted!</h3>
              <p className="text-xs text-emerald-700">
                Thank you for contacting us. A support specialist will get back to you via email or phone within 24 hours.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="bg-[#C62828] text-white font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-[#B71C1C]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1F1F1F]">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1F1F1F]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1F1F1F]">Mobile Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1F1F1F]">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Order Delivery Status or Return Request"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1F1F1F]">Message / Query *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#FAF6EF] border border-[#E5DED2] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#C62828]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white font-extrabold text-xs py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Contact Inquiry'}</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
