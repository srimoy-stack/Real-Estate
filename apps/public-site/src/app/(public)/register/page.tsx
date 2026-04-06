'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@repo/services';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.register(name, email, password);
            router.push('/saved-listings');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-[#4F46E5] text-white text-2xl mb-4">
                        ✨
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">
                        Create <span className="text-[#4F46E5]">Account</span>
                    </h2>
                    <p className="text-slate-500 font-medium italic">
                        Join us to start saving properties and getting alerts.
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
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-[#4F46E5]/70 outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-[#4F46E5]/70 outline-none transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-[#4F46E5]/70 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-[#4F46E5] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Account...' : 'Get Started'}
                    </button>
                </form>

                <div className="pt-6 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#4F46E5] font-black uppercase tracking-widest text-xs hover:underline">
                            Login instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
