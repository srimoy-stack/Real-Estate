'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@repo/auth';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

const STORAGE_KEY = 'squareft_lead_registered';

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
 * Design: Minimalist dark mode with SquareFT branding.
 */
export function LeadCaptureModal({ isOpen, onSuccess }: LeadCaptureModalProps) {
    const { login, signup } = useAuth();
    const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
    const [activeTab, setActiveTab] = useState<'guest' | 'member'>('guest');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [shake, setShake] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

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
        const validationErrors: Record<string, string> = {};

        if (activeTab === 'guest' && !formData.fullName.trim()) {
            validationErrors.fullName = 'Full name is required';
        }
        
        if (!formData.email.trim()) {
            validationErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            validationErrors.email = 'Please enter a valid email';
        }

        if (!formData.password.trim()) {
            validationErrors.password = 'Password is required';
        } else if (activeTab === 'guest' && formData.password.length < 6) {
            validationErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);
        if (!validate()) return;

        setStep('submitting');

        try {
            if (activeTab === 'guest') {
                await signup({
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                });
            } else {
                await login({
                    email: formData.email,
                    password: formData.password,
                });
            }
            
            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 1000);
        } catch (err: any) {
            console.error('[LeadCapture] Auth failed:', err);
            const message = err.response?.data?.error || 'Authentication failed. Please try again.';
            setApiError(message);
            setShake(true);
            setTimeout(() => setShake(false), 600);
            setStep('form');
        }
    };

    const update = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            const newErrors = { ...errors };
            delete newErrors[key];
            setErrors(newErrors);
        }
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
                    <div className="bg-white rounded-[32px] p-12 text-center shadow-2xl">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Welcome Aboard!</h3>
                        <p className="text-slate-500 font-medium">Unlocking full MLS® search access...</p>
                        <div className="mt-6 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#111113] rounded-full" style={{ animation: 'progressBar 1.5s ease-out forwards' }} />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] overflow-hidden shadow-[0_32px_120px_-20px_rgba(0,0,0,0.6)] border border-white/20">
                        <div className="relative bg-[#1a1a1c] px-8 pt-12 pb-10 text-center overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
                                    className="w-full h-full object-cover opacity-40 grayscale contrast-125"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1c]/80 via-[#1a1a1c]/60 to-[#1a1a1c]" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="mx-auto w-16 h-16 bg-[#111113] border border-white/10 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <span className="text-2xl font-black text-white">FT</span>
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase">
                                        SquareFT <span className="text-slate-400">Exclusive</span>
                                    </h2>
                                    <div className="w-12 h-0.5 bg-white mx-auto opacity-30" />
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pt-8">
                            <div className="flex bg-[#f8fafc] p-1.5 rounded-2xl border border-slate-100">
                                <button
                                    onClick={() => setActiveTab('guest')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'guest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Guest Registration
                                </button>
                                <button
                                    onClick={() => setActiveTab('member')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'member' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Member Login
                                </button>
                            </div>
                        </div>

                        {apiError && (
                            <div className="px-10 pt-4">
                                <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{apiError}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="px-10 py-8 space-y-6">
                            {activeTab === 'guest' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter your name"
                                            value={formData.fullName}
                                            onChange={e => update('fullName', e.target.value)}
                                            className={`w-full h-14 px-6 rounded-2xl bg-[#f8fafc] border ${errors.fullName ? 'border-red-300' : 'border-transparent'} focus:bg-white focus:border-black/10 transition-all outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            placeholder="(555) 000-0000"
                                            value={formData.phone}
                                            onChange={e => update('phone', e.target.value)}
                                            className="w-full h-14 px-6 rounded-2xl bg-[#f8fafc] border border-transparent focus:bg-white focus:border-black/10 transition-all outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={e => update('email', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl bg-[#eff6ff] border ${errors.email ? 'border-red-300' : 'border-transparent'} focus:bg-white focus:border-black/10 transition-all outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => update('password', e.target.value)}
                                    className={`w-full h-14 px-6 rounded-2xl bg-[#eff6ff] border ${errors.password ? 'border-red-300' : 'border-transparent'} focus:bg-white focus:border-black/10 transition-all outline-none text-sm font-bold text-slate-900 tracking-widest placeholder:text-slate-400`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={step === 'submitting'}
                                className="group relative w-full h-16 bg-[#111113] hover:bg-[#1a1a1c] rounded-[24px] overflow-hidden transition-all duration-300 shadow-2xl active:scale-[0.98] disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] text-white">
                                    {step === 'submitting' ? 'Verifying...' : activeTab === 'guest' ? 'Create Account' : 'Secure Login'}
                                </span>
                            </button>

                            <div className="flex items-center justify-center gap-10 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">End-to-End Encrypted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">SquareFT Secure</span>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(60px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes progressBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
        </div>
    );
}
