'use client';

import React, { useState } from 'react';
import { SectionConfig, SectionType } from '@repo/types';
import { SectionRenderer, Navbar, Footer } from '@repo/ui';

// Template Registry Simulation
const TEMPLATE_REGISTRY: Record<SectionType, { name: string; description: string; editableFields: string[] }> = {
    hero: {
        name: 'Hero Header',
        description: 'Large impact visual with CTA',
        editableFields: ['headline', 'subheadline', 'buttonText', 'bgImage']
    },
    featured_listings: {
        name: 'Featured Properties',
        description: 'Dynamic grid of your top listings',
        editableFields: ['title', 'maxItems', 'showPrice']
    },
    how_it_works: {
        name: 'Process Workflow',
        description: 'Step-by-step guide for clients',
        editableFields: ['title', 'steps']
    },
    testimonials: {
        name: 'Client Reviews',
        description: 'Social proof and trust badges',
        editableFields: ['title', 'reviews']
    },
    stats: {
        name: 'Performance Metrics',
        description: 'Counters for sales and success',
        editableFields: ['title', 'stats']
    },
    contact_cta: {
        name: 'Contact Banner',
        description: 'Simple persistent contact trigger',
        editableFields: ['title', 'buttonLabel']
    },
    blog_preview: {
        name: 'Market Insights',
        description: 'Latest news and blog posts',
        editableFields: ['title', 'count']
    },
    newsletter: {
        name: 'Lead Capture',
        description: 'Email subscription form',
        editableFields: ['title', 'placeholder']
    },
    about_banner: {
        name: '',
        description: '',
        editableFields: []
    },
    gallery: {
        name: '',
        description: '',
        editableFields: []
    }
};

const initialSections: SectionConfig[] = [
    { id: 'sec-001', type: 'hero', title: 'Luxury Portfolio Hero', isVisible: true, isLocked: true, order: 0, content: { _type: 'hero', headline: 'Discover Extraordinary Living', subheadline: 'Curated luxury estates for the discerning collector.' } },
    { id: 'sec-002', type: 'featured_listings', title: 'Top Properties', isVisible: true, isLocked: false, order: 1, content: { _type: 'featured_listings', title: 'Featured Listings', maxItems: 6 } },
    { id: 'sec-003', type: 'stats', title: 'Performance Stats', isVisible: false, isLocked: false, order: 2, content: { _type: 'stats', title: 'By the Numbers', stats: [{ label: 'Homes Sold', value: '150+' }, { label: 'Happy Clients', value: '300+' }] } },
    { id: 'sec-004', type: 'contact_cta', title: 'Footer Banner', isVisible: true, isLocked: true, order: 3, content: { _type: 'contact_cta', title: 'Ready to find your dream home?', buttonLabel: 'Contact Us', buttonHref: '/contact' } },
];

