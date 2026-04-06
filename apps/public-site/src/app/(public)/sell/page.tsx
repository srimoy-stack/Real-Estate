'use client';

import React, { useState, useRef } from 'react';

interface FormData {
  name: string;
  phone: string;
  propertyType: string;
  city: string;
  address: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  phone: '',
  propertyType: '',
  city: '',
  address: '',
};

const TRUST_BADGES = [
  { label: '48-Hour Response', icon: '⚡' },
  { label: 'No Obligation', icon: '🛡️' },
  { label: 'Free Evaluation', icon: '✓' },
];

const STATS = [
  { value: '2,400+', label: 'Properties Sold' },
  { value: '$1.2B+', label: 'Total Value Closed' },
  { value: '98%', label: 'Client Satisfaction' },
];

export default function SellPage() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Your name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-+().]{7,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!formData.propertyType) newErrors.propertyType = 'Please select a property type';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.trim()) newErrors.address = 'Property address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      console.log('[Sell Lead Captured]', formData);
      await new Promise((r) => setTimeout(r, 900));
      setShowSuccess(true);
      setFormData(INITIAL_FORM);
      setErrors({});
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const fieldBase = 'w-full px-5 py-4 bg-slate-50 border-2 rounded-xl outline-none font-medium text-slate-900 transition-all duration-200 placeholder:text-slate-400 text-sm';
  const fieldOk = `${fieldBase} border-slate-200 hover:border-slate-300 focus:border-brand-red focus:bg-white focus:ring-4 focus:ring-brand-red/8`;
  const fieldErr = `${fieldBase} border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100`;

  const ErrorMsg = ({ msg }: { msg: string }) => (
    <p className="flex items-center gap-1 text-red-500 text-xs font-semibold ml-0.5 mt-1">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );

  // ── Success ──────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col items-center justify-center px-6">
        <div className="animate-in w-full max-w-md text-center">
          <div className="relative mx-auto mb-8 w-24 h-24">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Lead Received
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Thank you!</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-3">
            Our team will contact you shortly.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
            One of our senior agents will review your property details and reach out within 48 business hours.
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="px-10 py-4 bg-brand-red text-white font-black uppercase text-xs tracking-widest rounded-xl hover:opacity-90 transition-all shadow-xl shadow-brand-red/20 active:scale-[0.97]"
          >
            Submit Another Property
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* ── Full-width Hero ──────────────────────────────────────────── */}
      <section className="relative w-full pt-20 pb-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-50/60 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-10 right-0 w-[350px] h-[350px] bg-brand-red/4 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-100/40 rounded-full blur-2xl" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white border border-slate-200 rounded-full shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              Free Property Evaluation
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-6 max-w-2xl">
            Ready to Sell<br />
            <span className="text-brand-red">Your Property?</span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-xl mb-8">
            Submit your details and our team will contact you with a no-obligation
            market evaluation — typically within 48 hours.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TRUST_BADGES.map((b) => (
              <div
                key={b.label}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 shadow-sm"
              >
                <span className="text-sm leading-none">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + Stats ─────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start justify-center">

          {/* ── Form Card ──────────────────────────────────────────── */}
          <div className="w-full max-w-xl lg:max-w-2xl flex-1">
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-red via-indigo-500 to-brand-red/30" />

              <div className="p-8 sm:p-12">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                    Property Details
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    All fields are required · Takes less than 2 minutes
                  </p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Name + Phone row on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="sell-name" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Full Name <span className="text-brand-red">*</span>
                      </label>
                      <input
                        id="sell-name"
                        type="text"
                        placeholder="e.g. Jane Smith"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={errors.name ? fieldErr : fieldOk}
                      />
                      {errors.name && <ErrorMsg msg={errors.name} />}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label htmlFor="sell-phone" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Phone Number <span className="text-brand-red">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          id="sell-phone"
                          type="tel"
                          inputMode="numeric"
                          placeholder="(416) 000-0000"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className={`${errors.phone ? fieldErr : fieldOk} pl-11`}
                        />
                      </div>
                      {errors.phone && <ErrorMsg msg={errors.phone} />}
                    </div>
                  </div>

                  {/* Property Type + City row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Property Type */}
                    <div className="space-y-1.5">
                      <label htmlFor="sell-property-type" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Property Type <span className="text-brand-red">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="sell-property-type"
                          value={formData.propertyType}
                          onChange={(e) => handleChange('propertyType', e.target.value)}
                          className={`${errors.propertyType ? fieldErr : fieldOk} appearance-none cursor-pointer pr-10`}
                        >
                          <option value="" disabled>Select type…</option>
                          <option value="Residential">🏠 Residential</option>
                          <option value="Commercial">🏢 Commercial</option>
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {errors.propertyType && <ErrorMsg msg={errors.propertyType} />}
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label htmlFor="sell-city" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        City <span className="text-brand-red">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          id="sell-city"
                          type="text"
                          placeholder="e.g. Toronto"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className={`${errors.city ? fieldErr : fieldOk} pl-11`}
                        />
                      </div>
                      {errors.city && <ErrorMsg msg={errors.city} />}
                    </div>
                  </div>

                  {/* Address — full width */}
                  <div className="space-y-1.5">
                    <label htmlFor="sell-address" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Property Address <span className="text-brand-red">*</span>
                    </label>
                    <textarea
                      id="sell-address"
                      rows={3}
                      placeholder="Street address, unit number, postal code…"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className={`${errors.address ? fieldErr : fieldOk} resize-none`}
                    />
                    {errors.address && <ErrorMsg msg={errors.address} />}
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      id="sell-submit"
                      className="w-full py-4 bg-brand-red text-white font-black uppercase text-xs tracking-[0.25em] rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-red/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Submitting…
                        </>
                      ) : (
                        <>
                          Submit
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>

                    <p className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-slate-400 font-semibold">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Your details are private and will never be shared without consent
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Fine print */}
            <p className="mt-5 text-[10px] text-slate-400 text-center font-medium leading-relaxed max-w-lg mx-auto">
              By submitting this form you agree to be contacted by a SquareFT agent regarding your property.
              We follow all CREA and RECO privacy guidelines.
            </p>
          </div>

          {/* ── Right sidebar: stats + why us ────────────────────── */}
          <div className="w-full lg:w-72 lg:sticky lg:top-28 space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Track Record</p>
              </div>
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-6 py-5 flex items-center justify-between ${i < STATS.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <span className="text-sm font-bold text-slate-500">{s.label}</span>
                  <span className="text-xl font-black text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Why SquareFT */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 space-y-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Why SquareFT</p>
              {[
                { icon: '🎯', title: 'Accurate Pricing', text: 'Data-driven evaluations based on live MLS and market trends.' },
                { icon: '🤝', title: 'Expert Agents', text: 'Matched with a specialist who knows your neighbourhood.' },
                { icon: '📣', title: 'Maximum Exposure', text: 'Listed on MLS® and sent to our network of 500+ investors.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-black text-slate-800 mb-0.5">{item.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance badge */}
            <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                CREA &amp; RECO Compliant<br />
                <span className="text-slate-400 font-medium">MLS® Registered Brokerage</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
