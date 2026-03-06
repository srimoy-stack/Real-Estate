'use client';

import React from 'react';
interface ImpersonationBannerProps {
    isImpersonating: boolean;
    originalUser: { name: string } | null;
    user: { name: string; email: string } | null;
    stopImpersonation: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({
    isImpersonating,
    originalUser,
    user,
    stopImpersonation
}) => {
    if (!isImpersonating || !originalUser) return null;

    return (
        <div className="bg-amber-600 text-white px-6 py-2 flex items-center justify-between sticky top-0 z-[100] shadow-md animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4">
                <div className="p-1.5 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">System Mode: Impersonation Active</span>
                    <span className="h-1 w-1 bg-amber-400 rounded-full hidden md:block" />
                    <p className="text-xs font-bold leading-none">
                        Logged in as <span className="font-black italic px-1 bg-white/10 rounded">{user?.name}</span> ({user?.email})
                        on behalf of <span className="font-black">{originalUser.name}</span>
                    </p>
                </div>
            </div>

            <button
                onClick={stopImpersonation}
                className="px-4 py-1.5 bg-white text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Exit Session
            </button>
        </div>
    );
};
