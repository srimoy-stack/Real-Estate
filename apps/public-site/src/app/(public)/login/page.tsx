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
            router.push('/account/saved-listings');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-emerald-600 text-white text-2xl mb-4">
                        🏠
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">
                        Welcome <span className="text-emerald-600">Back</span>
                    </h2>
                    <p className="text-slate-500 font-medium italic">
                        Login to access your saved properties and searches.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                            <span className="h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-emerald-600 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="pt-6 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-emerald-600 font-black uppercase tracking-widest text-xs hover:underline">
                            Register Now
                        </Link>
                    </p>
                </div>

                <div className="pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-6">Or continue with</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                            <span className="text-lg">G</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
                            <span className="text-lg">F</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Facebook</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
