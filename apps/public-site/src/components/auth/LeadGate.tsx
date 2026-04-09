'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@repo/auth';
import { authService } from '@repo/services';

interface LeadGateProps {
    isOpen?: boolean;
    onClose?: () => void;
    mandatory?: boolean;
}

/**
 * LeadGate - Premium Authentication Overlay
 * 
 * Gates high-value interaction behind identity verification.
 * Optimized for luxury real estate lead capture.
 * Design: High-contrast dark mode with premium glassmorphism.
 */
export const LeadGate = ({ isOpen = true, onClose, mandatory = false }: LeadGateProps) => {
    const { isAuthenticated } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset success state when closing
    useEffect(() => {
        if (!isOpen) {
            setIsSuccess(false);
        }
    }, [isOpen]);

    if (!isOpen || (isAuthenticated && !isSuccess)) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await authService.login(email, password);
            setIsSuccess(true);
            setTimeout(() => {
                onClose?.();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await authService.register(name, email, password);
            setIsSuccess(true);
            setTimeout(() => {
                onClose?.();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
            {/* Ultra Premium Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-[12px] animate-in fade-in duration-700 cursor-pointer" 
                onClick={mandatory ? undefined : onClose}
            />

            {/* The Gate Card */}
            <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
                
                {isSuccess ? (
                    <div className="p-20 text-center space-y-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                            <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Access Granted</h3>
                        <p className="text-slate-500 font-medium italic uppercase tracking-widest text-xs">Identity Verified · Welcome to the Portfolio</p>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-full max-w-xs mx-auto">
                            <div className="h-full bg-[#4F46E5] w-0 animate-[progress_2s_ease-out_forwards]" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Visual Header - Streamlined Width */}
                        <div className="relative h-48 bg-[#1a1a1c] overflow-hidden flex items-center justify-center text-center">
                            <div className="absolute inset-0 z-0 text-center">
                                <img 
                                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop" 
                                    className="w-full h-full object-cover opacity-40 grayscale brightness-50"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1c]/40 via-[#1a1a1c]/60 to-[#1a1a1c]" />
                            </div>

                            {!mandatory && (
                                <button 
                                    onClick={onClose}
                                    className="absolute top-6 right-8 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors backdrop-blur-md"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}

                            <div className="relative z-10 w-full px-12 space-y-4">
                                <div className="space-y-1">
                                    <h1 className="text-4xl font-[1000] text-white tracking-[0.45em] uppercase leading-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                                        Square<span className="text-[#4F46E5]">FT</span>
                                    </h1>
                                    <div className="flex items-center gap-4 justify-center max-w-[200px] mx-auto">
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Est. MMXXIV</span>
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <h2 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">The Gateway to <span className="text-[#4F46E5] italic">Extraordinary</span></h2>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.1em] leading-relaxed max-w-lg mx-auto opacity-70">
                                        Access North America&apos;s most prestigious real estate portfolio. 
                                        Verify identity to unlock discrete listings.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Area - Compact Vertical */}
                        <div className="relative p-10 space-y-8 overflow-hidden">
                            {/* Watermark Logo */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none -rotate-12 scale-150">
                                <h1 className="text-[140px] font-black tracking-tighter">SQFT</h1>
                            </div>
                            {/* Tabs */}
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <button
                                    onClick={() => setMode('register')}
                                    className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 ${mode === 'register' ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.05)] translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Account Creation
                                </button>
                                <button
                                    onClick={() => setMode('login')}
                                    className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 ${mode === 'login' ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.05)] translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Secure Login
                                </button>
                            </div>

                            <p className="text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest italic">
                                {mode === 'register'
                                    ? "Register for discrete luxury market access"
                                    : "Provide credentials to unlock premium features"}
                            </p>

                            <form className="space-y-6" onSubmit={mode === 'register' ? handleRegister : handleLogin}>
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-2xl flex items-center gap-3">
                                        <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                                        {error}
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <div className="space-y-2.5 group/input">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1 group-focus-within/input:text-[#4F46E5] transition-colors">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full bg-[#f8fafc] border-2 border-transparent rounded-[22px] px-6 py-4.5 text-slate-900 text-[15px] font-bold focus:bg-white focus:border-[#4F46E5]/20 focus:shadow-[0_8px_30px_rgb(79,70,229,0.08)] outline-none transition-all placeholder:text-slate-300 ring-0"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2.5 group/input">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1 group-focus-within/input:text-[#4F46E5] transition-colors">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="identity@contact.com"
                                        className="w-full bg-[#f8fafc] border-2 border-transparent rounded-[22px] px-6 py-4.5 text-slate-900 text-[15px] font-bold focus:bg-white focus:border-[#4F46E5]/20 focus:shadow-[0_8px_30px_rgb(79,70,229,0.08)] outline-none transition-all placeholder:text-slate-300 ring-0"
                                    />
                                </div>

                                <div className="space-y-2.5 group/input">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 pl-1 group-focus-within/input:text-[#4F46E5] transition-colors">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#f8fafc] border-2 border-transparent rounded-[22px] px-6 py-4.5 text-slate-900 text-[15px] font-bold focus:bg-white focus:border-[#4F46E5]/20 focus:shadow-[0_8px_30px_rgb(79,70,229,0.08)] outline-none transition-all placeholder:text-slate-300 tracking-widest ring-0"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative w-full h-16 bg-[#111113] hover:bg-[#1a1a1c] text-white rounded-[24px] overflow-hidden transition-all duration-300 shadow-2xl active:scale-[0.98] disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em]">
                                        {isLoading ? 'Verifying...' : mode === 'register' ? 'Gain Access' : 'Secure Login'}
                                    </span>
                                </button>
                            </form>

                            <div className="pt-4 flex items-center justify-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">End-to-End Encrypted</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">SquareFT Secure</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};
