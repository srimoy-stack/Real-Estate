'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import {
    HeroSection,
    ListingsSection,
    AgentProfilesSection,
    ContactSection,
    TextSection,
    ImageSection,
    HeadingSection,
    SpacerSection,
    DividerSection,
    ButtonSection,
    VideoSection,
    TestimonialsSection,
    StatsSection,
    FAQSection,
    NewsletterSection,
    GallerySection,
    MapSection,
} from '@/components/builder/CraftSections';
import { websiteInstanceService, PLATFORM_TEMPLATES, useNotificationStore, orgWebsiteService } from '@repo/services';
import { TemplateProvider, templateRegistry, type TemplateName } from '@repo/ui';

// Explicit resolver map for Craft.js — every component must be listed here
const Sections: Record<string, any> = {
    HeroSection,
    ListingsSection,
    AgentProfilesSection,
    ContactSection,
    TextSection,
    ImageSection,
    HeadingSection,
    SpacerSection,
    DividerSection,
    ButtonSection,
    VideoSection,
    TestimonialsSection,
    StatsSection,
    FAQSection,
    NewsletterSection,
    GallerySection,
    MapSection,
};

// --- TYPE MAP: template section types → Craft component names ---
const SECTION_TYPE_MAP: Record<string, string> = {
    'hero': 'HeroSection',
    'listings': 'ListingsSection',
    'featured_listings': 'ListingsSection',
    'about': 'TextSection',
    'text': 'TextSection',
    'heading': 'HeadingSection',
    'contact': 'ContactSection',
    'team': 'AgentProfilesSection',
    'agent_profiles': 'AgentProfilesSection',
    'agents': 'AgentProfilesSection',
    'testimonials': 'TestimonialsSection',
    'communities': 'TextSection',
    'blog': 'TextSection',
    'footer': 'ContactSection',
    'image': 'ImageSection',
    'video': 'VideoSection',
    'gallery': 'GallerySection',
    'spacer': 'SpacerSection',
    'divider': 'DividerSection',
    'button': 'ButtonSection',
    'stats': 'StatsSection',
    'faq': 'FAQSection',
    'newsletter': 'NewsletterSection',
    'map': 'MapSection',
};

