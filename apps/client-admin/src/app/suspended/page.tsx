'use client';

import React from 'react';
import { useAuth } from '@repo/auth';

export default function SuspendedPage() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-12 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                    <div className="absolute inset-0 bg-rose-500/20 blur-[120px] rounded-full" />
                    <div className="relative h-32 w-32 bg-slate-900 border-2 border-rose-500/30 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl">
                        <svg className="h-16 w-16 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">Access <span className="text-rose-500">Suspended</span></h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Your organization's access to the Real Estate Platform has been temporarily suspended by a system administrator.
                    </p>
                </div>

                <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[32px] backdrop-blur-xl text-left space-y-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Typical Causes</p>
                        <ul className="text-xs text-slate-300 space-y-2 font-medium">
                            <li className="flex gap-2"><span>•</span> Overdue subscription payments</li>
                            <li className="flex gap-2"><span>•</span> Terms of Service violation</li>
                            <li className="flex gap-2"><span>•</span> Security maintenance in progress</li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Resolution</p>
                        <p className="text-xs text-slate-400 leading-relaxed font-bold italic">
                            "Please contact your brokerage administrator or reach out to platform support at <span className="text-indigo-400">billing@realestate.com</span> to restore access."
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => logout()}
                    className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl shadow-white/10"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
}
