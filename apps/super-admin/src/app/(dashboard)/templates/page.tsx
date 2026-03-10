'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { TEMPLATE_REGISTRY, TemplateDefinition } from '@repo/types';
import { TemplatePreviewPopup } from '@/components/TemplatePreviewPopup';

interface EngineTemplate {
    id: string;
    templateName: string;
    previewImage: string;
    templateKey: string;
    defaultLayoutConfig: string; // JSON
    sections: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Convert the dynamic code TEMPLATE_REGISTRY into the requested Database model
const generateMockEngineDatabase = (): EngineTemplate[] => {
    return Object.values(TEMPLATE_REGISTRY).map((tpl: TemplateDefinition, i) => {
        // Map types to requested section names
        const sectionMap: Record<string, string> = {
            'hero': 'Hero',
            'featured_listings': 'Listings',
            'about_banner': 'About',
            'how_it_works': 'Communities',
            'testimonials': 'Testimonials',
            'blog_preview': 'Blog',
            'contact_cta': 'Contact',
            'newsletter': 'Footer'
        };

        const mappedSections = tpl.allowedSections.map(s => sectionMap[s] || s);

        return {
            id: `tpl_${i + 1}00${i}`,
            templateName: tpl.name,
            previewImage: tpl.thumbnailUrl || '/images/templates/default.jpg',
            templateKey: tpl.id,
            defaultLayoutConfig: JSON.stringify({
                header: tpl.headerStyle,
                footer: tpl.footerStyle,
                listingLayout: tpl.listingPageLayout,
                locked: tpl.lockedSections,
                defaultHomepage: tpl.defaultHomepageSections.map(s => s.type)
            }, null, 2),
            sections: Array.from(new Set(mappedSections)), // Unique mapped sections
            isActive: true,
            createdAt: '2024-01-15T08:00:00Z',
            updatedAt: new Date().toISOString()
        };
    });
};

export default function TemplateEnginePage() {
    const searchParams = useSearchParams();
    const previewId = searchParams.get('preview');

    const [templates, setTemplates] = useState<EngineTemplate[]>([]);
    const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
    const [viewingJson, setViewingJson] = useState<string | null>(null);

    useEffect(() => {
        setTemplates(generateMockEngineDatabase());
    }, []);

    useEffect(() => {
        if (previewId && TEMPLATE_REGISTRY[previewId as any]) {
            setActivePreviewId(previewId);
        }
    }, [previewId]);

    const toggleStatus = (id: string) => {
        if (confirm('Toggle template availability across the platform? Tenants currently using it will not be affected.')) {
            setTemplates(templates.map(t => t.id === id ? { ...t, isActive: !t.isActive, updatedAt: new Date().toISOString() } : t));
        }
    };

    return (
        <div className="p-8 space-y-10 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Template Engine</h1>
                    <p className="mt-1 text-slate-500 font-medium">Manage pre-built themes from the central registry. Used by brokerages to provision agent websites.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {templates.map((tpl) => (
                    <div key={tpl.id} className={`group relative rounded-[40px] border bg-white shadow-sm transition-all overflow-hidden ${tpl.isActive ? 'border-indigo-100 hover:shadow-2xl hover:border-indigo-300' : 'border-slate-200 opacity-75 grayscale hover:grayscale-0'}`}>
                        <div className="flex flex-col md:flex-row">
                            {/* Preview Thumb */}
                            <div className="w-full md:w-64 bg-slate-100 relative overflow-hidden shrink-0 border-r border-slate-100 flex items-center justify-center">
                                <img
                                    src={tpl.previewImage}
                                    className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                    alt={tpl.templateName}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-br ${tpl.isActive ? 'from-indigo-900/40 via-transparent to-transparent' : 'from-slate-900/60 to-slate-900/40'}`} />
                                <div className="z-10 text-center space-y-4 w-full px-6">
                                    <h3 className="text-xl font-black text-white italic tracking-tighter drop-shadow-lg">{tpl.templateName}</h3>
                                    <button
                                        onClick={() => setActivePreviewId(tpl.templateKey)}
                                        className={`w-full py-3 rounded-2xl font-black text-sm shadow-2xl transition-all transform group-hover:translate-y-[-4px] ${tpl.isActive ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                                    >
                                        Live Preview
                                    </button>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="p-8 flex-1 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                ID: {tpl.id}
                                            </span>
                                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                                KEY: {tpl.templateKey}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleStatus(tpl.id)}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-500 ${tpl.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all transform duration-500 ${tpl.isActive ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Supported Dynamic Sections</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tpl.sections.map((s) => (
                                            <span key={s} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 mt-6">
                                    <div>
                                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Created At</span>
                                        <span className="text-xs font-mono text-slate-600">{new Date(tpl.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Updated</span>
                                        <span className="text-xs font-mono text-slate-600">{new Date(tpl.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setViewingJson(viewingJson === tpl.id ? null : tpl.id)}
                                    className="w-full py-4 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 justify-center hover:bg-slate-50 transition-colors"
                                >
                                    <svg className={`w-4 h-4 transition-transform ${viewingJson === tpl.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8l8 8 8-8" />
                                    </svg>
                                    {viewingJson === tpl.id ? 'Hide Layout Config' : 'View Default Layout Config (JSON)'}
                                </button>

                                {viewingJson === tpl.id && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="bg-slate-900 rounded-2xl p-4 overflow-x-auto">
                                            <pre className="text-[10px] font-mono text-emerald-400">
                                                <code>{tpl.defaultLayoutConfig}</code>
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* High Fidelity Preview Popup */}
            {activePreviewId && (
                <TemplatePreviewPopup
                    templateId={activePreviewId}
                    onClose={() => setActivePreviewId(null)}
                />
            )}
        </div>
    );
}