// --- TOOLBOX ---
const Toolbox = () => {
    const { connectors } = useEditor();

    const layoutTools = [
        { type: 'HeadingSection', label: 'Heading', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', color: 'violet' },
        { type: 'TextSection', label: 'Text', icon: 'M4 6h16M4 12h16m-7 6h7', color: 'violet' },
        { type: 'SpacerSection', label: 'Spacer', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4', color: 'violet' },
        { type: 'DividerSection', label: 'Divider', icon: 'M20 12H4', color: 'violet' },
        { type: 'ButtonSection', label: 'Button', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5', color: 'violet' },
    ];

    const contentTools = [
        { type: 'HeroSection', label: 'Hero', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z', color: 'indigo' },
        { type: 'ImageSection', label: 'Image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'indigo' },
        { type: 'VideoSection', label: 'Video', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'indigo' },
        { type: 'GallerySection', label: 'Gallery', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', color: 'indigo' },
        { type: 'ListingsSection', label: 'Listings', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'indigo' },
        { type: 'ListingsSection', label: 'Featured', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'indigo' },
        { type: 'TextSection', label: 'Communities', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'indigo' },
        { type: 'MapSection', label: 'Map', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z', color: 'indigo' },
    ];

    const interactiveTools = [
        { type: 'AgentProfilesSection', label: 'Agents', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'emerald' },
        { type: 'TestimonialsSection', label: 'Reviews', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'emerald' },
        { type: 'StatsSection', label: 'Stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'emerald' },
        { type: 'FAQSection', label: 'FAQ', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
        { type: 'ContactSection', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'emerald' },
        { type: 'NewsletterSection', label: 'Newsletter', icon: 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76', color: 'emerald' },
    ];

    const colorMap: Record<string, { bg: string; hoverBorder: string; hoverBg: string; hoverText: string }> = {
        violet: { bg: 'bg-violet-50', hoverBorder: 'hover:border-violet-400', hoverBg: 'group-hover:bg-violet-100', hoverText: 'group-hover:text-violet-600' },
        indigo: { bg: 'bg-indigo-50', hoverBorder: 'hover:border-indigo-400', hoverBg: 'group-hover:bg-indigo-100', hoverText: 'group-hover:text-indigo-600' },
        emerald: { bg: 'bg-emerald-50', hoverBorder: 'hover:border-emerald-400', hoverBg: 'group-hover:bg-emerald-100', hoverText: 'group-hover:text-emerald-600' },
    };

    const renderToolGroup = (title: string, tools: typeof layoutTools) => (
        <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <div className="grid grid-cols-3 gap-2">
                {tools.map((tool) => {
                    const colors = colorMap[tool.color];
                    return (
                        <div
                            key={tool.type}
                            ref={(ref) => { if (ref) connectors.create(ref, React.createElement((Sections as any)[tool.type])); }}
                            className={`p-3 rounded-xl bg-white border border-slate-200 ${colors.hoverBorder} hover:shadow-md transition-all group cursor-grab active:cursor-grabbing text-center space-y-2`}
                        >
                            <div className={`h-9 w-9 mx-auto rounded-lg ${colors.bg} flex items-center justify-center text-slate-400 ${colors.hoverBg} ${colors.hoverText} transition-colors`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} /></svg>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tight text-slate-500 group-hover:text-slate-900 block leading-tight">{tool.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="p-5 space-y-5">
            <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Toolbox</h3>
                <p className="text-[10px] text-slate-500 font-medium">Drag components to your site</p>
            </div>
            {renderToolGroup('Layout Blocks', layoutTools)}
            {renderToolGroup('Content Blocks', contentTools)}
            {renderToolGroup('Interactive Blocks', interactiveTools)}
            <div className="pt-3 border-t border-slate-100">
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                    Drag → Preview to Add • Click → Configure<br />▲▼ → Reorder • ✕ → Remove
                </p>
            </div>
        </div>
    );
};

// --- PAGES PANEL ---
const PagesPanel = ({ websiteId, currentPageId, onSelectPage }: { websiteId: string; currentPageId: string; onSelectPage: (id: string) => void }) => {
    const [pages, setPages] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isCreating, setIsCreating] = React.useState(false);
    const [newPageData, setNewPageData] = React.useState({ title: '', slug: '' });
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState('');

    const handleRename = async (id: string) => {
        if (!editTitle) return setEditingId(null);
        try {
            // Optimistic update
            setPages(pages.map(p => p.id === id ? { ...p, title: editTitle } : p));
            setEditingId(null);
            // Persistent update
            await orgWebsiteService.updatePage('org-1', id, { title: editTitle });
        } catch (err) {
            console.error(err);
            fetchPages();
        }
    };

    const fetchPages = async () => {
        try {
            const data = await orgWebsiteService.getPages('org-1', websiteId);
            setPages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (websiteId) fetchPages();
    }, [websiteId]);

    const handleCreate = async () => {
        if (!newPageData.title || !newPageData.slug) return;
        try {
            const newPage = await orgWebsiteService.createPage('org-1', {
                websiteId,
                title: newPageData.title,
                slug: newPageData.slug.startsWith('/') ? newPageData.slug : `/${newPageData.slug}`,
                layoutConfig: {
                    sections: []
                },
                isPublished: true
            });
            setPages([...pages, newPage]);
            setIsCreating(false);
            setNewPageData({ title: '', slug: '' });
            onSelectPage(newPage.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this page?')) return;
        try {
            await orgWebsiteService.deletePage('org-1', id);
            setPages(pages.filter(p => p.id !== id));
            if (id === currentPageId) {
                const home = pages.find(p => p.slug === '/') || pages[0];
                if (home && home.id !== id) onSelectPage(home.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Pages...</div>;

    return (
        <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Site Pages</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Manage your website structure</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                    title="Create New Page"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            {isCreating && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <input
                        autoFocus
                        placeholder="Page Title (e.g. Services)"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={newPageData.title}
                        onChange={e => setNewPageData({ ...newPageData, title: e.target.value })}
                    />
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2">
                        <span className="text-[10px] font-black text-slate-400">/</span>
                        <input
                            placeholder="slug"
                            className="flex-1 text-xs font-bold outline-none"
                            value={newPageData.slug}
                            onChange={e => setNewPageData({ ...newPageData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                        />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button onClick={handleCreate} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">Create</button>
                        <button onClick={() => setIsCreating(false)} className="flex-1 py-2 bg-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">Cancel</button>
                    </div>
                </div>
            )}

            <div className="space-y-1">
                {pages.map((page) => (
                    <div
                        key={page.id}
                        onClick={() => onSelectPage(page.id)}
                        className={`group p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${page.id === currentPageId ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${page.id === currentPageId ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                {editingId === page.id ? (
                                    <input
                                        autoFocus
                                        className="w-full bg-white border border-indigo-300 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase outline-none"
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        onBlur={() => handleRename(page.id)}
                                        onKeyDown={e => e.key === 'Enter' && handleRename(page.id)}
                                        onClick={e => e.stopPropagation()}
                                    />
                                ) : (
                                    <h4 className={`text-[10px] font-black uppercase tracking-tight truncate ${page.id === currentPageId ? 'text-indigo-900' : 'text-slate-700'}`}>{page.title}</h4>
                                )}
                                <p className="text-[9px] font-bold text-slate-400">{page.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(page.id);
                                    setEditTitle(page.title);
                                }}
                                className="p-2 text-slate-300 hover:text-indigo-600 transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            {page.slug !== '/' && (
                                <button
                                    onClick={(e) => handleDelete(e, page.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- NAVIGATION PANEL ---
const NavigationPanel = ({ websiteId, onUpdate }: { websiteId: string; onUpdate: () => void }) => {
    const [nav, setNav] = React.useState<{ label: string; slug: string; children?: { label: string; slug: string }[] }[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [expandedIdx, setExpandedIdx] = React.useState<number | null>(null);

    const fetchData = async () => {
        const website = await orgWebsiteService.getOrgWebsite(websiteId);
        if (website?.navigation) setNav(website.navigation.map(n => ({ ...n, children: n.children || [] })));
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, [websiteId]);

    const handleSave = async () => {
        // Strip empty children arrays before saving for cleanliness
        const cleaned = nav.map(item => ({
            ...item,
            children: item.children && item.children.length > 0 ? item.children : undefined,
        }));
        await orgWebsiteService.updateNavigation('org-1', websiteId, cleaned);
        onUpdate();
    };

    const addLink = () => setNav([...nav, { label: 'New Link', slug: '/' }]);
    const removeLink = (idx: number) => {
        setNav(nav.filter((_, i) => i !== idx));
        if (expandedIdx === idx) setExpandedIdx(null);
        else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
    };
    const updateLink = (idx: number, data: any) => {
        const next = [...nav];
        next[idx] = { ...next[idx], ...data };
        setNav(next);
    };
    const moveLink = (idx: number, direction: 'up' | 'down') => {
        const target = direction === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= nav.length) return;
        const next = [...nav];
        [next[idx], next[target]] = [next[target], next[idx]];
        setNav(next);
        if (expandedIdx === idx) setExpandedIdx(target);
        else if (expandedIdx === target) setExpandedIdx(idx);
    };

    // --- Submenu helpers ---
    const addSubmenu = (parentIdx: number) => {
        const next = [...nav];
        const children = next[parentIdx].children || [];
        next[parentIdx] = { ...next[parentIdx], children: [...children, { label: 'New Submenu', slug: '/' }] };
        setNav(next);
        setExpandedIdx(parentIdx);
    };
    const removeSubmenu = (parentIdx: number, childIdx: number) => {
        const next = [...nav];
        const children = [...(next[parentIdx].children || [])];
        children.splice(childIdx, 1);
        next[parentIdx] = { ...next[parentIdx], children };
        setNav(next);
    };
    const updateSubmenu = (parentIdx: number, childIdx: number, data: { label?: string; slug?: string }) => {
        const next = [...nav];
        const children = [...(next[parentIdx].children || [])];
        children[childIdx] = { ...children[childIdx], ...data };
        next[parentIdx] = { ...next[parentIdx], children };
        setNav(next);
    };
    const moveSubmenu = (parentIdx: number, childIdx: number, direction: 'up' | 'down') => {
        const children = [...(nav[parentIdx].children || [])];
        const target = direction === 'up' ? childIdx - 1 : childIdx + 1;
        if (target < 0 || target >= children.length) return;
        [children[childIdx], children[target]] = [children[target], children[childIdx]];
        const next = [...nav];
        next[parentIdx] = { ...next[parentIdx], children };
        setNav(next);
    };

    if (loading) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Fetching Nav...</div>;

    return (
        <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Site Navigation</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Configure header menu & submenus</p>
                </div>
                <button onClick={addLink} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all" title="Add Menu Item">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            <div className="space-y-2">
                {nav.map((link, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                        {/* ── Parent Menu Item ── */}
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Menu Item #{i + 1}</span>
                                <div className="flex items-center gap-1">
                                    {/* Reorder buttons */}
                                    <button onClick={() => moveLink(i, 'up')} disabled={i === 0} className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-30 transition-colors" title="Move up">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                    </button>
                                    <button onClick={() => moveLink(i, 'down')} disabled={i === nav.length - 1} className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-30 transition-colors" title="Move down">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    <button onClick={() => removeLink(i)} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Delete menu item">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    placeholder="Label"
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={link.label}
                                    onChange={e => updateLink(i, { label: e.target.value })}
                                />
                                <input
                                    placeholder="Slug"
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={link.slug}
                                    onChange={e => updateLink(i, { slug: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* ── Submenu Section ── */}
                        <div className="border-t border-slate-200/80">
                            {/* Toggle & Add Submenu */}
                            <button
                                onClick={() => expandedIdx === i ? setExpandedIdx(null) : setExpandedIdx(i)}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                            >
                                <span className="flex items-center gap-1.5">
                                    <svg className={`w-3 h-3 transition-transform ${expandedIdx === i ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                    Submenus ({(link.children || []).length})
                                </span>
                                <span
                                    onClick={(e) => { e.stopPropagation(); addSubmenu(i); }}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Add
                                </span>
                            </button>

                            {/* Expanded submenu list */}
                            {expandedIdx === i && (link.children || []).length > 0 && (
                                <div className="px-4 pb-3 space-y-2">
                                    {(link.children || []).map((child, ci) => (
                                        <div key={ci} className="flex items-center gap-2 pl-4 border-l-2 border-indigo-200">
                                            <div className="flex-1 grid grid-cols-2 gap-1.5">
                                                <input
                                                    placeholder="Submenu Label"
                                                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    value={child.label}
                                                    onChange={e => updateSubmenu(i, ci, { label: e.target.value })}
                                                />
                                                <input
                                                    placeholder="/slug"
                                                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                    value={child.slug}
                                                    onChange={e => updateSubmenu(i, ci, { slug: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                                <button onClick={() => moveSubmenu(i, ci, 'up')} disabled={ci === 0} className="p-0.5 text-slate-300 hover:text-indigo-600 disabled:opacity-30 transition-colors" title="Move up">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button onClick={() => moveSubmenu(i, ci, 'down')} disabled={ci === (link.children || []).length - 1} className="p-0.5 text-slate-300 hover:text-indigo-600 disabled:opacity-30 transition-colors" title="Move down">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                                <button onClick={() => removeSubmenu(i, ci)} className="p-0.5 text-slate-300 hover:text-red-500 transition-colors" title="Remove submenu item">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all"
            >
                Publish Navigation
            </button>
        </div>
    );
};

// --- SETTINGS PANEL ---
const SettingsPanel = () => {
    const { selected, actions, query } = useEditor((state) => {
        const [currentNodeId] = state.events.selected;
        const node = currentNodeId ? state.nodes[currentNodeId] : null;
        return {
            selected: node ? {
                id: currentNodeId,
                name: node.data.displayName,
                props: node.data.props,
            } : null,
        };
    });

    if (!selected) {
        return (
            <div className="p-12 text-center space-y-4">
                <div className="h-16 w-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an element to configure</p>
            </div>
        );
    }

    const updateProp = (key: string, value: any) => {
        actions.setProp(selected.id, (props: any) => {
            if (key.includes('.')) {
                const parts = key.split('.');
                let current = props;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = value;
            } else {
                props[key] = value;
            }
        });
    };

    const handleDeleteSelected = () => {
        if (selected) {
            actions.delete(selected.id);
        }
    };

    const handleDuplicateSelected = () => {
        if (!selected) return;
        try {
            const nodeData = query.node(selected.id).get();
            const componentType = nodeData.data.type;
            const props = { ...nodeData.data.props };

            // Create a fresh instance of the same component with the same props
            const comp = typeof componentType === 'string' ? Sections[componentType] : componentType;
            const freshNode = React.createElement(comp, props);
            const nodeTree = query.parseReactElement(freshNode).toNodeTree();
            actions.addNodeTree(nodeTree, nodeData.data.parent || 'ROOT');
        } catch (err) {
            console.error('Failed to duplicate:', err);
        }
    };

    return (
        <div className="p-6 space-y-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Configuration</h3>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{selected.name}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleDuplicateSelected}
                        className="p-2 hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 rounded-lg transition-all"
                        title="Duplicate section"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 5.414a1 1 0 01.293.707V15a2 2 0 00-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </button>
                    <button
                        onClick={handleDeleteSelected}
                        className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                        title="Delete this section"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {selected.name === 'Hero Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headline</span>
                            <input
                                type="text"
                                value={selected.props.content?.headline || ''}
                                onChange={e => updateProp('content.headline', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subheadline</span>
                            <textarea
                                rows={3}
                                value={selected.props.content?.subheadline || ''}
                                onChange={e => updateProp('content.subheadline', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Text</span>
                            <input
                                type="text"
                                value={selected.props.content?.buttonText || ''}
                                onChange={e => updateProp('content.buttonText', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Background Image URL</span>
                            <input
                                type="text"
                                value={selected.props.content?.bgImage || ''}
                                onChange={e => updateProp('content.bgImage', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'Text Section' && (
                    <label className="block space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio / Narrative Text</span>
                        <textarea
                            rows={6}
                            value={selected.props.text || ''}
                            onChange={e => updateProp('text', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none italic"
                        />
                    </label>
                )}

                {selected.name === 'Image Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URL</span>
                            <input
                                type="text"
                                value={selected.props.url || ''}
                                onChange={e => updateProp('url', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption</span>
                            <input
                                type="text"
                                value={selected.props.caption || ''}
                                onChange={e => updateProp('caption', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'Contact Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Title</span>
                            <input
                                type="text"
                                value={selected.props.content?.title || ''}
                                onChange={e => updateProp('content.title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Label</span>
                            <input
                                type="text"
                                value={selected.props.content?.buttonLabel || ''}
                                onChange={e => updateProp('content.buttonLabel', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'Listings Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title</span>
                            <input
                                type="text"
                                value={selected.props.content?.title || ''}
                                onChange={e => updateProp('content.title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle</span>
                            <input
                                type="text"
                                value={selected.props.content?.subtitle || ''}
                                onChange={e => updateProp('content.subtitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target City</span>
                            <input
                                type="text"
                                value={selected.props.filters?.city || ''}
                                onChange={e => updateProp('filters.city', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Type</span>
                            <select
                                value={selected.props.filters?.propertyType || ''}
                                onChange={e => updateProp('filters.propertyType', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            >
                                <option value="">All Types</option>
                                <option value="Condo">Condo</option>
                                <option value="Detached">Detached</option>
                                <option value="Townhouse">Townhouse</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Limit</span>
                            <input
                                type="number"
                                value={selected.props.limit || 3}
                                onChange={e => updateProp('limit', parseInt(e.target.value) || 0)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'Agents Section' && (
                    <label className="block space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title</span>
                        <input
                            type="text"
                            value={selected.props.content?.title || ''}
                            onChange={e => updateProp('content.title', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                        />
                    </label>
                )}

                {/* ─── NEW COMPONENT SETTINGS ─── */}

                {selected.name === 'Heading Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heading Text</span>
                            <input
                                type="text"
                                value={selected.props.text || ''}
                                onChange={e => updateProp('text', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heading Level</span>
                            <select
                                value={selected.props.level || 'h2'}
                                onChange={e => updateProp('level', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            >
                                <option value="h1">H1 — Page Title</option>
                                <option value="h2">H2 — Section Title</option>
                                <option value="h3">H3 — Subsection</option>
                                <option value="h4">H4 — Small Heading</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</span>
                            <select
                                value={selected.props.align || 'center'}
                                onChange={e => updateProp('align', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </label>
                    </>
                )}

                {selected.name === 'Spacer Section' && (
                    <label className="block space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Height (px)</span>
                        <input
                            type="range"
                            min={10}
                            max={200}
                            value={selected.props.height || 60}
                            onChange={e => updateProp('height', parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                        <span className="text-xs text-slate-500 font-bold">{selected.props.height || 60}px</span>
                    </label>
                )}

                {selected.name === 'Divider Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Style</span>
                            <select
                                value={selected.props.style || 'gradient'}
                                onChange={e => updateProp('style', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            >
                                <option value="gradient">Gradient Fade</option>
                                <option value="solid">Solid Line</option>
                                <option value="dashed">Dashed Line</option>
                                <option value="dotted">Dotted Line</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Color</span>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={selected.props.color || '#e2e8f0'}
                                    onChange={e => updateProp('color', e.target.value)}
                                    className="w-10 h-10 border-none rounded-lg cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selected.props.color || '#e2e8f0'}
                                    onChange={e => updateProp('color', e.target.value)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </label>
                    </>
                )}

                {selected.name === 'Button Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Label</span>
                            <input
                                type="text"
                                value={selected.props.label || ''}
                                onChange={e => updateProp('label', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link URL</span>
                            <input
                                type="text"
                                value={selected.props.href || ''}
                                onChange={e => updateProp('href', e.target.value)}
                                placeholder="https://example.com"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Style</span>
                            <select
                                value={selected.props.variant || 'primary'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            >
                                <option value="primary">Primary (Indigo)</option>
                                <option value="secondary">Secondary (Dark)</option>
                                <option value="outline">Outline</option>
                                <option value="ghost">Ghost</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</span>
                            <select
                                value={selected.props.align || 'center'}
                                onChange={e => updateProp('align', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </label>
                    </>
                )}

                {selected.name === 'Video Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video URL</span>
                            <input
                                type="text"
                                value={selected.props.url || ''}
                                onChange={e => updateProp('url', e.target.value)}
                                placeholder="YouTube or Vimeo link"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption</span>
                            <input
                                type="text"
                                value={selected.props.caption || ''}
                                onChange={e => updateProp('caption', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'Testimonials Section' && (
                    <label className="block space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title</span>
                        <input
                            type="text"
                            value={selected.props.title || ''}
                            onChange={e => updateProp('title', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </label>
                )}

                {selected.name === 'Stats Section' && (
                    <label className="block space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title</span>
                        <input
                            type="text"
                            value={selected.props.title || ''}
                            onChange={e => updateProp('title', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </label>
                )}

                {selected.name === 'FAQ Section' && (
                    <label className="block space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title</span>
                        <input
                            type="text"
                            value={selected.props.title || ''}
                            onChange={e => updateProp('title', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                        />
                    </label>
                )}

                {selected.name === 'Newsletter Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</span>
                            <input
                                type="text"
                                value={selected.props.title || ''}
                                onChange={e => updateProp('title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle</span>
                            <input
                                type="text"
                                value={selected.props.subtitle || ''}
                                onChange={e => updateProp('subtitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Text</span>
                            <input
                                type="text"
                                value={selected.props.buttonText || ''}
                                onChange={e => updateProp('buttonText', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Background Color</span>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={selected.props.bgColor || '#4f46e5'}
                                    onChange={e => updateProp('bgColor', e.target.value)}
                                    className="w-10 h-10 border-none rounded-lg cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selected.props.bgColor || '#4f46e5'}
                                    onChange={e => updateProp('bgColor', e.target.value)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </label>
                    </>
                )}

                {selected.name === 'Gallery Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title</span>
                            <input
                                type="text"
                                value={selected.props.title || ''}
                                onChange={e => updateProp('title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Columns</span>
                            <select
                                value={selected.props.columns || 3}
                                onChange={e => updateProp('columns', parseInt(e.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            >
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                            </select>
                        </label>
                    </>
                )}

                {selected.name === 'Map Section' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</span>
                            <input
                                type="text"
                                value={selected.props.address || ''}
                                onChange={e => updateProp('address', e.target.value)}
                                placeholder="40 King Street West, Toronto"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</span>
                            <input
                                type="text"
                                value={selected.props.title || ''}
                                onChange={e => updateProp('title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle</span>
                            <input
                                type="text"
                                value={selected.props.subtitle || ''}
                                onChange={e => updateProp('subtitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}
            </div>
        </div>
    );
};

// --- TOPBAR ---
const Topbar = ({ onSave, agentId }: { onSave: (data: string) => void; agentId: string }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const websiteId = searchParams.get('websiteId');
    const pageId = searchParams.get('pageId');
    const { query, actions } = useEditor();
    const [saving, setSaving] = React.useState(false);
    const [saved, setSaved] = React.useState(false);

    const handleSave = async () => {
        setSaving(true);
        const json = query.serialize();
        await onSave(json);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all group"
                    title="Exit Builder"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-indigo-600/20">W</div>
                <div>
                    <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Website Architect <span className="text-indigo-600 italic font-medium ml-1">v4.0</span></h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none mt-1">
                        {agentId ? `Agent Profile: ${agentId}` : `Org: ${websiteId} • Page: ${pageId}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => actions.history.undo()}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                    title="Undo"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                <button
                    onClick={() => actions.history.redo()}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                    title="Redo"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-8l-6 6m6-6l-6-6" /></svg>
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <button
                    onClick={() => {
                        const url = agentId
                            ? `http://localhost:3001/preview/${agentId}`
                            : `http://localhost:3001/preview/org?websiteId=${websiteId}&pageId=${pageId}`;
                        window.open(url, '_blank');
                    }}
                    className="px-6 py-3 border-2 border-slate-200 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Preview Mode
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                {saved && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">✓ Saved</span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3 disabled:opacity-50"
                >
                    {saving ? 'Synchronizing...' : 'Publish Layout'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
            </div>
        </div>
    );
};

// --- INITIALIZER / LOADER ---
// --- TEMPLATE CONTENT DEFAULTS ---
// This ensures that when a template is loaded, it has the specific design seen in previews
const TEMPLATE_CONTENT_DEFAULTS: Record<string, Record<string, any>> = {
    'modern-realty': {
        'HeroSection': {
            content: {
                headline: 'Find Your Dream Home',
                subheadline: 'Explore premium properties curated for modern living.',
                buttonText: 'Browse Listings',
                bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600'
            }
        },
        'ListingsSection': {
            content: { title: 'Modern Living', subtitle: 'Our latest inventory' }
        },
        'TextSection': {
            text: 'Redefining the real estate experience with modern technology and personal touch.'
        },
        'ContactSection': {
            content: { title: 'Ready to find your next home?', buttonLabel: 'Get In Touch' }
        }
    },
    'luxury-estate': {
        'HeroSection': {
            content: {
                variant: 'luxury',
                headline: 'Exclusive Luxury Properties',
                subheadline: 'Discover premium homes in Canada\'s most desirable locations. Curated for the discerning buyer.',
                buttonText: 'View Portfolio',
                bgImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600'
            }
        },
        'ListingsSection': {
            content: { title: 'Featured Luxury Listings', subtitle: 'Handpicked properties from our exclusive portfolio, representing the pinnacle of real estate.' }
        },
        'TextSection': {
            text: 'Curating unparalleled living experiences for the world\'s most discerning clientele.'
        }
    },
    'corporate-brokerage': {
        'HeroSection': {
            content: {
                variant: 'corporate',
                headline: 'Your Trusted Real Estate Partner',
                subheadline: '50+ offices coast-to-coast. 200+ agents serving communities across Canada.',
                buttonText: 'Find Properties',
                bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600'
            }
        },
        'ListingsSection': {
            content: { title: 'Featured Listings', subtitle: 'Explore our curated selection of premier properties.' }
        },
        'TextSection': {
            text: 'Over 25 years of excellence in the Canadian real estate market.'
        },
        'ContactSection': {
            content: { title: 'Connect With Our Experts', buttonLabel: 'Contact Us' }
        }
    },
    'agent-portfolio': {
        'HeroSection': {
            content: {
                variant: 'agent',
                headline: 'Helping You Find the Perfect Home',
                subheadline: 'With 12+ years of experience and $40M in sales volume, Sarah Mitchell provides elite real estate services across Toronto\'s most prestigious neighborhoods.',
                buttonText: 'View My Listings',
                bgImage: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb81?auto=format&fit=crop&q=80&w=1600'
            }
        }
    },
    'minimal-realty': {
        'HeroSection': {
            content: {
                variant: 'minimal',
                headline: 'Less is more. Find your space.',
                subheadline: 'A curated approach to discovering properties that match your lifestyle.',
                buttonText: 'Explore',
                bgImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600'
            }
        }
    }
};

// (Loader is defined below)


const Loader = ({ agentId, websiteId, pageId, templateId }: { agentId?: string | null; websiteId?: string | null; pageId?: string | null; templateId: string }) => {
    const { actions, query } = useEditor();
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let cancelled = false;

        const initBuilder = async () => {
            try {
                let website: any = null;
                let sectionsData: { type: string }[] = [];

                if (agentId) {
                    try {
                        website = await websiteInstanceService.getWebsiteByAgentId(agentId);
                    } catch { }

                    if (website?.layoutConfig?.customLayoutJson) {
                        if (!cancelled) actions.deserialize(website.layoutConfig.customLayoutJson);
                        return;
                    }
                } else if (websiteId && pageId) {
                    try {
                        const page = await orgWebsiteService.getPageById('org-1', websiteId, pageId);
                        if (page?.customLayoutJson) {
                            if (!cancelled) actions.deserialize(page.customLayoutJson);
                            return;
                        }
                        // Fallback to sections list if no Craft JSON
                        if (page?.layoutConfig?.sections) {
                            sectionsData = page.layoutConfig.sections.map(s => ({ type: s.type }));
                        }
                    } catch { }
                }

                // 2) No custom layout saved yet → build sections from template

                // First check the website instance's own sections
                if (website?.layoutConfig?.sections && Array.isArray(website.layoutConfig.sections)) {
                    const wsSections = website.layoutConfig.sections as any[];
                    if (wsSections.length > 0) {
                        sectionsData = wsSections
                            .filter((s: any) => s.isVisible !== false && s.type)
                            .map((s: any) => ({ type: s.type }));
                    }
                }

                // Fallback: use the templateId from URL to look up the PLATFORM_TEMPLATES registry
                if (sectionsData.length === 0 && templateId) {
                    const template = PLATFORM_TEMPLATES.find(
                        t => t.templateKey === templateId || t.id === templateId
                    );
                    if (template) {
                        sectionsData = template.defaultLayoutConfig.sections
                            .filter(s => s.enabled)
                            .map(s => ({ type: s.type }));
                    }
                }

                // 3) Clear existing sections from canvas before loading new ones
                if (!cancelled) {
                    const nodes = query.node('ROOT').get().data.nodes || [];
                    nodes.forEach(id => actions.delete(id));
                }

                // 4) Convert template section types into Craft.js nodes and add to canvas
                if (sectionsData.length > 0 && !cancelled) {
                    // Look up the template templateKey to get the right defaults
                    const template = PLATFORM_TEMPLATES.find(
                        t => t.templateKey === templateId || t.id === templateId
                    );
                    const templateKey = template?.templateKey || templateId;
                    const templateDefaults = TEMPLATE_CONTENT_DEFAULTS[templateKey] || {};

                    // Build each section as a React element and add to the ROOT canvas
                    for (const section of sectionsData) {
                        if (cancelled) break;
                        const componentName = SECTION_TYPE_MAP[section.type];
                        if (!componentName) continue;
                        const comp = (Sections as any)[componentName];
                        if (!comp) continue;

                        try {
                            // Merge template-specific defaults for this component
                            const defaultProps = templateDefaults[componentName] || {};
                            const tree = query.parseReactElement(
                                React.createElement(comp, defaultProps)
                            ).toNodeTree();
                            actions.addNodeTree(tree, 'ROOT');
                        } catch (e) {
                            console.warn(`Failed to add section "${section.type}":`, e);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load website configuration:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        // Small delay to ensure the Editor/Frame are fully mounted
        const timer = setTimeout(initBuilder, 100);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [agentId, websiteId, pageId, templateId, actions, query]);

    if (loading) {
        return (
            <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Template Sections...</p>
                </div>
            </div>
        );
    }

    return null;
};


// --- SECTION COUNT INDICATOR ---
const SectionCounter = () => {
    const { nodes } = useEditor((state) => ({
        nodes: state.nodes,
    }));

    const rootNode = nodes['ROOT'];
    const sectionCount = rootNode?.data?.nodes?.length || 0;

    return (
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Active Sections: <span className="text-indigo-600">{sectionCount}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 italic">
                    Click a section to edit • Drag from toolbox to add
                </span>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════
// MAIN PAGE EXPORT
// ══════════════════════════════════════════════════════

export default function WebsiteBuilderPage() {
    return (
        <React.Suspense fallback={<div className="p-20 text-center font-black text-slate-300 uppercase italic">Loading Ecosystem...</div>}>
            <WebsiteBuilderInternalWrapper />
        </React.Suspense>
    );
}

function WebsiteBuilderInternalWrapper() {
    return (
        <Editor resolver={Sections}>
            <WebsiteBuilderInternal />
        </Editor>
    );
}

function WebsiteBuilderInternal() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const agentId = searchParams.get('agentId');
    const websiteId = searchParams.get('websiteId');
    const pageId = searchParams.get('pageId');
    const pageSlugParam = searchParams.get('page');
    const templateId = searchParams.get('templateId');

    const [activeTab, setActiveTab] = React.useState<'pages' | 'toolbox' | 'nav'>('toolbox');
    const [website, setWebsite] = React.useState<any>(null);
    const [pages, setPages] = React.useState<any[]>([]);
    const [resolvedPageId, setResolvedPageId] = React.useState<string | null>(pageId);

    // Helper: navigate to a page by ID using client-side routing (no full reload)
    const navigateToPage = React.useCallback((targetPageId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('pageId', targetPageId);
        params.delete('page');
        router.push(`/website-builder?${params.toString()}`);
    }, [router, searchParams]);

    // Helper: navigate to a page by slug
    const navigateToSlug = React.useCallback(async (slug: string) => {
        if (!websiteId) return;
        const page = await orgWebsiteService.getPageBySlug('org-1', websiteId, slug);
        if (page) navigateToPage(page.id);
    }, [websiteId, navigateToPage]);

    const fetchWebsite = async () => {
        if (websiteId) {
            const data = await orgWebsiteService.getOrgWebsite(websiteId);
            setWebsite(data);
            const pageList = await orgWebsiteService.getPages('org-1', websiteId);
            setPages(pageList);

            // Handle page resolution from slug if pageId is missing
            if (!pageId && (pageSlugParam || websiteId)) {
                const slug = pageSlugParam || '/';
                const page = await orgWebsiteService.getPageBySlug('org-1', websiteId, slug);
                if (page) {
                    setResolvedPageId(page.id);
                } else if (slug === '/') {
                    await orgWebsiteService.provisionDefaultPages('org-1', websiteId);
                    const home = await orgWebsiteService.getPageBySlug('org-1', websiteId, '/');
                    if (home) setResolvedPageId(home.id);
                }
            } else {
                setResolvedPageId(pageId);
            }
        }
    };

    React.useEffect(() => {
        fetchWebsite();
    }, [websiteId, pageId, pageSlugParam]);


    const handleSave = async (json: string) => {
        try {
            if (agentId) {
                let website = await websiteInstanceService.getWebsiteByAgentId(agentId);

                if (!website) {
                    // Auto-create a website instance if one doesn't exist
                    website = await websiteInstanceService.createWebsiteInstance({
                        organizationId: 'org-1',
                        agentId: agentId,
                        templateId: templateId || 'modern-realty',
                        domain: `agent-${agentId}.realestate.com`,
                    });
                }

                await websiteInstanceService.updateWebsiteInstance(website.id, {
                    layoutConfig: {
                        ...website.layoutConfig,
                        customLayoutJson: json,
                    } as any
                });
            } else if (websiteId && resolvedPageId) {
                await orgWebsiteService.savePageLayout('org-1', resolvedPageId, json);
            }

            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Layout Published Successfully',
                message: 'Your website design has been saved and published.'
            });
        } catch (err) {
            console.error(err);
            useNotificationStore.getState().addNotification({
                type: 'error',
                title: 'Publish Failed',
                message: 'Could not save the layout. Please try again.'
            });
        }
    };

    if (!agentId && !(websiteId && resolvedPageId)) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
                <div className="text-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-2xl max-w-lg">
                    <div className="h-20 w-20 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 font-black text-3xl">!</div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Missing Context</h2>
                    <p className="text-slate-500 mt-4 font-medium leading-relaxed">Please navigate to the Website Builder from an agent profile or organization website page to customize its layout.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-inter flex-1">
            <Loader agentId={agentId} websiteId={websiteId} pageId={resolvedPageId} templateId={templateId || 'modern-realty'} />
            <Topbar onSave={handleSave} agentId={agentId || ''} />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-6 z-50 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`p-3 rounded-2xl transition-all ${activeTab === 'pages' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50' : 'text-slate-500 hover:text-white'}`}
                        title="Pages"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </button>
                    <button
                        onClick={() => setActiveTab('toolbox')}
                        className={`p-3 rounded-2xl transition-all ${activeTab === 'toolbox' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50' : 'text-slate-500 hover:text-white'}`}
                        title="Add Elements"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                    <button
                        onClick={() => setActiveTab('nav')}
                        className={`p-3 rounded-2xl transition-all ${activeTab === 'nav' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50' : 'text-slate-500 hover:text-white'}`}
                        title="Navigation Menu"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>

                {/* Left Panel: Management */}
                <div className="w-[340px] bg-white border-r border-slate-200 flex flex-col overflow-y-auto shadow-sm z-40 flex-shrink-0">
                    {activeTab === 'pages' && websiteId && (
                        <PagesPanel
                            websiteId={websiteId}
                            currentPageId={resolvedPageId || ''}
                            onSelectPage={(id) => navigateToPage(id)}
                        />
                    )}
                    {activeTab === 'pages' && agentId && (
                        <div className="p-8 text-center bg-slate-50 h-full flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                            <h3 className="font-black text-slate-900 text-lg">Agent Profile Page</h3>
                            <p className="text-sm text-slate-500 mt-2 font-medium">You are currently editing your single-page profile. Multi-page support for agents is coming soon.</p>
                        </div>
                    )}
                    {activeTab === 'toolbox' && <Toolbox />}
                    {activeTab === 'nav' && websiteId && <NavigationPanel websiteId={websiteId} onUpdate={fetchWebsite} />}
                    {activeTab === 'nav' && agentId && (
                        <div className="p-8 text-center bg-slate-50 h-full flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></div>
                            <h3 className="font-black text-slate-900 text-lg">Navigation Locked</h3>
                            <p className="text-sm text-slate-500 mt-2 font-medium">Your agent profile uses a streamlined scroll navigation based on your active sections.</p>
                        </div>
                    )}
                </div>

                {/* Center Panel: Live Preview Canvas */}
                <div className="flex-1 bg-slate-100 p-8 overflow-y-auto custom-scrollbar relative border-r border-slate-200">
                    <TemplateProvider templateId={(templateId as any) || 'modern-realty'}>
                        <div className="max-w-4xl mx-auto min-h-[120vh] bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-200 flex flex-col">
                            {/* Browser-like Header */}
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-400" />
                                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                                </div>
                                <div className="flex-1 bg-white rounded-lg border border-slate-200 px-4 py-1.5 text-[10px] font-bold text-slate-400 italic font-mono truncate">
                                    {agentId ? `https://agent-${agentId}.realestate.com` : `https://brokerage.realestate.com${pages.find(p => p.id === resolvedPageId)?.slug || '/'}`}
                                </div>
                            </div>

                            <SectionCounter />

                            <div className="flex-1 overflow-y-auto">
                                <TemplateProvider
                                    templateId={(templateId as any) || 'modern-realty'}
                                    navigation={website?.navigation}
                                    organizationName={website?.organizationName}
                                    currentPageSlug={pages.find(p => p.id === resolvedPageId)?.slug || '/'}
                                    onNavigate={navigateToSlug}
                                >
                                    <div className="flex flex-col min-h-full">
                                        {/* Dynamic Header Component from selected template */}
                                        {(() => {
                                            const tpl = templateRegistry[(templateId as TemplateName)] || templateRegistry['modern-realty'];
                                            return tpl.Header ? React.createElement(tpl.Header as any, {}) : null;
                                        })()}

                                        <div className="flex-1">
                                            <Frame>
                                                <Element is="div" id="ROOT" canvas />
                                            </Frame>
                                        </div>

                                        {/* Dynamic Footer Component from selected template */}
                                        {(() => {
                                            const tpl = templateRegistry[(templateId as TemplateName)] || templateRegistry['modern-realty'];
                                            return tpl.Footer ? React.createElement(tpl.Footer as any, {}) : null;
                                        })()}
                                    </div>
                                </TemplateProvider>
                            </div>
                        </div>

                        {/* Preview Overlay Label */}
                        <div className="absolute top-12 right-12 px-6 py-3 bg-indigo-600/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl animate-pulse z-[60]">
                            Live Editor
                        </div>
                    </TemplateProvider>
                </div>

                {/* Right Panel: Settings / Properties */}
                <div className="w-[340px] bg-white flex flex-col overflow-y-auto shadow-xl z-40">
                    <SettingsPanel />
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
        </div>
    );
}
