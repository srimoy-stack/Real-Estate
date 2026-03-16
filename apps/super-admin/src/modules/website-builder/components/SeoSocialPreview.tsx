import React from 'react';
import { Card } from '@repo/ui';

export const SeoSocialPreview: React.FC = () => {
    return (
        <Card variant="standard" padding="md">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">Master OG Identity</h3>
            <div className="aspect-[1.91/1] rounded-3xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-200 group cursor-pointer hover:border-indigo-400 transition-all overflow-hidden relative">
                <div className="text-center group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-slate-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Global Social Image</p>
                </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-6 leading-relaxed">This image is used when no page-specific social image is defined.</p>
        </Card>
    );
};
