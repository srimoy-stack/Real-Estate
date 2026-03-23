'use client';

import React, { useState } from 'react';
import { getTemplateByKey } from '@/data/templates';
import { createWebsiteConfig } from '@repo/types';
import { TemplateRenderer, type TemplateName } from '@repo/ui';

// ─── Component ─────────────────────────────────────

interface TemplatePreviewPopupProps {
    templateKey: string;
    onClose: () => void;
}

export function TemplatePreviewPopup({ templateKey, onClose }: TemplatePreviewPopupProps) {
    const template = getTemplateByKey(templateKey);
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    if (!template) return null;

    const viewportWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

    // Build mock website config for inline preview
    const mockWebsite = createWebsiteConfig({
        tenantId: 'preview_tenant',
        domain: 'preview.local',
        brandName: 'Prestige Realty Group',
        templateId: templateKey as any,
    });

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-300 p-4 md:p-10">
            <div className="bg-white w-full h-full rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                <header className="h-16 bg-slate-900 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-700 hover:bg-slate-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div>
                            <h1 className="text-white font-black text-xs">Quick <span className="text-indigo-400">Preview</span></h1>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{template.templateName}</p>
                        </div>
                    </div>

                    <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                        {(['desktop', 'tablet', 'mobile'] as const).map(vp => (
                            <button key={vp} onClick={() => setViewport(vp)} className={`p-2 px-3 rounded-lg transition-all ${viewport === vp ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
                                {vp === 'desktop' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2} /></svg>}
                                {vp === 'tablet' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} /></svg>}
                                {vp === 'mobile' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} /></svg>}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-indigo-200"
                    >
                        Exit Preview
                    </button>
                </header>

                <main className="flex-1 relative flex justify-center bg-slate-50 overflow-hidden pt-10">
                    <div
                        className="h-full bg-white shadow-[0_0_100px_rgba(0,0,0,0.1)] rounded-t-[32px] transition-all duration-700 overflow-auto border-x border-t border-slate-200"
                        style={{ width: viewportWidths[viewport] }}
                    >
                        <TemplateRenderer
                            template={templateKey as TemplateName}
                            page="homepage"
                            navigation={mockWebsite.navigation.headerLinks.map(l => ({
                                label: l.label,
                                href: l.href,
                                slug: l.href, // keep both for compatibility
                            }))}
                            organizationName={mockWebsite.brandName}
                            branding={{
                                logoUrl: mockWebsite.branding.logoUrl,
                                primaryColor: mockWebsite.branding.primaryColor,
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
