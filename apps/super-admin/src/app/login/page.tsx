'use client';

import { useState } from 'react';
import { Role, useAuthStore } from '@repo/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { setAuth } = useAuthStore();
    const router = useRouter();
    const [email, setEmail] = useState('superadmin@example.com');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app, we would verify credentials with a backend
            if (email && password) {
                const mockUser = {
                    id: 'super-admin-1',
                    email: email,
                    name: 'Super Administrator',
                    role: Role.SUPER_ADMIN,
                };

                setAuth(mockUser as any, 'mock-super-admin-token');
                router.push('/dashboard');
            } else {
                setError('Please enter both email and password.');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans antialiased selection:bg-indigo-500/30">
            <div className="w-full max-w-lg space-y-8 rounded-[40px] border border-white/5 bg-slate-900/50 p-8 md:p-12 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 transition-all duration-500 hover:shadow-indigo-500/20">
                <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 shadow-2xl shadow-indigo-500/40 ring-1 ring-white/20 animate-in zoom-in duration-700">
                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="mt-10 text-4xl font-black tracking-tighter text-white sm:text-5xl italic uppercase">
                        Super <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Admin</span>
                    </h2>
                    <p className="mt-4 text-slate-400 font-medium text-lg">
                        Secure Access to the <span className="text-indigo-400 font-black italic">Brokerage Ecosystem</span>
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-12 space-y-6">
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 group-focus-within:text-indigo-400 transition-colors">Admin Identity</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 placeholder:text-slate-700"
                                placeholder="name@domain.com"
                                required
                            />
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 group-focus-within:text-indigo-400 transition-colors">Access Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 placeholder:text-slate-700"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:from-indigo-500 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-wait group flex items-center justify-center gap-3 active:scale-95"
                    >
                        {isLoading ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <>
                                Establish Session
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-slate-600 mt-6 font-black uppercase tracking-widest leading-relaxed">
                        Protected by AES-256 Architecture <br />
                        <span className="text-indigo-500/50 italic font-medium">Session token bound to hardware identity</span>
                    </p>
                </form>
            </div>
        </div>
    );
}
