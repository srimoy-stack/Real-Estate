import React from 'react';

interface RealtorBadgeProps {
    listingUrl?: string;
    lang?: 'en' | 'fr';
}

export function RealtorBadge({ listingUrl }: RealtorBadgeProps) {
    return (
        <div className="mt-4 flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2 opacity-60">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Data Feed</span>
            </div>
            {listingUrl && (
                <a
                    href={listingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-slate-500 hover:text-emerald-600 underline underline-offset-2 uppercase tracking-tighter"
                >
                    View Original Source
                </a>
            )}
        </div>
    );
}
