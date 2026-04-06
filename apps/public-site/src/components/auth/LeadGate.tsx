'use client';

import React, { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui';
import { useAuth } from '@repo/auth';
import { authService } from '@repo/services';

export const LeadGate = () => {
    const { isAuthenticated, hasHydrated } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            // Show gate after a small delay for dramatic effect
            const timer = setTimeout(() => setIsVisible(true), 1200);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [hasHydrated, isAuthenticated]);

    if (!isVisible) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await authService.login(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
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
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
            {/* Ultra Premium Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[20px] animate-in fade-in duration-1000" />

            {/* Animated Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4F46E5]/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] animate-pulse delay-700" />

            {/* The Gate Card */}
            <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">

                {/* Visual Header */}
                <div className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center">
                    <SafeImage
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
                        alt="Luxury Architecture"
                        fill
                        className="object-cover opacity-40 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    <div className="relative z-10 text-center space-y-3">
                        <div className="h-20 w-20 rounded-3xl bg-[#4F46E5] mx-auto flex items-center justify-center shadow-2xl shadow-[#4F46E5]/40 transform -rotate-6">
                            <span className="text-white font-black text-3xl italic leading-none">A</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase px-4">
                            Unlock <span className="text-[#4F46E5]/60">Exclusive</span> Access
                        </h2>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    {/* Tabs */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Guest Registration
                        </button>
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Member Login
                        </button>
                    </div>

                    <p className="text-center text-slate-500 text-sm font-medium italic">
                        {mode === 'register'
                            ? "Join our discrete network to view luxury listings and market analytics."
                            : "Welcome back. Identity verification required to proceed."}
                    </p>

                    <form className="space-y-5" onSubmit={mode === 'register' ? handleRegister : handleLogin}>
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                                <span className="h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                                {error}
                            </div>
                        )}

                        {mode === 'register' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-[#4F46E5]/70 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-[#4F46E5]/70 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Access Code</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-[#4F46E5]/70 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:bg-[#4F46E5] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : mode === 'register' ? 'Gain Access' : 'Authorize'}
                        </button>
                    </form>

                    <div className="pt-4 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 opacity-40">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-40">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Global Authentication</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
