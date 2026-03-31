'use client';

import React, { useState, useEffect } from 'react';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    interestedIn: string;
    budget: string;
    message: string;
}

const STORAGE_KEY = 'skyline_lead_registered';

/**
 * Check if the user has already registered (persisted in localStorage).
 */
export function isLeadRegistered(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Premium Lead Capture Modal
 * 
 * Gates the full property search behind a registration form.
 * Captures high-quality leads (name, email, phone, preferences)
 * before granting access to the full MLS search engine.
 * 
 * Design: Glassmorphism overlay with brand-red accents.
 */
export function LeadCaptureModal({ isOpen, onSuccess }: LeadCaptureModalProps) {
    const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
        interestedIn: '',
        budget: '',
        message: '',
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [shake, setShake] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const validate = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[\d\s\-\+\(\)]{7,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setStep('submitting');

        try {
            // Submit lead to the API
            await fetch('/api/ddf/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    interestedIn: formData.interestedIn,
                    budget: formData.budget,
                    message: formData.message,
                    source: 'search_gate',
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (err) {
            // Even if API fails, allow access — we still captured the intent
            console.error('[LeadCapture] API submission failed:', err);
        }

        // Persist registration
        localStorage.setItem(STORAGE_KEY, 'true');

        setStep('success');
        setTimeout(() => {
            onSuccess();
        }, 1500);
    };

    const update = (key: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />

            {/* Modal Container */}
            <div
                className={`relative z-10 w-full max-w-lg mx-4 ${shake ? 'animate-shake' : ''}`}
                style={{ animation: 'modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                {step === 'success' ? (
                    /* ─── Success State ─────────────────────── */
                    <div className="bg-white rounded-[32px] p-12 text-center shadow-2xl">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Welcome Aboard!</h3>
                        <p className="text-slate-500 font-medium">Unlocking full MLS® search access...</p>
                        <div className="mt-6 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-red rounded-full" style={{ animation: 'progressBar 1.5s ease-out forwards' }} />
                        </div>
                    </div>
                ) : (
                    /* ─── Form State ─────────────────────── */
                    <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)]">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-8 text-center relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-brand-red/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-red/20 border border-brand-red/30 rounded-full mb-4">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-red"></span>
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-red">Exclusive Access</span>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
                                    Unlock <span className="text-brand-red italic">Full MLS®</span> Search
                                </h2>
                                <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">
                                    Register to access thousands of verified listings, advanced filters, and real-time property data.
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1.5">Full Name *</label>
                                <input
                                    id="lead-name"
                                    type="text"
                                    placeholder="John Smith"
                                    value={formData.fullName}
                                    onChange={e => update('fullName', e.target.value)}
                                    className={`w-full h-13 px-5 rounded-2xl bg-slate-50 border ${errors.fullName ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} focus:bg-white focus:border-brand-red/30 focus:ring-4 focus:ring-brand-red/5 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300`}
                                />
                                {errors.fullName && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.fullName}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1.5">Email Address *</label>
                                <input
                                    id="lead-email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => update('email', e.target.value)}
                                    className={`w-full h-13 px-5 rounded-2xl bg-slate-50 border ${errors.email ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} focus:bg-white focus:border-brand-red/30 focus:ring-4 focus:ring-brand-red/5 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300`}
                                />
                                {errors.email && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1.5">Phone Number *</label>
                                <input
                                    id="lead-phone"
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    value={formData.phone}
                                    onChange={e => update('phone', e.target.value)}
                                    className={`w-full h-13 px-5 rounded-2xl bg-slate-50 border ${errors.phone ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} focus:bg-white focus:border-brand-red/30 focus:ring-4 focus:ring-brand-red/5 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300`}
                                />
                                {errors.phone && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.phone}</p>}
                            </div>

                            {/* Property Interest + Budget — Side by Side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1.5">Interested In</label>
                                    <select
                                        id="lead-interest"
                                        value={formData.interestedIn}
                                        onChange={e => update('interestedIn', e.target.value)}
                                        className="w-full h-13 px-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-red/30 outline-none transition-all text-xs font-bold text-slate-900 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select...</option>
                                        <option value="buying">Buying</option>
                                        <option value="renting">Renting</option>
                                        <option value="selling">Selling</option>
                                        <option value="investing">Investing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-1.5">Budget Range</label>
                                    <select
                                        id="lead-budget"
                                        value={formData.budget}
                                        onChange={e => update('budget', e.target.value)}
                                        className="w-full h-13 px-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-red/30 outline-none transition-all text-xs font-bold text-slate-900 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select...</option>
                                        <option value="under-500k">Under $500K</option>
                                        <option value="500k-1m">$500K - $1M</option>
                                        <option value="1m-2m">$1M - $2M</option>
                                        <option value="2m-5m">$2M - $5M</option>
                                        <option value="5m+">$5M+</option>
                                    </select>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={step === 'submitting'}
                                className="w-full h-14 bg-brand-red hover:bg-slate-900 disabled:bg-slate-300 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-brand-red/20 hover:shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {step === 'submitting' ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Activating Access...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Unlock Full Access
                                    </>
                                )}
                            </button>

                            {/* Trust Indicators */}
                            <div className="flex items-center justify-center gap-6 pt-2">
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Secure
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    No Spam
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                    </svg>
                                    Free Access
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Animations */}
            <style jsx global>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes progressBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
}
