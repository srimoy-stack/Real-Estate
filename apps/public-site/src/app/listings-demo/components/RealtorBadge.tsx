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
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    DDF® Verified
                </span>
                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-emerald-600 hover:text-emerald-500 underline underline-offset-2 uppercase tracking-wider transition-colors"
                    >
                        REALTOR.ca
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {/* REALTOR.ca Badge */}
            <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/10 border border-white/5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Powered by DDF®
                    </span>
                    <span className="text-[9px] text-slate-500">
                        CREA Data Distribution Facility
                    </span>
                </div>
            </div>

            {/* More Information Link — required by CREA */}
            {link && (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 transition-all group"
                >
                    <svg
                        className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white/90 transition-colors">
                        View on REALTOR.ca
                    </span>
                </a>
            )}

            {/* Trademark notice */}
            <p className="text-[8px] leading-relaxed text-slate-500/60">
                The trademarks REALTOR®, REALTORS®, and the REALTOR® logo are controlled by
                The Canadian Real Estate Association (CREA) and identify real estate professionals
                who are members of CREA.
            </p>
        </div>
    );
}
