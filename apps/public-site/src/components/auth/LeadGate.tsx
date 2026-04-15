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
    const [showPassword, setShowPassword] = useState(false);

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
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-[12px] animate-in fade-in duration-700 cursor-pointer" 
                onClick={mandatory ? undefined : onClose}
            />

            {/* The Gate Card */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
                
                {isSuccess ? (
                    <div className="p-16 text-center space-y-8">
                        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Access Granted</h3>
                        <p className="text-slate-500 font-medium italic uppercase tracking-widest text-[10px]">Identity Verified · Welcome to the Portfolio</p>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-full max-w-[180px] mx-auto">
                            <div className="h-full bg-slate-900 w-0 animate-[progress_2s_ease-out_forwards]" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Visual Header */}
                        <div className="relative h-44 bg-[#0a0a0b] overflow-hidden flex items-center justify-center text-center">
                            <div className="absolute inset-0 z-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop" 
                                    className="w-full h-full object-cover opacity-30 grayscale brightness-75 scale-110"
                                    alt=""
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0b]/60 to-[#0a0a0b]" />
                            </div>

                            {!mandatory && (
                                <button 
                                    onClick={onClose}
                                    className="absolute top-5 right-5 z-20 w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}

                            <div className="relative z-10 w-full px-10 space-y-3">
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-white tracking-[0.4em] uppercase leading-none">
                                        Square<span className="text-[#4F46E5]">FT</span>
                                    </h1>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Est. MMXXIV</span>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-[10px] font-black text-white tracking-[0.3em] uppercase opacity-90">Gateway to <span className="text-[#4F46E5] italic">Extraordinary</span></h2>
                                </div>
                            </div>
                        </div>

                        {/* Form Area */}
                        <div className="p-8 space-y-8">
                            {/* Tabs - Modern Industry Standard */}
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setMode('register')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg transition-all duration-300 ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Account Creation
                                </button>
                                <button
                                    onClick={() => setMode('login')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg transition-all duration-300 ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Secure Login
                                </button>
                            </div>

                            <form className="space-y-5" onSubmit={mode === 'register' ? handleRegister : handleLogin}>
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-3 animate-shake">
                                        <div className="h-1.5 w-1.5 bg-red-400 rounded-full flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <div className="space-y-2 group">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-slate-900 transition-colors">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="eg. Alexander Hamilton"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3.5 text-slate-950 text-sm font-bold focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-slate-900 transition-colors">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3.5 text-slate-950 text-sm font-bold focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-slate-900 transition-colors">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3.5 text-slate-950 text-sm font-bold focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-300 tracking-widest"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-slate-950 hover:bg-black text-white rounded-lg font-black uppercase tracking-[0.3em] text-[11px] transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-black/10 mt-2"
                                >
                                    {isLoading ? 'Processing...' : mode === 'register' ? 'Create Account' : 'Verification Login'}
                                </button>
                            </form>

                            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">AES-256 Verified</span>
                                </div>
                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">SECURE PORTAL</span>
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
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
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
};
