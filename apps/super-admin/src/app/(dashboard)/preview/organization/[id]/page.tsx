'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    orgWebsiteService,
} from '@repo/services';
import {
    OrgWebsite,
    OrgWebsitePage,
} from '@repo/types';
import {
    HeroSection,
    FeaturedListings,
    AgentSection,
    ContactSection,
    TextSection,
    ImageSection,
} from '@repo/ui';

// Map section types to renderable components
const SECTION_COMPONENTS: Record<string, React.FC<any>> = {
    hero: HeroSection,
    listings: FeaturedListings,
    agent_profiles: AgentSection,
    agents: AgentSection,
    contact: ContactSection,
    text: TextSection,
    image: ImageSection,
    testimonials: ({ title }: { title?: string }) => (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title || 'What Our Clients Say'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {[
                        { name: 'Sarah M.', text: 'Absolutely wonderful experience. Found our dream home in record time!' },
                        { name: 'James K.', text: 'Professional, knowledgeable, and always available. Highly recommend!' },
                        { name: 'Lisa P.', text: 'Made the entire selling process smooth and stress-free.' },
                    ].map(t => (
                        <div key={t.name} className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-slate-600 leading-relaxed ">&ldquo;{t.text}&rdquo;</p>
                            <p className="mt-6 font-black text-slate-900 text-sm">{t.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    ),
    gallery: () => (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-12">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-200 rounded-2xl overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-${1600585154340 + i * 100}-be6161a56a0c?auto=format&fit=crop&q=80&w=400`} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    ),
};

export default function PreviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string; // organizationId

    const [website, setWebsite] = useState<OrgWebsite | null>(null);
    const [pages, setPages] = useState<OrgWebsitePage[]>([]);
    const [activePage, setActivePage] = useState<OrgWebsitePage | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const ws = await orgWebsiteService.getOrgWebsite(id);
                setWebsite(ws);
                if (ws) {
                    const pgs = await orgWebsiteService.getPages(id, ws.id);
                    setPages(pgs);
                    setActivePage(pgs.find(p => p.slug === '/') || pgs[0] || null);
                }
            } catch (err) {
                console.error('Preview fetch error', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getTemplateVariant = (): string => {
        const tpl = website?.templateId || 'modern-realty';
        const map: Record<string, string> = {
            'modern-realty': 'default',
            'luxury-estate': 'luxury',
            'corporate-brokerage': 'corporate',
            'agent-portfolio': 'agent',
            'minimal-realty': 'minimal',
        };
        return map[tpl] || 'default';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center space-y-4">
                    <div className="h-14 w-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating Preview...</p>
                </div>
            </div>
        );
    }

    const widthMap = { desktop: '100%', tablet: '768px', mobile: '375px' };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Preview Chrome */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h2 className="text-sm font-black text-slate-900">Preview: {website?.organizationName}</h2>
                        <p className="text-[10px] font-mono text-slate-400">{website?.domain}</p>
                    </div>
                </div>

                {/* Page Selector */}
                <div className="flex items-center gap-2">
                    {pages.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActivePage(p)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePage?.id === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            {p.title}
                        </button>
                    ))}
                </div>

                {/* Device Selector */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
                    {(['desktop', 'tablet', 'mobile'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title={mode}
                        >
                            {mode === 'desktop' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            {mode === 'tablet' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                            {mode === 'mobile' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview Frame */}
            <div className="bg-slate-100 rounded-[32px] p-4 min-h-[80vh] flex justify-center">
                <div
                    style={{ width: widthMap[viewMode], maxWidth: '100%', transition: 'width 0.3s ease' }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Simulated Header */}
                    <header className="bg-slate-900 text-white px-8 py-5 flex items-center justify-between">
                        <h3 className="font-black text-lg tracking-tight">{website?.organizationName}</h3>
                        <nav className="flex gap-6">
                            {pages.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setActivePage(p)}
                                    className={`text-xs font-bold transition-colors ${activePage?.id === p.id ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                                >
                                    {p.title}
                                </button>
                            ))}
                        </nav>
                    </header>

                    {/* Sections from layoutConfig */}
                    <div className="flex flex-col">
                        {activePage?.layoutConfig?.sections?.map((section, index) => {
                            const Component = SECTION_COMPONENTS[section.type];
                            if (!Component) {
                                return (
                                    <div key={index} className="py-12 px-8 bg-slate-50 text-center">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                            [{section.type}] Section Placeholder
                                        </p>
                                    </div>
                                );
                            }
                            const variant = getTemplateVariant();
                            return <Component key={index} variant={variant} listings={[]} {...section} {...(section as any).content} />;
                        })}
                    </div>

                    {/* Simulated Footer */}
                    <footer className="bg-slate-900 text-white/40 px-8 py-8 text-center">
                        <p className="text-xs font-bold">&copy; {new Date().getFullYear()} {website?.organizationName}. All rights reserved.</p>
                        <p className="text-[10px] mt-2">Powered by Real Estate Platform</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
