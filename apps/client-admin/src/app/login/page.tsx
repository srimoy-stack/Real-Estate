'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@repo/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@prestigerealty.com');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // In production, this would call the backend API
            // For now, we simulate a successful login
            await new Promise(resolve => setTimeout(resolve, 800));

            // Module 3: Prevent login for suspended tenants
            if (email === 'suspended@brokerage.com') {
                router.push('/suspended' as any);
                return;
            }

            // Mock user for development
            setAuth(
                {
                    id: 'user_1',
                    name: 'John Doe',
                    email: email,
                    role: 'BROKERAGE_ADMIN' as any,
                    tenantId: 'tenant_1',
                    tenantStatus: 'ACTIVE' // Explicitly setting active for main demo
                },
                'mock_access_token_dev'
            );

            router.push('/dashboard' as any);
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md space-y-10">
                {/* Logo */}
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-2xl shadow-indigo-500/30 mb-6">
                        RE
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Client Admin</h1>
                    <p className="mt-2 text-sm text-slate-600 font-medium">Sign in to manage your real estate portfolio</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="p-8 rounded-3xl bg-white shadow-xl border border-slate-200 space-y-5">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium">
                                {error}
                            </div>
                        )}

                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</span>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                placeholder="your@email.com"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</span>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-slate-500 font-medium">
                    Protected by multi-tenant authentication
                </p>
            </div>
        </div>
    );
}
