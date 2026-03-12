'use client';

import React from 'react';
import Link from 'next/link';
import { orgWebsiteService, listingSectionService } from '@repo/services';
import type { OrgWebsite, OrgWebsitePage, OrgWebsiteBranding, WebsiteAgentProfile, OrgPageSectionType, ListingSectionConfig } from '@repo/types';

type Tab = 'details' | 'pages' | 'branding' | 'agents';

export default function OrganizationWebsitePage() {
    const [tab, setTab] = React.useState<Tab>('details');
    const [website, setWebsite] = React.useState<OrgWebsite | null>(null);
    const [pages, setPages] = React.useState<OrgWebsitePage[]>([]);
    const [branding, setBranding] = React.useState<OrgWebsiteBranding | null>(null);
    const [agents, setAgents] = React.useState<WebsiteAgentProfile[]>([]);
    const [listingConfigs, setListingConfigs] = React.useState<ListingSectionConfig[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            setLoading(true);
            const orgId = 'org-1'; // Aligned with user request for multi-tenancy
            const ws = await orgWebsiteService.getOrgWebsite(orgId);
            setWebsite(ws);
            if (ws) {
                // Ensure default pages exist (Home)
                await orgWebsiteService.provisionDefaultPages(orgId, ws.id);

                const [p, b, a, lc] = await Promise.all([
                    orgWebsiteService.getPages(orgId, ws.id),
                    orgWebsiteService.getBranding(orgId, ws.id),
                    orgWebsiteService.getAgentProfiles(ws.id, orgId),
                    listingSectionService.getConfigsByWebsite(ws.id),
                ]);
                setPages(p);
                setBranding(b);
                setAgents(a);
                setListingConfigs(lc);
            }
            setLoading(false);
        })();
    }, []);

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'details', label: 'Website Details', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { key: 'pages', label: 'Page Management', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { key: 'branding', label: 'Branding', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
        { key: 'agents', label: 'Agent Profiles', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Website...</p>
                </div>
            </div>
        );
    }

    if (!website) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 p-12 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md">
                    <div className="h-16 w-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
                        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9" /></svg>
                    </div>
                    <h2 className="text-xl font-black text-slate-900">No Website Assigned</h2>
                    <p className="text-sm text-slate-500">Contact your Super Admin to assign a template and provision your organization website.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-8 bg-indigo-600 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Website Management</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        Organization <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Website</span>
                    </h1>
                    <p className="text-lg text-slate-600 font-medium max-w-2xl">Manage your organization&apos;s public-facing website, pages, branding, and agent visibility.</p>
                </div>

                {/* Customize Website Button */}
                <Link
                    href={`/website-builder?websiteId=${website.id}&pageId=${pages.length > 0 ? pages[0].id : ''}&templateId=${website.templateId || 'modern-realty'}`}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/25 hover:shadow-2xl hover:shadow-indigo-600/30 hover:-translate-y-0.5 flex-shrink-0"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                    <svg className="relative w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="relative">Customize Website</span>
                    <svg className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === 'details' && <DetailsTab website={website} />}
            {tab === 'pages' && <PagesTab website={website} pages={pages} setPages={setPages} listingConfigs={listingConfigs} setListingConfigs={setListingConfigs} />}
            {tab === 'branding' && <BrandingTab websiteId={website.id} branding={branding} setBranding={setBranding} />}
            {tab === 'agents' && <AgentsTab websiteId={website.id} agents={agents} setAgents={setAgents} />}
        </div>
    );
}

