'use client';

import React from 'react';

interface RealtorBadgeProps {
    listingUrl?: string | null;
    moreInformationLink?: string | null;
    lang?: 'en' | 'fr';
    variant?: 'full' | 'compact';
}

/**
 * CREA DDF Compliant Badge
 *
 * Per CREA rules, every listing sourced from DDF must display:
 * 1. A link back to REALTOR.ca (moreInformationLink)
 * 2. The REALTOR.ca trademark attribution
 *
 * Uses moreInformationLink (priority) → listingUrl (fallback)
 */
export function RealtorBadge({
    listingUrl,
    moreInformationLink,
    variant = 'full',
}: RealtorBadgeProps) {
    const link = moreInformationLink || listingUrl;

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2 mt-1">
                <span className="flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-brand-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-red"></span>
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-800">
                        MLS® Verified
                    </span>
                    {link ? (
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[8px] font-black text-brand-red hover:underline uppercase tracking-wider transition-all"
                        >
                            REALTOR.ca
                        </a>
                    ) : (
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-wider">CREA DDF</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 py-4 px-5 bg-slate-50 border border-slate-100 rounded-2xl">
            {/* Status Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-brand-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">
                        Live Property Data
                    </span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    DDF® Compliant
                </span>
            </div>

            {/* CREA Link Section */}
            <div className="flex flex-col gap-2">
                <span className="text-[9px] text-slate-600 leading-tight">
                    This listing is provided by the CREA Data Distribution Facility (DDF®).
                </span>
                
                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm hover:border-brand-red hover:shadow-md transition-all group max-w-fit"
                    >
                        <svg
                            className="h-4 w-4 text-brand-red group-hover:scale-110 transition-transform"
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
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 group-hover:text-brand-red">
                            Full Details on REALTOR.ca
                        </span>
                    </a>
                )}
            </div>

            {/* Trademark Legal Notice */}
            <div className="border-t border-slate-200 pt-3">
                <p className="text-[7.5px] leading-relaxed text-slate-400 font-medium">
                    The trademarks REALTOR®, REALTORS®, and the REALTOR® logo are controlled by
                    The Canadian Real Estate Association (CREA) and identify real estate professionals
                    who are members of CREA.
                </p>
            </div>
        </div>
    );
}
