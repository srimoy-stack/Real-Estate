'use client';

import React from 'react';
import { ShortcodeFilters } from '@repo/types';

interface ListingPreviewComponentProps {
    filters: ShortcodeFilters;
    limit: number;
}

export const ListingPreviewComponent: React.FC<ListingPreviewComponentProps> = ({ filters, limit }) => {
    return (
        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black text-slate-900 tracking-tight">Live Preview</h4>
                <div className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    Demo Mode
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Filters</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) => value && (
                            <span key={key} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                                {key}: {String(value)}
                            </span>
                        ))}
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                            Limit: {limit}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[...Array(Math.min(limit, 4))].map((_, i) => (
                        <div key={i} className="aspect-video bg-slate-200 rounded-xl animate-pulse flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    ))}
                </div>
                {limit > 4 && (
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        + {limit - 4} more items hidden in preview
                    </p>
                )}
            </div>
        </div>
    );
};
