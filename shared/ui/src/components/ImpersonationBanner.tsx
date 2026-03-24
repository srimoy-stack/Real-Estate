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
                <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="7" r="4" strokeWidth={2.5} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    </svg>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">Impersonation Session Active</span>
                    <span className="h-1 w-1 bg-amber-400 rounded-full hidden md:block" />
                    <p className="text-xs font-bold leading-none">
                        Logged in as <span className="font-black px-1.5 py-0.5 bg-white/20 rounded ml-1">{user?.name}</span>
                        <span className="mx-2 text-amber-200">on behalf of</span>
                        <span className="font-black border-b border-white/20">{originalUser.name}</span>
                    </p>
                </div>
            </div>

            <button
                onClick={() => {
                    // TASK 3: Exit Confirmation
                    if (window.confirm("Are you sure you want to exit impersonation?")) {
                        // TASK 3: Return Flow
                        localStorage.removeItem('isImpersonating');
                        localStorage.removeItem('impersonatedOrgId');
                        localStorage.removeItem('impersonatedOrgName');
                        stopImpersonation();

                        // Redirect back to Super Admin
                        window.location.href = 'http://localhost:3001/dashboard';
                    }
                }}
                className="px-4 py-1.5 bg-white text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Return to Super Admin
            </button>
        </div>
    );
};
