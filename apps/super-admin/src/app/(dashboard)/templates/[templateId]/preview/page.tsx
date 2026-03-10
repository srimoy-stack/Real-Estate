'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TEMPLATE_REGISTRY } from '@repo/types';

export default function TemplatePreviewFrame() {
    const params = useParams();
    const router = useRouter();
    const templateId = params?.templateId as string;
    const template = TEMPLATE_REGISTRY[templateId as any];

    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    if (!template) return <div className="p-20 text-center font-black text-rose-500">Template Registry Error: Invalid ID</div>;

    const viewportWidths = {
        desktop: '100%',
        tablet: '768px',
        mobile: '375px'
    };

    // Note: In production, this would be an absolute URL to the public-site
    const previewUrl = `http://localhost:3000/demo/${templateId}`;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-100 flex flex-col overflow-hidden">
            {/* ThemeForest style Header Bar */}
            <header className="h-16 bg-slate-900 flex items-center justify-between px-6 shadow-2xl relative z-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-700 hover:border-slate-500"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                        <h1 className="text-white font-black text-sm tracking-tight italic">
                            Platform <span className="text-indigo-500">Preview Engine</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{template.name} Blueprint</p>
                    </div>
                </div>

                {/* Viewport Toggles */}
                <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                        onClick={() => setViewport('desktop')}
                        className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewport('tablet')}
                        className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewport('mobile')}
                        className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Status</span>
                        <span className="text-[10px] font-bold text-slate-500">Live Simulation</span>
                    </div>
                    <button
                        onClick={() => router.push('/organizations')}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-xl transition-all shadow-xl shadow-indigo-900/40 uppercase tracking-widest border border-indigo-500 hover:border-indigo-400"
                    >
                        Assign to Tenant
                    </button>
                </div>
            </header>

            {/* Main Preview Container */}
            <main className="flex-1 relative flex justify-center bg-slate-200/50 overflow-hidden pt-8 pb-8">
                <div
                    className="h-full bg-white shadow-[0_0_100px_rgba(0,0,0,0.15)] rounded-t-2xl transition-all duration-500 border-x border-t border-slate-300 overflow-hidden"
                    style={{ width: viewportWidths[viewport] }}
                >
                    <iframe
                        src={previewUrl}
                        className="w-full h-full border-none"
                        title={`${template.name} Preview`}
                    />
                </div>

                {/* Info Layer (optional branding) */}
                <div className="absolute bottom-12 right-12 flex flex-col gap-3 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-700">
                        <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                            RE
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Preview</p>
                            <p className="text-xs font-bold text-slate-900">{template.name}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
