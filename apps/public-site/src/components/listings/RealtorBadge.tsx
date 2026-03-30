'use client';

import React from 'react';

interface RealtorBadgeProps {
    listingUrl?: string | null;
    moreInformationLink?: string | null;
    variant?: 'full' | 'compact' | 'minimal';
}

/**
 * CREA DDF Compliant Badge (Tailored for Main Public Site)
 */
export function RealtorBadge({
    listingUrl,
    moreInformationLink,
    variant = 'full',
}: RealtorBadgeProps) {
    const link = moreInformationLink || listingUrl;

    if (variant === 'minimal') {
        return (
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    MLS® Verified
                </span>
                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-brand-red hover:text-red-700 underline underline-offset-2 uppercase tracking-wider transition-colors"
                    >
                        REALTOR.ca
                    </a>
                )}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    DDF® Data
                </span>
                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-brand-red hover:underline transition-all"
                    >
                        REALTOR.ca
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded bg-brand-red/10 border border-brand-red/5">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                        Powered by DDF®
                    </span>
                    <span className="text-[8px] text-slate-400 font-medium">
                        CREA Data Distribution Facility
                    </span>
                </div>
            </div>

            {link && (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 transition-all group"
                >
                    <svg
                        className="h-3.5 w-3.5 text-brand-red group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                    </svg>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
                        View on REALTOR.ca
                    </span>
                </a>
            )}
            
            <p className="text-[7px] leading-tight text-slate-400 font-medium italic">
                REALTOR®, REALTORS® and the REALTOR® logo are trademarks of CREA.
            </p>
        </div>
    );
}
