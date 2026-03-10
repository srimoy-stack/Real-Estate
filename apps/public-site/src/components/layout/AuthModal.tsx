'use client';

import React, { useState } from 'react';
import { Button, Input } from '@repo/ui';
import { useAuth } from '@repo/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'login') {
                await login({ email, password });
                onClose();
            } else {
                // Handle registration logic here if available
                console.log('Registration not implemented yet');
                setError('Registration is currently disabled.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl transition-all transform animate-in fade-in zoom-in duration-300">
                {/* Top Decorative element */}
                <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">
                            {mode === 'login' ? 'Welcome Back' : 'Join the Future'}
                        </h2>
                        <p className="mt-2 text-slate-500">
                            {mode === 'login'
                                ? 'Sign in to access your saved properties'
                                : 'Create an account to track your dream home'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8 flex p-1 bg-slate-100 rounded-2xl">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <Input
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Doe"
                                required
                            />
                        )}
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jane@example.com"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        {error && (
                            <div className="p-3 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl border border-rose-100 animate-shake">
                                {error}
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                            size="lg"
                        >
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Social Auth (Visual Placeholder) */}
                    <div className="mt-8">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-bold text-slate-700">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                                <span className="text-sm font-bold text-slate-700">GitHub</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-xs text-slate-400">
                        By continuing, you agree to our{' '}
                        <button className="underline hover:text-slate-600">Terms of Service</button> and{' '}
                        <button className="underline hover:text-slate-600">Privacy Policy</button>.
                    </p>
                </div>
            </div>
        </div>
    );
};
