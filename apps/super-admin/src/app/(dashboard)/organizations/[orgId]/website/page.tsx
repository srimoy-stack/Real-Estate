'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    orgWebsiteService,
    PLATFORM_TEMPLATES,
    useNotificationStore,
} from '@repo/services';
import {
    OrgWebsite,
    OrgWebsitePage,
    OrgPageLayoutConfig,
    OrgPageSectionType,
    Template,
} from '@repo/types';

// ─── TABS ───
type TabId = 'overview' | 'pages' | 'seo' | 'builder';

const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'pages', label: 'Pages & Layout', icon: '📄' },
    { id: 'seo', label: 'SEO Pages', icon: '🔍' },
    { id: 'builder', label: 'Website Builder', icon: '🎨' },
];

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function OrgWebsiteManagementPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;

    const [tab, setTab] = useState<TabId>('overview');
    const [website, setWebsite] = useState<OrgWebsite | null>(null);
    const [pages, setPages] = useState<OrgWebsitePage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    // ─── SEO Page Creation State ──────────────────────
    const [showSeoForm, setShowSeoForm] = useState(false);
    const [seoForm, setSeoForm] = useState({
        title: '',
        slug: '',
        metaTitle: '',
        metaDescription: '',
        isPublished: false,
    });

    // ─── New Page Modal ───────────────────────────────
    const [showPageForm, setShowPageForm] = useState(false);
    const [pageForm, setPageForm] = useState({
        title: '',
        slug: '',
        sections: 'hero,listings,contact',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const ws = await orgWebsiteService.getOrgWebsite(orgId);
            setWebsite(ws);
            if (ws) {
                const pgs = await orgWebsiteService.getPages(orgId, ws.id);
                setPages(pgs);
                setSelectedTemplate(ws.templateId);
            }
        } catch (err) {
            console.error('Failed to fetch website data', err);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreatePage = async () => {
        if (!website || !pageForm.title || !pageForm.slug) return;
        const layoutConfig: OrgPageLayoutConfig = {
            sections: pageForm.sections.split(',').map(s => ({ type: s.trim() as OrgPageSectionType })),
        };
        await orgWebsiteService.createPage(orgId, {
            websiteId: website.id,
            title: pageForm.title,
            slug: pageForm.slug,
            layoutConfig,
            isPublished: true,
            isPublic: true,
        });
        setShowPageForm(false);
        setPageForm({ title: '', slug: '', sections: 'hero,listings,contact' });
        fetchData();
    };

    const handleCreateSeoPage = async () => {
        if (!website || !seoForm.title || !seoForm.slug) return;
        const layoutConfig: OrgPageLayoutConfig = {
            sections: [
                { type: 'hero' },
                { type: 'listings', filters: {} },
                { type: 'contact' },
            ],
        };
        await orgWebsiteService.createPage(orgId, {
            websiteId: website.id,
            title: seoForm.title,
            slug: seoForm.slug,
            layoutConfig,
            isPublished: seoForm.isPublished,
            isPublic: true,
        });
        setShowSeoForm(false);
        setSeoForm({ title: '', slug: '', metaTitle: '', metaDescription: '', isPublished: false });
        fetchData();
    };

    const handleDeletePage = async (pageId: string) => {
        if (!confirm('Delete this page? This cannot be undone.')) return;
        await orgWebsiteService.deletePage(orgId, pageId);
        fetchData();
    };

    const handleTogglePublish = async (page: OrgWebsitePage) => {
        await orgWebsiteService.updatePage(orgId, page.id, { isPublished: !page.isPublished });
        fetchData();
    };

    const templateNames: Record<string, string> = {
        'modern-realty': 'Modern Realty',
        'luxury-estate': 'Luxury Estate',
        'corporate-brokerage': 'Corporate',
        'agent-portfolio': 'Agent Portfolio',
        'minimal-realty': 'Minimal',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Website Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <button onClick={() => router.push('/organizations')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        Back to Organizations
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Website Management</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        {website?.organizationName || 'Organization'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Website</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Configure template, pages, SEO, and customize layout for this organization.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/preview/${orgId}`)}
                        className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Preview Website
                    </button>
                    <button
                        onClick={() => {
                            const page = pages.find(p => p.slug === '/');
                            if (website && page) {
                                router.push(`/website-builder?websiteId=${website.id}&pageId=${page.id}&templateId=${website.templateId}`);
                            }
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Open Website Builder
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${tab === t.id
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ═══ OVERVIEW TAB ═══ */}
            {tab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Website Info Card */}
                        <div className="md:col-span-2 p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                <div className="h-8 w-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-xs font-black">🌐</div>
                                Website Details
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Domain</p>
                                    <p className="text-sm font-bold text-indigo-600 font-mono">{website?.domain || 'Not configured'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${website?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <div className={`h-1.5 w-1.5 rounded-full ${website?.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                        {website?.status || 'Unknown'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Pages</p>
                                    <p className="text-2xl font-black text-slate-900">{pages.length}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Updated</p>
                                    <p className="text-sm font-bold text-slate-600">{website?.updatedAt ? new Date(website.updatedAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Template Assignment Card */}
                        <div className="p-8 bg-slate-900 rounded-[32px] text-white space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                            <h3 className="text-lg font-black flex items-center gap-2 relative z-10">
                                🎨 Active Template
                            </h3>
                            <div className="relative z-10">
                                <select
                                    value={selectedTemplate}
                                    onChange={e => setSelectedTemplate(e.target.value)}
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                                >
                                    {PLATFORM_TEMPLATES.map((tpl: Template) => (
                                        <option key={tpl.templateKey} value={tpl.templateKey}>{tpl.templateName}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        useNotificationStore.getState().addNotification({
                                            type: 'success',
                                            title: 'Template Updated',
                                            message: `Template changed to ${templateNames[selectedTemplate] || selectedTemplate}.`,
                                        });
                                    }}
                                    className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Save Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ PAGES TAB ═══ */}
            {tab === 'pages' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900">Website Pages</h3>
                        <button onClick={() => setShowPageForm(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add Page
                        </button>
                    </div>

                    <div className="space-y-3">
                        {pages.map(page => (
                            <div key={page.id} className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-sm">
                                        {page.slug === '/' ? '🏠' : '📄'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900">{page.title}</h4>
                                        <p className="text-[11px] font-mono text-slate-400">{page.slug === '/' ? '/ (Home)' : `/${page.slug}`}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {(page.layoutConfig?.sections || []).length} sections
                                    </span>
                                    <button
                                        onClick={() => handleTogglePublish(page)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${page.isPublished
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}
                                    >
                                        {page.isPublished ? 'Published' : 'Draft'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (website) {
                                                router.push(`/website-builder?websiteId=${website.id}&pageId=${page.id}&templateId=${website.templateId}`);
                                            }
                                        }}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        Customize Layout
                                    </button>
                                    {page.slug !== '/' && (
                                        <button onClick={() => handleDeletePage(page.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {pages.length === 0 && (
                            <div className="p-16 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100">
                                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No pages configured yet</p>
                                <p className="text-slate-400 text-sm mt-2">Click "Add Page" to create the first page.</p>
                            </div>
                        )}
                    </div>

                    {/* Add Page Modal */}
                    {showPageForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl w-full max-w-lg p-8 space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900">New Page</h3>
                                    <button onClick={() => setShowPageForm(false)} className="p-2 hover:bg-slate-100 rounded-xl"><svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page Title</label>
                                        <input type="text" value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-indigo-500" placeholder="e.g. About Us" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL Slug</label>
                                        <input type="text" value={pageForm.slug} onChange={e => setPageForm({ ...pageForm, slug: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-indigo-500 font-mono" placeholder="e.g. about-us" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Sections (comma separated)</label>
                                        <input type="text" value={pageForm.sections} onChange={e => setPageForm({ ...pageForm, sections: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-indigo-500 font-mono" placeholder="hero,listings,contact" />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button onClick={() => setShowPageForm(false)} className="px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600">Cancel</button>
                                    <button onClick={handleCreatePage} disabled={!pageForm.title || !pageForm.slug} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-200 disabled:opacity-50">Create Page</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ SEO PAGES TAB ═══ */}
            {tab === 'seo' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">SEO Landing Pages</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Create targeted landing pages optimized for search engines.</p>
                        </div>
                        <button onClick={() => setShowSeoForm(true)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            New SEO Page
                        </button>
                    </div>

                    {/* Existing SEO-relevant pages */}
                    <div className="space-y-3">
                        {pages.filter(p => p.slug !== '/').map(page => (
                            <div key={page.id} className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-sm">🔍</div>
                                    <div>
                                        <h4 className="font-black text-slate-900">{page.title}</h4>
                                        <p className="text-[11px] font-mono text-emerald-600">/{page.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${page.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {page.isPublished ? 'Live' : 'Draft'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (website) router.push(`/website-builder?websiteId=${website.id}&pageId=${page.id}&templateId=${website.templateId}`);
                                        }}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
                                    >
                                        Edit Layout
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pages.filter(p => p.slug !== '/').length === 0 && (
                            <div className="p-16 text-center bg-white rounded-[32px] border-2 border-dashed border-emerald-100">
                                <div className="space-y-3">
                                    <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-2xl">🔍</div>
                                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No SEO pages yet</p>
                                    <p className="text-slate-400 text-sm">Create targeted landing pages like "Toronto Condos for Sale" to drive organic traffic.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SEO Form Modal */}
                    {showSeoForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm">
                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl w-full max-w-lg p-8 space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900">New SEO Landing Page</h3>
                                    <button onClick={() => setShowSeoForm(false)} className="p-2 hover:bg-slate-100 rounded-xl"><svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page Title</label>
                                        <input type="text" value={seoForm.title} onChange={e => setSeoForm({ ...seoForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-emerald-500" placeholder="e.g. Toronto Condos for Sale" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL Slug</label>
                                        <input type="text" value={seoForm.slug} onChange={e => setSeoForm({ ...seoForm, slug: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-emerald-500 font-mono" placeholder="toronto-condos-for-sale" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Title (SEO)</label>
                                        <input type="text" value={seoForm.metaTitle} onChange={e => setSeoForm({ ...seoForm, metaTitle: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-emerald-500" placeholder="Toronto Condos for Sale | Premium Real Estate" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Description</label>
                                        <textarea value={seoForm.metaDescription} onChange={e => setSeoForm({ ...seoForm, metaDescription: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-emerald-500 h-24 resize-none" placeholder="Browse the best condos for sale in Toronto..." />
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={seoForm.isPublished} onChange={e => setSeoForm({ ...seoForm, isPublished: e.target.checked })} className="h-4 w-4 rounded accent-emerald-600" />
                                        <span className="text-sm font-bold text-slate-600">Publish immediately</span>
                                    </label>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button onClick={() => setShowSeoForm(false)} className="px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600">Cancel</button>
                                    <button onClick={handleCreateSeoPage} disabled={!seoForm.title || !seoForm.slug} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-200 disabled:opacity-50">Create SEO Page</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ BUILDER TAB ═══ */}
            {tab === 'builder' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 rounded-[40px] text-white text-center space-y-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black tracking-tight">Website Builder</h2>
                            <p className="text-white/60 font-medium max-w-lg mx-auto mt-3">
                                Use the drag-and-drop builder to customize the layout of any page. Select a page below to begin.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                                {pages.map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => {
                                            if (website) router.push(`/website-builder?websiteId=${website.id}&pageId=${page.id}&templateId=${website.templateId}`);
                                        }}
                                        className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all text-left group"
                                    >
                                        <h4 className="font-black group-hover:text-white transition-colors">{page.title}</h4>
                                        <p className="text-[10px] font-mono text-white/40 mt-1">{page.slug === '/' ? '/ (Home)' : `/${page.slug}`}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mt-3">{(page.layoutConfig?.sections || []).length} sections →</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
