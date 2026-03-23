'use client';

import React, { useState, useEffect } from 'react';
import { getAllTemplates, TemplateDefinition, createWebsiteConfig } from '@repo/types';
import { useAuth } from '@repo/auth';
import { TemplateRenderer, TemplateProvider, type TemplateName } from '@repo/ui';

export default function TemplatesPage() {
    useAuth();
    const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
    const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const all = getAllTemplates();
                console.log('CLIENT_ADMIN: Loading all templates', all.length);
                setTemplates(all);
            } catch (err) {
                console.error('CLIENT_ADMIN: Failed to load templates', err);
            }
        };

        fetchTemplates();
    }, []);

    // Some simulated aesthetic colors for placeholders if there are no real images
    const templateColors: Record<string, string> = {
        'modern-realty': 'from-blue-500 to-indigo-600',
        'luxury-estate': 'from-slate-800 to-slate-900',
        'corporate-brokerage': 'from-blue-700 to-blue-900',
        'agent-portfolio': 'from-purple-500 to-indigo-500',
        'minimal-realty': 'from-gray-100 to-gray-200',
    };

    // Build mock data for the inline preview
    const previewConfig = previewTemplate
        ? (() => {
            const mockWebsite = createWebsiteConfig({
                tenantId: 'preview_tenant',
                domain: 'preview.local',
                brandName: 'Prestige Realty Group',
                templateId: previewTemplate as any,
            });
            mockWebsite.homepage.sections = [
                {
                    id: 'preview-hero',
                    type: 'hero',
                    title: 'Hero',
                    isVisible: true,
                    isLocked: true,
                    order: 0,
                    content: {
                        _type: 'hero',
                        headline: 'Find Your Place in the World',
                        subheadline: 'Exclusive listings and bespoke real estate services tailored to your lifestyle.',
                        buttonText: 'Explore Properties',
                        buttonHref: '#',
                        bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600',
                    }
                },
                {
                    id: 'preview-listings',
                    type: 'featured_listings',
                    title: 'Listings',
                    isVisible: true,
                    isLocked: true,
                    order: 1,
                    content: {
                        _type: 'featured_listings',
                        title: 'Curated Collection',
                        subtitle: 'Discover our most sought-after properties.',
                        maxItems: 3,
                    }
                },
                {
                    id: 'preview-about',
                    type: 'about_banner',
                    title: 'About',
                    isVisible: true,
                    isLocked: true,
                    order: 2,
                    content: {
                        _type: 'about_banner',
                        title: 'Expertise You Can Trust',
                        description: 'With over 20 years of experience in the local market, we provide unparalleled guidance for buyers and sellers alike.',
                        buttonText: 'Meet Our Team',
                        buttonHref: '#',
                        imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb81?auto=format&fit=crop&q=80&w=800',
                    }
                },
                {
                    id: 'preview-contact',
                    type: 'contact_cta',
                    title: 'Contact',
                    isVisible: true,
                    isLocked: true,
                    order: 3,
                    content: {
                        _type: 'contact_cta',
                        title: 'Schedule a Private Viewing',
                        description: 'We are here to help you find your dream home. Contact us today for a consultation.',
                        buttonLabel: 'Get In Touch',
                        buttonHref: '#',
                    }
                }
            ];
            return mockWebsite;
        })()
        : null;

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">


            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Design System</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900">
                        Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Templates</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Explore and preview the available website architectures you can provision for your team members.
                    </p>
                </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className="group flex flex-col rounded-[40px] bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-500 overflow-hidden"
                    >
                        {/* Simulated Thumbnail */}
                        <div className={`h-48 w-full bg-gradient-to-br ${templateColors[template.id] || 'from-slate-200 to-slate-300'} relative flex items-center justify-center overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                            {template.id === 'luxury-estate' && <div className="text-amber-400 font-sans text-3xl font-bold tracking-widest italic drop-shadow-lg">LUXURY</div>}
                            {template.id === 'modern-realty' && <div className="text-white font-sans text-3xl font-black tracking-tighter drop-shadow-md">MODERN</div>}
                            {template.id === 'agent-portfolio' && <div className="text-white font-sans text-3xl font-black italic drop-shadow-md">PORTFOLIO</div>}
                            {template.id === 'corporate-brokerage' && <div className="text-white font-sans text-3xl font-bold drop-shadow-md">CLASSIC</div>}
                            {template.id === 'minimal-realty' && <div className="text-slate-800 font-sans text-2xl font-light tracking-widest drop-shadow-sm">MINIMAL</div>}

                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg text-slate-900">
                                {template.headerStyle} header
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">{template.name}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                                {template.description}
                            </p>

                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {template.allowedSections.slice(0, 4).map(sec => (
                                        <span key={sec} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {sec.replace('_', ' ')}
                                        </span>
                                    ))}
                                    {template.allowedSections.length > 4 && (
                                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            +{template.allowedSections.length - 4} more
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setPreviewTemplate(template.id)}
                                    className="w-full py-4 rounded-2xl bg-slate-50 text-indigo-600 font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 group-hover:border-transparent"
                                >
                                    Quick Preview
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal — Inline Render (no iframe, works on Vercel) */}
            {previewTemplate && previewConfig && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-[40px] w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col shadow-2xl relative">
                        {/* Browser-like Header */}
                        <div className="flex items-center justify-between p-4 bg-slate-100 border-b border-slate-200 flex-shrink-0">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            </div>
                            <div className="px-32 py-1.5 bg-white rounded-xl text-[10px] font-black uppercase text-slate-400 tracking-widest shadow-sm">
                                preview.platform.engine/{previewTemplate}
                            </div>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Inline Template Render */}
                        <div className="flex-1 bg-white overflow-y-auto">
                            <TemplateProvider
                                templateId={previewTemplate as TemplateName}
                                navigation={previewConfig.navigation.headerLinks.map(l => ({
                                    label: l.label,
                                    slug: l.href,
                                }))}
                                currentPageSlug="/"
                                organizationName={previewConfig.brandName}
                                branding={{
                                    logoUrl: previewConfig.branding.logoUrl,
                                    primaryColor: previewConfig.branding.primaryColor,
                                }}
                            >
                                <TemplateRenderer
                                    template={previewTemplate as TemplateName}
                                    page="homepage"
                                />
                            </TemplateProvider>
                        </div>

                        {/* Footer Action */}
                        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center flex-shrink-0">
                            <div className="text-sm font-bold text-slate-500 px-4">
                                Viewing <span className="text-indigo-600 font-black">{templates.find(t => t.id === previewTemplate)?.name}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setPreviewTemplate(null);
                                    window.location.href = '/team';
                                }}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                            >
                                Use this template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
