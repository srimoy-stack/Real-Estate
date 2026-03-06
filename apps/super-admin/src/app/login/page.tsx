'use client';

import { useState } from 'react';
import { Role, useAuthStore } from '@repo/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { setAuth } = useAuthStore();
    const router = useRouter();
    const [email] = useState('');

    const handleMockLogin = (role: Role) => {
        // Since we don't have a real backend, we manually set the user in the store
        // This demonstrates the store + guard integration even without a real API.
        const mockUser = {
            id: 'mock-123',
            email: email || 'admin@example.com',
            name: 'Demo Admin',
            role: role,
            tenantId: 'tenant-abc-123'
        };

        // Use the auth store directly to set mock state.
        setAuth(mockUser, 'mock-jwt-token');
        router.push('/');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans antialiased selection:bg-indigo-500/30">
            <div className="w-full max-w-lg space-y-8 rounded-3xl border border-white/5 bg-slate-900/50 p-8 backdrop-blur-xl md:p-12">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl">Welcome Back</h2>
                    <p className="mt-4 text-base text-slate-400">
                        Select a persona to test the <span className="text-indigo-400 font-medium italic underline decoration-indigo-500/30 underline-offset-4">Role System</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => handleMockLogin(Role.SUPER_ADMIN)}
                        className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 p-4 transition-all hover:border-indigo-500/30 hover:bg-slate-900"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.48V12" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-white">Super Admin</h3>
                                <p className="text-sm text-slate-500">Full Platform Control</p>
                            </div>
                        </div>
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                            <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </button>

                    <button
                        onClick={() => handleMockLogin(Role.BROKERAGE_ADMIN)}
                        className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 p-4 transition-all hover:border-amber-500/30 hover:bg-slate-900"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-white text-opacity-80 group-hover:text-amber-100">Brokerage Admin</h3>
                                <p className="text-sm text-slate-500 italic">Expected: Access Forbidden (403)</p>
                            </div>
                        </div>
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                            <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </button>

                    <p className="text-center text-xs text-slate-600 mt-4 leading-relaxed">
                        Secure Session Management with <code className="text-indigo-400">HTTP-only</code> Cookies (Mocked) <br />
                        & Automatic Tenant ID Injection Pattern Verified.
                    </p>
                </div>
            </div>
        </div>
    );
}