export default function WebsiteBuilderPage() {
    const [sections, setSections] = useState<SectionConfig[]>(initialSections);
    const [editingSection, setEditingSection] = useState<SectionConfig | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const toggleVisibility = (id: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;

        // Locked sections logic: Prevent moving locked sections or moving things past them if logic applies
        // For now, simple reorder
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

        // Update order property
        setSections(newSections.map((s, i) => ({ ...s, order: i })));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Structure Console</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                        Homepage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 italic">Architect</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Orchestrate your public identity. Reorder sections, update messaging, and toggle visibility across your digital storefront.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${previewMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-900 hover:border-slate-400'
                            }`}
                    >
                        {previewMode ? 'Exit Preview' : 'Live Preview'}
                    </button>
                    <button className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/10">
                        Publish Changes
                    </button>
                </div>
            </div>

            {/* Main Builder Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Section List */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center justify-between mb-4 px-4">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Home Structure</h2>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 italic">
                            Template: Prestige V1.2
                        </span>
                    </div>

                    <div className="space-y-4">
                        {sections.map((section, index) => (
                            <div
                                key={section.id}
                                className={`group flex items-center gap-6 p-6 rounded-[32px] bg-white border h-32 transition-all duration-300 ${section.isVisible ? 'border-slate-200 shadow-sm' : 'border-slate-100 bg-slate-50/50 opacity-60'
                                    } hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5`}
                            >
                                {/* Drag/Reorder Handles */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        disabled={index === 0}
                                        onClick={() => moveSection(index, 'up')}
                                        className="p-2 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-0 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                                    </button>
                                    <button
                                        disabled={index === sections.length - 1}
                                        onClick={() => moveSection(index, 'down')}
                                        className="p-2 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-0 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                </div>

                                {/* Section Info */}
                                <div className="flex-1 flex items-center gap-6">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${section.isLocked ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
                                        }`}>
                                        {section.type.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-black text-slate-900">{section.title}</h3>
                                            {section.isLocked && (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                                    Locked
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-slate-400">{TEMPLATE_REGISTRY[section.type].name} • {TEMPLATE_REGISTRY[section.type].description}</p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 mr-6 text-[10px] font-bold text-slate-400">
                                        <span>Hidden</span>
                                        <button
                                            onClick={() => toggleVisibility(section.id)}
                                            className={`relative w-12 h-6 rounded-full transition-all duration-500 ${section.isVisible ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all transform duration-500 ${section.isVisible ? 'left-7' : 'left-1'}`} />
                                        </button>
                                        <span>Visible</span>
                                    </div>

                                    <button
                                        onClick={() => setEditingSection(section)}
                                        className="px-6 py-3 rounded-2xl bg-slate-50 text-xs font-black text-slate-600 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest shadow-sm"
                                    >
                                        Edit Content
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[32px] flex items-center justify-center gap-4 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer">
                        <svg className="w-6 h-6 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <span className="text-sm font-black uppercase tracking-widest italic">Add Complementary Section</span>
                    </button>
                </div>
            </div>

            {/* Content Editor Panel (Overlay) */}
            {editingSection && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-end p-0 animate-in fade-in slide-in-from-right duration-300">
                    <div className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">
                                    Edit <span className="text-indigo-600">{editingSection.title}</span>
                                </h3>
                                <p className="text-slate-400 font-bold mt-2">Section Configuration — {TEMPLATE_REGISTRY[editingSection.type].name}</p>
                            </div>
                            <button
                                onClick={() => setEditingSection(null)}
                                className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all"
                            >
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8">
                            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 italic text-slate-500 text-sm font-medium leading-relaxed">
                                "This section belongs to a locked layout. Structural changes are disabled, but you can update all public-facing content fields below."
                            </div>

                            {TEMPLATE_REGISTRY[editingSection.type].editableFields.map(field => (
                                <div key={field} className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    <textarea
                                        defaultValue={(editingSection.content as Record<string, any>)[field] || ''}
                                        placeholder={`Enter ${field}...`}
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[120px] resize-none"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-10 border-t border-slate-100 flex gap-4 bg-white">
                            <button
                                onClick={() => setEditingSection(null)}
                                className="flex-1 py-5 rounded-[24px] bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest"
                            >
                                Discard
                            </button>
                            <button
                                className="flex-2 py-5 rounded-[24px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-2xl"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Preview System */}
            {previewMode && (
                <div className="fixed inset-0 bg-slate-900/95 z-[100] flex flex-col items-center animate-in fade-in duration-500">
                    <div className="w-full h-24 bg-slate-900 border-b border-white/5 flex items-center justify-between px-12 shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white">RE</div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Live Projection</h4>
                                <p className="text-slate-500 text-[9px] font-bold italic tracking-wide">Sync: Local Draft • No Active Diffusion</p>
                            </div>
                        </div>

                        <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                            {[
                                { id: 'desktop', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
                                { id: 'tablet', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
                                { id: 'mobile', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> }
                            ].map(device => (
                                <button
                                    key={device.id}
                                    onClick={() => setPreviewDevice(device.id as any)}
                                    className={`p-3 rounded-xl transition-all ${previewDevice === device.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{device.icon}</svg>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Preview Mode</span>
                            <button
                                onClick={() => setPreviewMode(false)}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-sm transition-all border border-white/10 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                Close Environment
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full overflow-y-auto p-12 flex justify-center scrollbar-hide">
                        <div className={`bg-white shadow-2xl transition-all duration-700 overflow-hidden relative ${previewDevice === 'desktop' ? 'w-full' :
                            previewDevice === 'tablet' ? 'w-[768px]' : 'w-[414px]'
                            } h-fit min-h-full rounded-[48px]`}
                        >
                            <Navbar />
                            <div className="animate-in fade-in zoom-in-95 duration-1000">
                                <SectionRenderer sections={sections} />
                            </div>
                            <Footer />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