/* ═══════════════ DETAILS TAB ═══════════════ */
function DetailsTab({ website }: { website: OrgWebsite }) {
    const statusColors: Record<string, string> = {
        ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
        SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
        PROVISIONING: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    const fields = [
        { label: 'Domain', value: website.domain, icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9' },
        { label: 'Assigned Template', value: website.templateName, icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' },
        { label: 'Organization Name', value: website.organizationName, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(f => (
                <div key={f.label} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{f.label}</p>
                        <p className="text-base font-bold text-slate-900">{f.value}</p>
                    </div>
                </div>
            ))}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Website Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${statusColors[website.status] || ''}`}>{website.status}</span>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════ PAGES TAB ═══════════════ */
function PagesTab({
    website,
    pages,
    setPages,
    listingConfigs,
    setListingConfigs
}: {
    website: OrgWebsite;
    pages: OrgWebsitePage[];
    setPages: (p: OrgWebsitePage[]) => void;
    listingConfigs: ListingSectionConfig[];
    setListingConfigs: (c: ListingSectionConfig[]) => void;
}) {
    const websiteId = website.id;
    const [showCreate, setShowCreate] = React.useState(false);
    const [editPage, setEditPage] = React.useState<OrgWebsitePage | null>(null);
    const [configSection, setConfigSection] = React.useState<{ pageId: string, sectionIdx: number } | null>(null);
    const [form, setForm] = React.useState({ title: '', slug: '', isPublished: true, sections: 'hero,listings,agent_profiles' });

    const sectionOptions: OrgPageSectionType[] = ['hero', 'text', 'listings', 'agent_profiles', 'gallery', 'testimonials', 'contact', 'cta'];

    const handleCreate = async () => {
        const secs = form.sections.split(',').map(s => s.trim()).filter(Boolean) as OrgPageSectionType[];
        const page = await orgWebsiteService.createPage('org-1', {
            websiteId,
            title: form.title,
            slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-'),
            layoutConfig: { sections: secs.map(type => ({ type })) },
            isPublished: form.isPublished,
        });
        setPages([...pages, page]);
        setShowCreate(false);
        setForm({ title: '', slug: '', isPublished: true, sections: 'hero' });
    };

    const handleDelete = async (id: string) => {
        await orgWebsiteService.deletePage('org-1', id);
        setPages(pages.filter(p => p.id !== id));
    };

    const handleMoveUp = (idx: number) => {
        if (idx === 0) return;
        const arr = [...pages];
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        setPages(arr);
        orgWebsiteService.reorderPages('org-1', websiteId, arr.map(p => p.id));
    };

    const handleMoveDown = (idx: number) => {
        if (idx === pages.length - 1) return;
        const arr = [...pages];
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
        setPages(arr);
        orgWebsiteService.reorderPages('org-1', websiteId, arr.map(p => p.id));
    };

    const handleEditSave = async () => {
        if (!editPage) return;
        const updated = await orgWebsiteService.updatePage('org-1', editPage.id, editPage);
        setPages(pages.map(p => p.id === updated.id ? updated : p));
        setEditPage(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Website Pages</h2>
                    <p className="text-sm text-slate-500">{pages.length} page{pages.length !== 1 ? 's' : ''} · Drag to reorder navigation</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Page
                </button>
            </div>

            {/* Page List */}
            <div className="space-y-3">
                {pages.map((page, idx) => (
                    <div key={page.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all">
                        <div className="flex flex-col gap-1">
                            <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 transition-all"><svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>
                            <button onClick={() => handleMoveDown(idx)} disabled={idx === pages.length - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 transition-all"><svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900">{page.title}</p>
                            <p className="text-xs text-slate-400 font-medium">/{page.slug} · {page.layoutConfig.sections.length} section{page.layoutConfig.sections.length !== 1 ? 's' : ''}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${page.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{page.isPublished ? 'Published' : 'Draft'}</span>
                        <div className="flex gap-2">
                            <Link
                                href={`/website-builder?websiteId=${websiteId}&pageId=${page.id}&templateId=${website?.templateId || 'modern-realty'}`}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                                Customize
                            </Link>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditPage({ ...page })} className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                <button onClick={() => handleDelete(page.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">Create New Page</h3>
                            <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="space-y-4">
                            <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Page Title *</span><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. About Us" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" /></label>
                            <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">URL Slug</span><input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from title" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400" /></label>
                            <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sections (comma-separated)</span>
                                <input type="text" value={form.sections} onChange={e => setForm({ ...form, sections: e.target.value })} placeholder="hero,text,listings" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
                                <p className="mt-1 text-[10px] text-slate-400 font-medium">Available: {sectionOptions.join(', ')}</p>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /><span className="text-sm font-bold text-slate-700">Publish immediately</span></label>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowCreate(false)} className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleCreate} disabled={!form.title.trim()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">Create Page</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editPage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">Edit Page</h3>
                            <button onClick={() => setEditPage(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="space-y-4">
                            <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Page Title</span><input type="text" value={editPage.title} onChange={e => setEditPage({ ...editPage, title: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" /></label>
                            <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">URL Slug</span><input type="text" value={editPage.slug} onChange={e => setEditPage({ ...editPage, slug: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" /></label>

                            <div className="space-y-3">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Page Sections</span>
                                <div className="space-y-2">
                                    {editPage.layoutConfig.sections.map((s, sIdx) => (
                                        <div key={sIdx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 group">
                                            <span className="h-6 w-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">{sIdx + 1}</span>
                                            <span className="flex-1 text-sm font-bold text-slate-700 capitalize">{s.type}</span>
                                            {s.type === 'listings' && (
                                                <button
                                                    onClick={() => setConfigSection({ pageId: editPage.id, sectionIdx: sIdx })}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {s.configId ? 'Configure' : 'Set Filters'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const newSections = editPage.layoutConfig.sections.filter((_, i) => i !== sIdx);
                                                    setEditPage({ ...editPage, layoutConfig: { ...editPage.layoutConfig, sections: newSections } });
                                                }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    <select
                                        onChange={(e) => {
                                            const type = e.target.value as OrgPageSectionType;
                                            if (!type) return;
                                            setEditPage({ ...editPage, layoutConfig: { ...editPage.layoutConfig, sections: [...editPage.layoutConfig.sections, { type }] } });
                                            e.target.value = '';
                                        }}
                                        className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-slate-500 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                                    >
                                        <option value="">+ Add New Section</option>
                                        {sectionOptions.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={editPage.isPublished} onChange={e => setEditPage({ ...editPage, isPublished: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /><span className="text-sm font-bold text-slate-700">Published</span></label>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditPage(null)} className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleEditSave} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Save Changes</button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Config Modals */}
            {
                configSection && <ListingSectionEditor
                    websiteId={websiteId}
                    page={pages.find(p => p.id === configSection.pageId)!}
                    sectionIdx={configSection.sectionIdx}
                    listingConfigs={listingConfigs}
                    onSave={(updatedConfig) => {
                        const existingIdx = listingConfigs.findIndex(c => c.id === updatedConfig.id);
                        if (existingIdx !== -1) {
                            setListingConfigs(listingConfigs.map(c => c.id === updatedConfig.id ? updatedConfig : c));
                        } else {
                            setListingConfigs([...listingConfigs, updatedConfig]);
                        }
                        // Update page layout configId
                        const page = pages.find(p => p.id === configSection.pageId)!;
                        const newSections = [...page.layoutConfig.sections];
                        newSections[configSection.sectionIdx] = { ...newSections[configSection.sectionIdx], configId: updatedConfig.id };
                        const updatedPage = { ...page, layoutConfig: { ...page.layoutConfig, sections: newSections } };
                        orgWebsiteService.updatePage('org-1', page.id, updatedPage);
                        setPages(pages.map(p => p.id === page.id ? updatedPage : p));
                        setConfigSection(null);
                    }}
                    onClose={() => setConfigSection(null)}
                />
            }
        </div >
    );
}

/* ═══════════════ BRANDING TAB ═══════════════ */
function BrandingTab({ websiteId, branding, setBranding }: { websiteId: string; branding: OrgWebsiteBranding | null; setBranding: (b: OrgWebsiteBranding) => void }) {
    const [form, setForm] = React.useState({
        logo: branding?.logo || '',
        siteTitle: branding?.siteTitle || '',
        primary: branding?.brandColors.primary || '#4f46e5',
        secondary: branding?.brandColors.secondary || '#7c3aed',
        accent: branding?.brandColors.accent || '#06b6d4',
        bannerImages: branding?.bannerImages.join('\n') || '',
    });
    const [saving, setSaving] = React.useState(false);

    const handleSave = async () => {
        setSaving(true);
        const updated = await orgWebsiteService.updateBranding('org-1', websiteId, {
            logo: form.logo,
            siteTitle: form.siteTitle,
            brandColors: { primary: form.primary, secondary: form.secondary, accent: form.accent },
            bannerImages: form.bannerImages.split('\n').filter(Boolean),
        });
        setBranding(updated);
        setSaving(false);
    };

    return (
        <div className="space-y-8">
            {/* Live Preview */}
            <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Live Preview</h3>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-6">
                    <div className="flex items-center gap-4 mb-4">
                        {form.logo && <img src={form.logo} alt="Logo" className="h-10 w-10 rounded-xl object-cover border border-slate-200" />}
                        <div>
                            <p className="font-black text-slate-900 text-lg">{form.siteTitle || 'Your Site Title'}</p>
                            <p className="text-xs text-slate-500">Organization Website</p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <span className="px-5 py-2 rounded-xl text-white text-xs font-bold" style={{ backgroundColor: form.primary }}>Primary</span>
                        <span className="px-5 py-2 rounded-xl text-white text-xs font-bold" style={{ backgroundColor: form.secondary }}>Secondary</span>
                        <span className="px-5 py-2 rounded-xl text-white text-xs font-bold" style={{ backgroundColor: form.accent }}>Accent</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Identity */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Site Identity</h3>
                    <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Site Title *</span><input type="text" value={form.siteTitle} onChange={e => setForm({ ...form, siteTitle: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" /></label>
                    <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Logo URL</span><input type="text" value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} placeholder="https://..." className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400" /></label>
                </div>

                {/* Colors */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Brand Colors</h3>
                    {[{ k: 'primary', l: 'Primary Color' }, { k: 'secondary', l: 'Secondary Color' }, { k: 'accent', l: 'Accent Color' }].map(c => (
                        <label key={c.k} className="flex items-center gap-4">
                            <input type="color" value={(form as any)[c.k]} onChange={e => setForm({ ...form, [c.k]: e.target.value })} className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer" />
                            <div className="flex-1">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{c.l}</span>
                                <p className="text-sm font-medium text-slate-700 font-mono">{(form as any)[c.k]}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Banner Images */}
            <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">Banner Images</h3>
                <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Image URLs (one per line)</span><textarea value={form.bannerImages} onChange={e => setForm({ ...form, bannerImages: e.target.value })} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono" /></label>
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} className={`px-8 py-3 rounded-2xl ${saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'} text-white font-bold text-sm transition-all`}>{saving ? 'Saving...' : 'Save Branding'}</button>
            </div>
        </div>
    );
}

/* ═══════════════ AGENTS TAB ═══════════════ */
function AgentsTab({ websiteId, agents, setAgents }: { websiteId: string; agents: WebsiteAgentProfile[]; setAgents: (a: WebsiteAgentProfile[]) => void }) {
    const [showAdd, setShowAdd] = React.useState(false);
    const [editAgent, setEditAgent] = React.useState<WebsiteAgentProfile | null>(null);
    const [form, setForm] = React.useState({ name: '', photo: '', bio: '', phone: '', email: '' });

    const handleAdd = async () => {
        const profile = await orgWebsiteService.addAgentProfile('org-1', {
            websiteId, organizationId: 'org-1',
            name: form.name, photo: form.photo, bio: form.bio, phone: form.phone, email: form.email,
            displayOrder: agents.length + 1, isVisible: true,
        });
        setAgents([...agents, profile]);
        setShowAdd(false);
        setForm({ name: '', photo: '', bio: '', phone: '', email: '' });
    };

    const handleRemove = async (id: string) => {
        await orgWebsiteService.removeAgentProfile('org-1', id);
        setAgents(agents.filter(a => a.id !== id));
    };

    const handleEditSave = async () => {
        if (!editAgent) return;
        const updated = await orgWebsiteService.updateAgentProfile('org-1', editAgent.id, editAgent);
        setAgents(agents.map(a => a.id === updated.id ? updated : a));
        setEditAgent(null);
    };

    const toggleVisibility = async (agent: WebsiteAgentProfile) => {
        const updated = await orgWebsiteService.updateAgentProfile('org-1', agent.id, { isVisible: !agent.isVisible });
        setAgents(agents.map(a => a.id === updated.id ? updated : a));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Website Agent Profiles</h2>
                    <p className="text-sm text-slate-500">{agents.filter(a => a.isVisible).length} visible of {agents.length} agents</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    Add Agent
                </button>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(agent => (
                    <div key={agent.id} className={`p-6 rounded-2xl bg-white border shadow-sm transition-all hover:shadow-md ${agent.isVisible ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60'}`}>
                        <div className="flex items-start gap-4 mb-4">
                            {agent.photo ? (
                                <img src={agent.photo} alt={agent.name} className="h-14 w-14 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                            ) : (
                                <div className="h-14 w-14 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg flex-shrink-0">{agent.name.charAt(0)}</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate">{agent.name}</p>
                                <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                                <p className="text-xs text-slate-400">{agent.phone}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{agent.bio}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <button onClick={() => toggleVisibility(agent)} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${agent.isVisible ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{agent.isVisible ? '● Visible' : '○ Hidden'}</button>
                            <div className="flex gap-1">
                                <button onClick={() => setEditAgent({ ...agent })} className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                <button onClick={() => handleRemove(agent.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Agent Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between"><h3 className="text-xl font-black text-slate-900">Add Agent to Website</h3><button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
                        <div className="space-y-4">
                            {[{ k: 'name', l: 'Full Name *', t: 'text' }, { k: 'email', l: 'Email *', t: 'email' }, { k: 'phone', l: 'Phone', t: 'text' }, { k: 'photo', l: 'Photo URL', t: 'text' }].map(f => (
                                <label key={f.k} className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">{f.l}</span><input type={f.t} value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" /></label>
                            ))}
                            <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Bio</span><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" /></label>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowAdd(false)} className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleAdd} disabled={!form.name.trim() || !form.email.trim()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">Add Agent</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Agent Modal */}
            {editAgent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between"><h3 className="text-xl font-black text-slate-900">Edit Agent Profile</h3><button onClick={() => setEditAgent(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
                        <div className="space-y-4">
                            {[{ k: 'name', l: 'Full Name', t: 'text' }, { k: 'email', l: 'Email', t: 'email' }, { k: 'phone', l: 'Phone', t: 'text' }, { k: 'photo', l: 'Photo URL', t: 'text' }].map(f => (
                                <label key={f.k} className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">{f.l}</span><input type={f.t} value={(editAgent as any)[f.k]} onChange={e => setEditAgent({ ...editAgent, [f.k]: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" /></label>
                            ))}
                            <label className="block"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Bio</span><textarea value={editAgent.bio} onChange={e => setEditAgent({ ...editAgent, bio: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" /></label>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditAgent(null)} className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleEditSave} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════ LISTING SECTION EDITOR ═══════════════ */
function ListingSectionEditor({
    websiteId,
    page,
    sectionIdx,
    listingConfigs,
    onSave,
    onClose
}: {
    websiteId: string;
    page: OrgWebsitePage;
    sectionIdx: number;
    listingConfigs: ListingSectionConfig[];
    onSave: (config: ListingSectionConfig) => void;
    onClose: () => void;
}) {
    const section = page.layoutConfig.sections[sectionIdx];
    const existingConfig = listingConfigs.find(c => c.id === section.configId);

    const [form, setForm] = React.useState<Omit<ListingSectionConfig, 'id' | 'createdAt' | 'updatedAt'>>({
        websiteId,
        sectionKey: existingConfig?.sectionKey || `${page.slug}-listings-${sectionIdx}`,
        filters: existingConfig?.filters || {
            status: 'For Sale',
        },
        limit: existingConfig?.limit || 6,
        sort: existingConfig?.sort || 'latest',
    });

    const [saving, setSaving] = React.useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            let result;
            if (existingConfig) {
                result = await listingSectionService.updateConfig(existingConfig.id, form);
            } else {
                result = await listingSectionService.createConfig(form);
            }
            onSave(result);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Listings Configuration</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Section: {form.sectionKey}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 shadow-sm"><svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="block">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Section Key (Slug)</span>
                            <input type="text" value={form.sectionKey} onChange={e => setForm({ ...form, sectionKey: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" />
                        </label>
                        <label className="block">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Display Limit</span>
                            <input type="number" value={form.limit} onChange={e => setForm({ ...form, limit: parseInt(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" />
                        </label>
                    </div>

                    {/* Filters */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-2">Filter Parameters</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="block">
                                <span className="text-xs font-bold text-slate-700 mb-2 block">Target City</span>
                                <input type="text" value={form.filters.city || ''} onChange={e => setForm({ ...form, filters: { ...form.filters, city: e.target.value } })} placeholder="e.g. Toronto" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" />
                            </label>

                            <label className="block">
                                <span className="text-xs font-bold text-slate-700 mb-2 block">Property Type</span>
                                <select value={form.filters.propertyType || ''} onChange={e => setForm({ ...form, filters: { ...form.filters, propertyType: e.target.value } })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white">
                                    <option value="">Any Type</option>
                                    <option value="Detached">Detached</option>
                                    <option value="Semi-Detached">Semi-Detached</option>
                                    <option value="Townhouse">Townhouse</option>
                                    <option value="Condo">Condo</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs font-bold text-slate-700 mb-2 block">Status</span>
                                <select value={form.filters.status || ''} onChange={e => setForm({ ...form, filters: { ...form.filters, status: e.target.value } })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white">
                                    <option value="For Sale">For Sale</option>
                                    <option value="Sold">Sold</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs font-bold text-slate-700 mb-2 block">Sort By</span>
                                <select value={form.sort} onChange={e => setForm({ ...form, sort: e.target.value as any })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none bg-white">
                                    <option value="latest">Latest First</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                </select>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <span className="text-xs font-bold text-slate-700 block">Price Range</span>
                                <div className="flex gap-2">
                                    <input type="number" value={form.filters.minPrice || ''} onChange={e => setForm({ ...form, filters: { ...form.filters, minPrice: parseInt(e.target.value) || undefined } })} placeholder="Min Price" className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all" />
                                    <input type="number" value={form.filters.maxPrice || ''} onChange={e => setForm({ ...form, filters: { ...form.filters, maxPrice: parseInt(e.target.value) || undefined } })} placeholder="Max Price" className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <span className="text-xs font-bold text-slate-700 block">Rooms (Minimum)</span>
                                <div className="flex gap-2">
                                    <input type="number" value={form.filters.bedrooms || ''} onChange={e => setForm({ ...form, filters: { ...form.filters, bedrooms: parseInt(e.target.value) || undefined } })} placeholder="Beds" className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all" />
                                    <input type="number" value={form.filters.bathrooms || ''} onChange={e => setForm({ ...form, filters: { ...form.filters, bathrooms: parseInt(e.target.value) || undefined } })} placeholder="Baths" className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-all">
                            <input type="checkbox" checked={form.filters.featured || false} onChange={e => setForm({ ...form, filters: { ...form.filters, featured: e.target.checked } })} className="h-5 w-5 rounded-lg border-indigo-300 text-indigo-600 focus:ring-indigo-500" />
                            <div>
                                <span className="text-sm font-black text-indigo-900">Featured Only</span>
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Only show listings marked as featured by admin</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-600 font-bold text-sm hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                        {saving ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}
