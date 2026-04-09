'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@repo/services';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.login(email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-20 bg-[#f8fafc]">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[40px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] border border-slate-100">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-[#111113] rounded-[22px] flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110">
                        <span className="text-xl font-black text-white">FT</span>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                            Welcome <span className="text-slate-400">Back</span>
                        </h2>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest italic">
                            Access your discrete property portfolio
                        </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-2xl flex items-center gap-3">
                            <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-transparent rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:bg-white focus:border-black/10 outline-none transition-all"
                            placeholder="you@squareft.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Password</label>
                            <a href="#" className="text-[9px] font-black uppercase tracking-widest text-slate-900 hover:opacity-60 transition-opacity">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-transparent rounded-2xl px-6 py-4 text-slate-900 text-sm font-bold focus:bg-white focus:border-black/10 outline-none transition-all tracking-widest"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full h-16 bg-[#111113] hover:bg-[#1a1a1c] text-white rounded-[24px] overflow-hidden transition-all duration-300 shadow-2xl active:scale-[0.98] disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em]">
                            {isLoading ? 'Authenticating...' : 'Secure Login'}
                        </span>
                    </button>
                </form>

                <div className="pt-6 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        New to SquareFT?{' '}
                        <Link href="/register" className="text-slate-900 hover:underline underline-offset-4">
                            Register Now
                        </Link>
                    </p>
                </div>

                <div className="pt-8 border-t border-slate-100">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] text-center mb-6">Partnership Integration</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center h-12 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Google</span>
                        </button>
                        <button className="flex items-center justify-center h-12 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Office 365</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
