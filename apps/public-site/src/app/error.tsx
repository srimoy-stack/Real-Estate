'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Public Site Experience Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
            <div className="max-w-xl w-full flex flex-col items-center justify-center p-16 animate-in fade-in zoom-in duration-700">
                <div className="h-20 w-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-8 shadow-sm mx-auto">
                    <svg className="h-10 w-10 text-slate-400 font-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter italic">Experience <span className="text-[#4F46E5]">Interrupted</span>.</h1>
                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed mb-12">
                    We encountered a minor turbulence. Our systems are working to restore the perfect browsing experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => reset()}
                        className="px-10 py-5 bg-[#4F46E5] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#4338CA] transition-all shadow-xl shadow-[#4F46E5]/20"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all font-medium"
                    >
                        Home Screen
                    </button>
                </div>
            </div>
        </div>
    );
}
