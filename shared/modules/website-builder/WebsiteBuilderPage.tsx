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
    FeaturedListingsSection,
    ListingDetailSection,
    AgentDetailSection,
    CommunitiesSection,
} from './CraftSections';
import { renderSection } from './SectionRenderer';
import { websiteInstanceService, useNotificationStore, orgWebsiteService, type AgentPage } from '@repo/services';
import { TemplateProvider, templateRegistry, type TemplateName, GlobalHeader, GlobalFooter } from '@repo/ui';
import { useBuilderStore, type BuilderPage } from './useBuilderStore';
import { ShortcodeSelector } from '../listing-shortcodes';
import { seoEngine } from './SeoEngine';


// Base resolver map — template-specific overrides will be merged into this
const Sections: Record<string, any> = {
    'HeroSection': HeroSection,
    'ListingsSection': ListingsSection,
    'AgentProfilesSection': AgentProfilesSection,
    'ContactSection': ContactSection,
    'TextSection': TextSection,
    'ImageSection': ImageSection,
    'HeadingSection': HeadingSection,
    'SpacerSection': SpacerSection,
    'DividerSection': DividerSection,
    'ButtonSection': ButtonSection,
    'VideoSection': VideoSection,
    'TestimonialsSection': TestimonialsSection,
    'StatsSection': StatsSection,
    'FAQSection': FAQSection,
    'NewsletterSection': NewsletterSection,
    'GallerySection': GallerySection,
    'MapSection': MapSection,
    'FeaturedListingsSection': FeaturedListingsSection,
    'ListingDetailSection': ListingDetailSection,
    'AgentDetailSection': AgentDetailSection,
    'CommunitiesSection': CommunitiesSection,
};


// --- SECTION VARIANTS MAPPING ---
const sectionVariants: Record<string, { id: string; name: string; thumbnail?: string }[]> = {
    HeroSection: [
        { id: 'default', name: 'Modern Gradient', thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=300' },
        { id: 'luxury', name: 'Luxury Slate', thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=300' },
        { id: 'minimal', name: 'Minimal White', thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=300' },
        { id: 'corporate', name: 'Corporate Blue', thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300' },
        { id: 'agent', name: 'Agent Portrait', thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=300' },
        { id: 'agent-spotlight', name: 'Agent Spotlight + Form' },
        { id: 'property-search', name: 'Property Search' },
        { id: 'property-search-v2', name: 'Property Search V2 (WP Residence)' },
        { id: 'sidebar-profile', name: 'Sidebar Profile' },
        { id: 'split-agent', name: 'Split Agent' },
        { id: 'nature-immersive', name: 'Nature Immersive' }
    ],
    ListingsSection: [
        { id: 'default', name: 'Indigo Grid', thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=300' },
        { id: 'luxury', name: 'Luxury Slate', thumbnail: 'https://images.unsplash.com/photo-1600047537340-f935d5ea9e84?auto=format&fit=crop&q=80&w=300' },
        { id: 'minimal', name: 'Minimalist', thumbnail: 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&q=80&w=300' },
        { id: 'corporate', name: 'Corporate', thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=300' }
    ],
    FeaturedListingsSection: [
        { id: 'default', name: 'Indigo Grid', thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=300' },
        { id: 'luxury', name: 'Luxury Slate', thumbnail: 'https://images.unsplash.com/photo-1600047537340-f935d5ea9e84?auto=format&fit=crop&q=80&w=300' },
        { id: 'minimal', name: 'Minimalist', thumbnail: 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&q=80&w=300' },
        { id: 'corporate', name: 'Corporate', thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=300' }
    ],
    AgentProfilesSection: [
        { id: 'default', name: 'Grid View', thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=300' },
        { id: 'luxury', name: 'Luxury Cards', thumbnail: 'https://images.unsplash.com/photo-1600585154526-990dcea4de00?auto=format&fit=crop&q=80&w=300' },
        { id: 'minimal', name: 'Clean List', thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=300' },
        { id: 'corporate', name: 'Professional', thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300' }
    ],
    ContactSection: [
        { id: 'default', name: 'Split Layout', thumbnail: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=300' },
        { id: 'luxury', name: 'Dark Luxury', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300' },
        { id: 'minimal', name: 'Minimal Form', thumbnail: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=300' },
        { id: 'corporate', name: 'Business Multi-column', thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=300' }
    ],
    VideoSection: [
        { id: 'cinema', name: 'Full Screen Cinema', thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=300' },
        { id: 'story', name: 'Side-by-Side Story', thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=300' },
        { id: 'minimal', name: 'Minimalist Player', thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=300' },
        { id: 'floating', name: 'Floating Content', thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300' }
    ]
};

// --- VARIANT PICKER MODAL ---
const VariantPickerModal = ({ isOpen, type, onClose, onSelect }: { isOpen: boolean; type: string; onClose: () => void; onSelect: (variant: string) => void }) => {
    if (!isOpen) return null;
    const variants = sectionVariants[type] || [
        { id: 'default', name: 'Standard Layout' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-full">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
                            </div>
                            Choose Design Variant
                        </h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Select a style for your new {type.replace('Section', '')} block</p>
                    </div>
                    <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-slate-100 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center text-slate-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {variants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => onSelect(variant.id)}
                                className="group relative flex flex-col text-left space-y-4 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-indigo-500 group-hover:ring-4 group-hover:ring-indigo-500/10 transition-all shadow-sm group-hover:shadow-xl relative">
                                    {variant.thumbnail ? (
                                        <img src={variant.thumbnail} alt={variant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-[10px] font-black uppercase tracking-widest">Preview Coming Soon</div>
                                    )}
                                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors" />
                                </div>
                                <div className="px-2">
                                    <h4 className="text-slate-900 font-black tracking-tight">{variant.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Click to Select & Add</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Variants can be changed later in the section settings</p>
                </div>
            </div>
        </div>
    );
};

// --- TOOLBOX ---
const Toolbox = ({ resolver, setActiveTab }: { resolver: any; setActiveTab: (tab: any) => void }) => {
    const { connectors, actions, query } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));
    const store = useBuilderStore();
    const [pickingSection, setPickingSection] = React.useState<string | null>(null);
    const [expandedTool, setExpandedTool] = React.useState<string | null>(null);

    // Legacy 'agent' mode (restricted) shows locked state
    if (store.builderMode === 'agent') {
        return (
            <div className="p-8 text-center space-y-6">
                <div className="h-20 w-20 mx-auto bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-inner">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Standard Profile Mode</h3>
                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                        You are in restricted mode. Layout and navigation are managed by the agency.
                    </p>
                </div>

                <button
                    onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('agentAdvanced', 'true');
                        window.location.href = url.toString();
                    }}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 group"
                >
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                    Unlock Advanced Editor
                </button>
            </div>
        );
    }

    const handleSelectVariant = (variantId: string) => {
        if (!pickingSection) return;
        const type = pickingSection;
        const Component = (resolver as any)[type] || (Sections as any)[type];

        if (Component) {
            try {
                const element = React.createElement(Component, { variant: variantId });
                const tree = query.parseReactElement(element).toNodeTree();
                actions.addNodeTree(tree, 'ROOT');

                // Sync new section to store so the map loop sees it
                store.addSection(store.activePageId || 'home', {
                    id: tree.rootNodeId,
                    type: type,
                    config: { variant: variantId }
                });

                // Select the new section immediately
                setTimeout(() => actions.selectNode(tree.rootNodeId), 0);

                useNotificationStore.getState().addNotification({
                    type: 'success',
                    title: 'Section Added',
                    message: `${type.replace('Section', '')} added to page.`
                });
            } catch (err) {
                console.error("Failed to add section tree:", err);
            }
        }

        setPickingSection(null);
    };

    // 'agent-advanced' and 'organization' both get the full toolbox
    const layoutTools = [
        { type: 'HeadingSection', label: 'Heading', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', color: 'violet', expandable: true },
        { type: 'TextSection', label: 'Text', icon: 'M4 6h16M4 12h16m-7 6h7', color: 'violet', expandable: true },
        { type: 'SpacerSection', label: 'Spacer', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4', color: 'violet', expandable: true },
        { type: 'DividerSection', label: 'Divider', icon: 'M20 12H4', color: 'violet', expandable: true },
        { type: 'ButtonSection', label: 'Button', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5', color: 'violet', expandable: true },
    ];

    const contentTools = [
        { type: 'HeroSection', label: 'Hero', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z', color: 'indigo', expandable: true },
        { type: 'ImageSection', label: 'Image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'indigo', expandable: true },
        { type: 'VideoSection', label: 'Video', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'indigo', expandable: true },
        { type: 'GallerySection', label: 'Gallery', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', color: 'indigo', expandable: true },
        { type: 'ListingsSection', label: 'Listings', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'indigo', expandable: true },
        { type: 'FeaturedListingsSection', label: 'Featured', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'indigo', expandable: true },
        { type: 'CommunitiesSection', label: 'Communities', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'indigo', expandable: true },
        { type: 'MapSection', label: 'Map', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z', color: 'indigo', expandable: true },
    ];

    const interactiveTools = [
        { type: 'AgentProfilesSection', label: 'Agents', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'emerald', expandable: true },
        { type: 'TestimonialsSection', label: 'Reviews', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'emerald', expandable: true },
        { type: 'StatsSection', label: 'Stats', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'emerald', expandable: true },
        { type: 'FAQSection', label: 'FAQ', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald', expandable: true },
        { type: 'ContactSection', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'emerald', expandable: true },
        { type: 'NewsletterSection', label: 'Newsletter', icon: 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76', color: 'emerald', expandable: true },
    ];

    const colorMap: Record<string, { bg: string; hoverBorder: string; hoverBg: string; hoverText: string }> = {
        violet: { bg: 'bg-violet-50', hoverBorder: 'hover:border-violet-400', hoverBg: 'group-hover:bg-violet-100', hoverText: 'group-hover:text-violet-600' },
        indigo: { bg: 'bg-indigo-50', hoverBorder: 'hover:border-indigo-400', hoverBg: 'group-hover:bg-indigo-100', hoverText: 'group-hover:text-indigo-600' },
        emerald: { bg: 'bg-emerald-50', hoverBorder: 'hover:border-emerald-400', hoverBg: 'group-hover:bg-emerald-100', hoverText: 'group-hover:text-emerald-600' },
        rose: { bg: 'bg-rose-50', hoverBorder: 'hover:border-rose-400', hoverBg: 'group-hover:bg-rose-100', hoverText: 'group-hover:text-rose-600' },
    };

    const renderToolGroup = (title: string, tools: any[]) => (
        <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <div className="grid grid-cols-3 gap-2">
                {tools.map((tool) => {
                    const colors = colorMap[tool.color];
                    const isExpanded = expandedTool === tool.type;

                    return (
                        <React.Fragment key={tool.type}>
                            <div
                                onClick={() => {
                                    if (tool.expandable) {
                                        setExpandedTool(isExpanded ? null : tool.type);
                                    } else {
                                        setPickingSection(tool.type);
                                    }
                                }}
                                className={`p-3 rounded-xl bg-white border border-slate-200 ${colors.hoverBorder} ${isExpanded ? 'border-indigo-500 shadow-inner bg-slate-50' : 'hover:shadow-md'} transition-all group cursor-pointer text-center space-y-2 relative`}
                            >
                                <div className={`h-9 w-9 mx-auto rounded-lg ${colors.bg} flex items-center justify-center text-slate-400 ${colors.hoverBg} ${colors.hoverText} transition-colors`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} /></svg>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight text-slate-500 group-hover:text-slate-900 block leading-tight">{tool.label}</span>
                                {tool.expandable && (
                                    <div className={`absolute top-1 right-1 h-3 w-3 flex items-center justify-center rounded-full bg-indigo-500 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                )}
                            </div>

                            {/* Expanded Variants for DividerSection */}
                            {isExpanded && tool.type === 'DividerSection' && (
                                <div className="col-span-3 grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'solid', label: 'Solid Line' },
                                        { id: 'gradient', label: 'Fading Gap' },
                                        { id: 'dotted', label: 'Modern Dots' },
                                        { id: 'accent', label: 'Indigo Bar' },
                                        { id: 'glass', label: 'Glassy' }
                                    ].map((v) => {
                                        const Comp = resolver['DividerSection'] || DividerSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-violet-400 hover:shadow-sm cursor-grab active:cursor-grabbing text-center space-y-1 group/var"
                                            >
                                                <div className="h-8 w-8 mx-auto rounded-md bg-violet-50 flex items-center justify-center text-violet-400 group-hover/var:bg-violet-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for SpacerSection */}
                            {isExpanded && tool.type === 'SpacerSection' && (
                                <div className="col-span-3 grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'small', label: 'Compact' },
                                        { id: 'medium', label: 'Standard' },
                                        { id: 'large', label: 'Grand Gap' }
                                    ].map((v) => {
                                        const Comp = resolver['SpacerSection'] || SpacerSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-violet-400 hover:shadow-sm cursor-grab active:cursor-grabbing text-center space-y-1 group/var"
                                            >
                                                <div className="h-8 w-8 mx-auto rounded-md bg-violet-50 flex items-center justify-center text-violet-400 group-hover/var:bg-violet-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for TextSection */}
                            {isExpanded && tool.type === 'TextSection' && (
                                <div className="col-span-3 grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'standard', label: 'Body Text' },
                                        { id: 'lead', label: 'Modern Lead' },
                                        { id: 'muted', label: 'Muted Info' }
                                    ].map((v) => {
                                        const Comp = resolver['TextSection'] || TextSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-violet-400 hover:shadow-sm cursor-grab active:cursor-grabbing text-center space-y-1 group/var"
                                            >
                                                <div className="h-8 w-8 mx-auto rounded-md bg-violet-50 flex items-center justify-center text-violet-400 group-hover/var:bg-violet-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for HeadingSection */}
                            {isExpanded && tool.type === 'HeadingSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Standard Title' },
                                        { id: 'underline', label: 'Modern Underline' },
                                        { id: 'accent', label: 'Primary Accent' },
                                        { id: 'luxury', label: 'Luxury Serif' }
                                    ].map((v) => {
                                        const Comp = resolver['HeadingSection'] || HeadingSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-violet-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-3 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-violet-50 flex items-center justify-center text-violet-400 group-hover/var:bg-violet-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for ButtonSection */}
                            {isExpanded && tool.type === 'ButtonSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'primary', label: 'Primary Solid' },
                                        { id: 'secondary', label: 'Sleek Luxury' },
                                        { id: 'outline', label: 'Classic Outline' },
                                        { id: 'ghost', label: 'Minimal Ghost' },
                                        { id: 'glow', label: 'Active Glow' }
                                    ].map((v) => {
                                        const Comp = resolver['ButtonSection'] || ButtonSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-violet-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-3 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-violet-50 flex items-center justify-center text-violet-400 group-hover/var:bg-violet-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for HeroSection */}
                            {isExpanded && tool.type === 'HeroSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Dynamic Gradient' },
                                        { id: 'luxury', label: 'Luxury Black' },
                                        { id: 'agent', label: 'Agent Profile' },
                                        { id: 'corporate', label: 'Corporate Stats' },
                                        { id: 'minimal', label: 'Minimal Clean' },
                                        { id: 'agent-spotlight', label: 'Agent Spotlight' },
                                        { id: 'property-search', label: 'Property Search' },
                                        { id: 'property-search-v2', label: 'Property Search V2' },
                                        { id: 'sidebar-profile', label: 'Sidebar Nav' },
                                        { id: 'split-agent', label: 'Split Agent' },
                                        { id: 'nature-immersive', label: 'Nature Scenic' }
                                    ].map((v) => {
                                        const Comp = resolver['HeroSection'] || HeroSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-3 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover/var:bg-indigo-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for ImageSection */}
                            {isExpanded && tool.type === 'ImageSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Standard View' },
                                        { id: 'boxed', label: 'Framed Box' },
                                        { id: 'parallax', label: 'Deep Parallax' },
                                        { id: 'rounded', label: 'Minimal Round' }
                                    ].map((v) => {
                                        const Comp = resolver['ImageSection'] || ImageSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-3 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover/var:bg-indigo-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for AgentProfilesSection */}
                            {isExpanded && tool.type === 'AgentProfilesSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-3 p-3 bg-slate-100 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'grid', label: 'Classic Grid', desc: 'Standard business layout' },
                                        { id: 'showcase', label: 'Elite Showcase', desc: 'Large high-impact cards' },
                                        { id: 'mini', label: 'Modern Mini', desc: 'Compact circle profile cards' }
                                    ].map((v) => {
                                        const Comp = resolver['AgentProfilesSection'] || AgentProfilesSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing flex flex-col gap-2 group/var transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover/var:bg-emerald-600 group-hover/var:text-white transition-colors">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857" /></svg>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-black uppercase tracking-tight text-slate-900 leading-none">{v.label}</span>
                                                        <span className="block text-[8px] font-medium text-slate-400 mt-0.5">{v.desc}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for VideoSection */}
                            {isExpanded && tool.type === 'VideoSection' && (
                                <div className="col-span-3 grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'cinema', label: 'Video Design 1' },
                                        { id: 'story', label: 'Video Design 2' },
                                        { id: 'floating', label: 'Video Design 3' }
                                    ].map((v) => {
                                        const Comp = resolver['VideoSection'] || VideoSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing text-center space-y-1 group/var"
                                            >
                                                <div className="h-8 w-8 mx-auto rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover/var:bg-indigo-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                                                </div>
                                                <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for GallerySection */}
                            {isExpanded && tool.type === 'GallerySection' && (
                                <div className="col-span-3 grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'grid', label: 'Modern Grid' },
                                        { id: 'masonry', label: 'Mosaic Masonry' },
                                        { id: 'minimal', label: 'Elegant Min' }
                                    ].map((v) => {
                                        const Comp = resolver['GallerySection'] || GallerySection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing text-center space-y-1 group/var"
                                            >
                                                <div className="h-8 w-8 mx-auto rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover/var:bg-indigo-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for ListingsSection */}
                            {isExpanded && tool.type === 'ListingsSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Modern Grid' },
                                        { id: 'luxury', label: 'Luxury Overlay' },
                                        { id: 'minimal', label: 'Minimal List' },
                                        { id: 'corporate', label: 'Corporate Card' }
                                    ].map((v) => {
                                        const Comp = resolver['ListingsSection'] || ListingsSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-3 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover/var:bg-indigo-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {/* Expanded Variants for FeaturedListingsSection */}
                            {isExpanded && tool.type === 'FeaturedListingsSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Modern Grid' },
                                        { id: 'luxury', label: 'Luxury Overlay' },
                                        { id: 'minimal', label: 'Minimal List' },
                                        { id: 'corporate', label: 'Corporate Card' }
                                    ].map((v) => {
                                        const Comp = resolver['FeaturedListingsSection'] || FeaturedListingsSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-3 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover/var:bg-indigo-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for TestimonialsSection */}
                            {isExpanded && tool.type === 'TestimonialsSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Classic Reviews' }
                                    ].map((v) => {
                                        const Comp = resolver['TestimonialsSection'] || TestimonialsSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-2 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-400 group-hover/var:bg-emerald-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for StatsSection */}
                            {isExpanded && tool.type === 'StatsSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Standard Stats' }
                                    ].map((v) => {
                                        const Comp = resolver['StatsSection'] || StatsSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-2 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-400 group-hover/var:bg-emerald-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for FAQSection */}
                            {isExpanded && tool.type === 'FAQSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Modern FAQ' }
                                    ].map((v) => {
                                        const Comp = resolver['FAQSection'] || FAQSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-2 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-400 group-hover/var:bg-emerald-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for ContactSection */}
                            {isExpanded && tool.type === 'ContactSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', name: 'Split Layout' },
                                        { id: 'luxury', name: 'Dark Luxury' },
                                        { id: 'minimal', name: 'Minimal Form' },
                                        { id: 'corporate', name: 'Business Multi-column' }
                                    ].map((v) => {
                                        const Comp = resolver['ContactSection'] || ContactSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-2 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-400 group-hover/var:bg-emerald-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{(v as any).name || v.id}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for NewsletterSection */}
                            {isExpanded && tool.type === 'NewsletterSection' && (
                                <div className="col-span-3 grid grid-cols-2 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'default', label: 'Modern Join' }
                                    ].map((v) => {
                                        const Comp = resolver['NewsletterSection'] || NewsletterSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-2 group/var"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-400 group-hover/var:bg-emerald-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93" /></svg>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for MapSection */}
                            {isExpanded && tool.type === 'MapSection' && (
                                <div className="col-span-3 grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'classic', label: 'Classic View' },
                                        { id: 'minimal', label: 'Modern Dark' },
                                        { id: 'split', label: 'Info Split' }
                                    ].map((v) => {
                                        const Comp = resolver['MapSection'] || MapSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing text-center space-y-1 group/var"
                                            >
                                                <div className="h-8 w-8 mx-auto rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover/var:bg-indigo-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                                </div>
                                                <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Expanded Variants for CommunitiesSection */}
                            {isExpanded && tool.type === 'CommunitiesSection' && (
                                <div className="col-span-3 grid grid-cols-3 gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {[
                                        { id: 'grid', label: 'Visual Grid' },
                                        { id: 'list', label: 'Modern List' },
                                        { id: 'featured', label: 'Luxury Cards' }
                                    ].map((v) => {
                                        const Comp = resolver['CommunitiesSection'] || CommunitiesSection;
                                        return (
                                            <div
                                                key={v.id}
                                                ref={(ref) => { if (ref) connectors.create(ref, <Comp variant={v.id} />); }}
                                                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing text-center space-y-1 group/var"
                                            >
                                                <div className="h-8 w-8 mx-auto rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover/var:bg-indigo-600 group-hover/var:text-white transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>
                                                </div>
                                                <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500 group-hover/var:text-slate-900">{v.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="p-5 space-y-5">
            <VariantPickerModal
                isOpen={!!pickingSection}
                type={pickingSection || ''}
                onClose={() => setPickingSection(null)}
                onSelect={handleSelectVariant}
            />
            <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Toolbox</h3>
                <p className="text-[10px] text-slate-500 font-medium">Drag components to your site</p>
            </div>
            {renderToolGroup('Layout Blocks', layoutTools)}
            {renderToolGroup('Content Blocks', contentTools)}
            {renderToolGroup('Interactive Blocks', interactiveTools)}

            <div className="space-y-3 pt-3 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Design</p>
                <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={() => setActiveTab('design')}
                        className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 hover:border-indigo-400 hover:bg-white hover:shadow-md transition-all text-left flex items-center justify-between group"
                    >
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">Global Header & Header Selection</h4>
                            <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-tight">Configure navigation & logos</p>
                        </div>
                        <div className="p-2 bg-indigo-600 rounded-lg text-white group-hover:bg-indigo-700 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('design')}
                        className="p-4 rounded-xl bg-rose-50 border border-rose-100 hover:border-rose-400 hover:bg-white hover:shadow-md transition-all text-left flex items-center justify-between group"
                    >
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest leading-none">Global Footer Selection</h4>
                            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tight">Manage links & copyrights</p>
                        </div>
                        <div className="p-2 bg-rose-600 rounded-lg text-white group-hover:bg-rose-700 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                    </button>
                </div>
            </div>

            <div className="pt-3 border-t border-slate-50">
                <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest text-center leading-relaxed">
                    Drag blocks to add • Click elements to edit<br />Global sections apply to all pages
                </p>
            </div>
        </div>
    );
};

// --- DESIGN PANEL ---
const DesignPanel = ({ websiteId }: { websiteId: string; agentId?: string | null }) => {
    const store = useBuilderStore();
    const config = store.website?.brandingConfig || {};
    const globalSections = store.globalSections;
    const [localConfig, setLocalConfig] = React.useState(config);

    const handleUpdate = (updates: any) => {
        const next = { ...localConfig, ...updates };
        setLocalConfig(next);
        store.updateBrandingConfig(updates);
    };

    const handleGlobalUpdate = (section: 'header' | 'footer', updates: any) => {
        store.updateGlobalSection(section, updates);
    };

    const handleSave = async () => {
        try {
            await websiteInstanceService.updateWebsiteInstance(websiteId, {
                brandingConfig: localConfig,
                globalSections: store.globalSections // Include global sections in save
            });
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Global Design Saved',
                message: 'Header, Footer, and Branding have been updated across your site.'
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-5 space-y-6 custom-scrollbar overflow-y-auto h-full pb-20">
            <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Global Sections</h3>
                <p className="text-[10px] text-slate-500 font-medium">Header and Footer variants</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Header Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'header-v1', name: 'Classic' },
                            { id: 'header-v2', name: 'Centered' },
                            { id: 'minimal', name: 'Minimal' },
                            { id: 'top-bar', name: 'Top Bar + Nav' },
                            { id: 'transparent', name: 'Transparent' },
                            { id: 'sidebar', name: 'Sidebar Nav' },
                            { id: 'clean-split', name: 'Clean Split' },
                            { id: 'nature-bar', name: 'Nature / Center' }
                        ].map(h => (
                            <button
                                key={h.id}
                                onClick={() => {
                                    handleGlobalUpdate('header', { type: h.id });
                                    handleUpdate({ headerLayout: h.id });
                                }}
                                className={`py-4 px-2 text-[8px] font-black uppercase rounded-2xl border transition-all flex flex-col items-center gap-2 ${globalSections.header.type === h.id || localConfig.headerLayout === h.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                <div className="h-6 w-full flex flex-col gap-1 justify-center opacity-50">
                                    <div className="h-1 w-full bg-current rounded-full" />
                                    <div className={`h-1 rounded-full bg-current ${h.id === 'header-v1' ? 'w-1/2' : 'w-2/3 mx-auto'}`} />
                                </div>
                                {h.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 pt-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Footer Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'footer-v1', name: 'Detailed' },
                            { id: 'footer-v2', name: 'Simple' },
                            { id: 'footer-v3', name: 'Denver Lists' },
                            { id: 'footer-v4', name: 'Property Grid' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => handleGlobalUpdate('footer', { type: f.id })}
                                className={`py-4 px-2 text-[8px] font-black uppercase rounded-2xl border transition-all flex flex-col items-center gap-2 ${globalSections.footer.type === f.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                <div className="grid grid-cols-2 gap-1 w-full opacity-50">
                                    <div className="h-4 bg-current rounded" />
                                    <div className={`h-4 bg-current rounded ${f.id === 'footer-v3' || f.id === 'footer-v4' ? 'bg-indigo-400 opacity-60' : ''}`} />
                                </div>
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Branding</h3>
                <p className="text-[10px] text-slate-500 font-medium">Logo and colors</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Header Layout</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['logo-left', 'logo-center', 'minimal', 'top-bar', 'transparent', 'sidebar', 'clean-split', 'nature-bar'] as const).map(l => (
                            <button
                                key={l}
                                onClick={() => handleUpdate({ headerLayout: l })}
                                className={`py-2 px-1 text-[8px] font-black uppercase rounded-lg border transition-all ${localConfig.headerLayout === l || (!localConfig.headerLayout && l === 'logo-left') ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                {l.replace(/-/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Organization Name</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={localConfig.organizationName || ''}
                        onChange={e => handleUpdate({ organizationName: e.target.value })}
                        placeholder="e.g. Skyline Estates"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Logo URL</label>
                    <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={localConfig.logoUrl || ''}
                        onChange={e => handleUpdate({ logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                    />
                </div>

                <hr className="border-slate-100" />

                <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Show Header Button</label>
                    <button
                        onClick={() => handleUpdate({ showHeaderButton: localConfig.showHeaderButton === false ? true : false })}
                        className={`w-8 h-4 rounded-full transition-all relative ${localConfig.showHeaderButton !== false ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${localConfig.showHeaderButton !== false ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                </div>

                {localConfig.showHeaderButton !== false && (
                    <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Header Button Text</label>
                        <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={localConfig.headerButtonText || ''}
                            onChange={e => handleUpdate({ headerButtonText: e.target.value })}
                            placeholder="e.g. Get Started"
                        />
                    </div>
                )}

                <hr className="border-slate-100" />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Buttons</label>
                        <button
                            onClick={() => {
                                const buttons = [...(localConfig.headerButtons || []), { label: 'New Button', slug: '/', variant: 'outline' }];
                                handleUpdate({ headerButtons: buttons });
                            }}
                            className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
                        >+ Add Button</button>
                    </div>

                    {(localConfig.headerButtons || []).map((btn: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-2xl space-y-3 relative group">
                            <button
                                onClick={() => {
                                    const buttons = localConfig.headerButtons.filter((_: any, idx: number) => idx !== i);
                                    handleUpdate({ headerButtons: buttons });
                                }}
                                className="absolute right-2 top-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                                    value={btn.label}
                                    onChange={e => {
                                        const buttons = [...localConfig.headerButtons];
                                        buttons[i].label = e.target.value;
                                        handleUpdate({ headerButtons: buttons });
                                    }}
                                    placeholder="Label"
                                />
                                <input
                                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                                    value={btn.slug}
                                    onChange={e => {
                                        const buttons = [...localConfig.headerButtons];
                                        buttons[i].slug = e.target.value;
                                        handleUpdate({ headerButtons: buttons });
                                    }}
                                    placeholder="/link"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(['primary', 'secondary', 'outline'] as const).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => {
                                            const buttons = [...localConfig.headerButtons];
                                            buttons[i].variant = v;
                                            handleUpdate({ headerButtons: buttons });
                                        }}
                                        className={`px-2 py-1 text-[8px] font-black uppercase rounded transition-all ${btn.variant === v ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brand Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
                                value={localConfig.primaryColor || '#4f46e5'}
                                onChange={e => handleUpdate({ primaryColor: e.target.value })}
                            />
                            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">{localConfig.primaryColor || '#4F46E5'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all hover:-translate-y-0.5"
            >
                Apply Changes
            </button>
        </div>
    );
};
const GoogleSnippetPreview = ({ title, description, url }: { title: string; description: string; url: string }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-lg space-y-1 mb-6">
        <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-1.17-2.903A9.994 9.994 0 0112 3m9 9a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-[10px] font-medium text-slate-500 truncate">{url}</span>
        </div>
        <h3 className="text-xl font-medium text-[#1a0dab] hover:underline cursor-pointer leading-tight line-clamp-2">
            {title || 'Untitled Page'}
        </h3>
        <p className="text-sm text-[#4d5156] line-clamp-3 leading-relaxed">
            {description || 'Provide a compelling meta description to improve your click-through rate in search results...'}
        </p>
    </div>
);

const SeoPanel = ({ websiteId }: { agentId?: string | null; websiteId: string }) => {
    const store = useBuilderStore();
    const website = store.website;
    const [subTab, setSubTab] = React.useState<'global' | 'pages' | 'dynamic' | 'automation'>('global');
    const [selectedPageId, setSelectedPageId] = React.useState<string | null>(null);
    const [seo, setSeo] = React.useState<any>(null);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (website?.seo) {
            setSeo(JSON.parse(JSON.stringify(website.seo)));
        } else {
            setSeo({
                global: { title: '', description: '', ogImage: '' },
                pages: {},
                dynamic: {
                    listing: { titleTemplate: '{propertyType} for Sale in {city} | {siteName}', descriptionTemplate: 'Explore {propertyType} listings in {city}' }
                }
            });
        }
    }, [website]);

    const handleSave = async (updatedSeo?: any) => {
        setSaving(true);
        try {
            const dataToSave = updatedSeo || seo;
            const targetOrgId = store.website?.organizationId || 'org-1';
            if (store.builderMode === 'organization') {
                await orgWebsiteService.updateWebsite(targetOrgId, websiteId, { seo: dataToSave });
            } else {
                await websiteInstanceService.updateWebsiteInstance(websiteId, { seo: dataToSave });
            }
            store.setWebsite({ ...website, seo: dataToSave });
            useNotificationStore.getState().addNotification({ type: 'success', title: 'SEO Updated', message: 'SEO settings saved successfully.' });
        } catch (err) {
            useNotificationStore.getState().addNotification({ type: 'error', title: 'Update Failed', message: 'Could not save SEO configuration.' });
        } finally {
            setSaving(false);
        }
    };

    if (!seo) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initialising SEO Engine...</div>;

    const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none';
    const labelClass = 'text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block';

    const renderPageEditor = (pageId: string) => {
        const page = store.pages[pageId];
        if (!page) return null;

        const pageSeo = seo.pages?.[pageId] || { title: page.name, description: '', autoGenerate: true };
        const listingSection = page.sections.find(s => s.type === 'ListingsSection');
        const generated = seoEngine.generateDynamicSeo(page, website?.name || 'Prestige Realty');

        const finalTitle = pageSeo.autoGenerate ? generated.title : pageSeo.title;
        const finalDesc = pageSeo.autoGenerate ? generated.description : pageSeo.description;

        const updatePageSeo = (updates: any) => {
            const next = { ...seo, pages: { ...seo.pages, [pageId]: { ...pageSeo, ...updates } } };
            setSeo(next);
        };

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <button onClick={() => setSelectedPageId(null)} className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    Back to Selection
                </button>

                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">SEO Generation Mode</h4>
                        <p className="text-[9px] font-bold text-indigo-400 uppercase mt-1">
                            {pageSeo.autoGenerate ? 'Auto (from shortcode)' : 'Manual Mode'}
                        </p>
                    </div>
                    <button
                        onClick={() => updatePageSeo({ autoGenerate: !pageSeo.autoGenerate })}
                        className={`h-6 w-11 rounded-full transition-all relative ${pageSeo.autoGenerate ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pageSeo.autoGenerate ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>

                <GoogleSnippetPreview
                    title={finalTitle}
                    description={finalDesc}
                    url={`${website?.domain || 'site.com'}${page.slug}`}
                />

                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Meta Title {pageSeo.autoGenerate && '(Auto)'}</label>
                        <input
                            className={fieldClass}
                            value={pageSeo.autoGenerate ? finalTitle : (pageSeo.title || '')}
                            onChange={e => updatePageSeo({ title: e.target.value })}
                            disabled={pageSeo.autoGenerate}
                            placeholder="e.g. Luxury Condos for Sale"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Meta Description {pageSeo.autoGenerate && '(Auto)'}</label>
                        <textarea
                            rows={3}
                            className={fieldClass}
                            value={pageSeo.autoGenerate ? finalDesc : (pageSeo.description || '')}
                            onChange={e => updatePageSeo({ description: e.target.value })}
                            disabled={pageSeo.autoGenerate}
                            placeholder="Discover the best properties..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Canonical URL</label>
                            <input
                                className={fieldClass}
                                value={pageSeo.canonical || ''}
                                onChange={e => updatePageSeo({ canonical: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                id="noIndexToggle"
                                checked={pageSeo.noIndex}
                                onChange={e => updatePageSeo({ noIndex: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="noIndexToggle" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">Hide from Google</label>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-4 font-sans">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Structured Data & Linking</h5>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded">Healthy</span>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className={labelClass}>JSON-LD Schema Preview</label>
                                <div className="p-4 bg-slate-900 rounded-2xl font-mono text-[9px] text-indigo-300 overflow-x-auto whitespace-pre custom-scrollbar max-h-40 border border-slate-800 shadow-inner">
                                    {seoEngine.generateSchemaMarkup(page, website)}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Internal Linking Strategy</label>
                                <div className="flex flex-wrap gap-2">
                                    {seoEngine.generateInternalLinking(listingSection?.config?.filters?.city || 'Local', listingSection?.config?.filters?.propertyType || 'Real Estate').map((link, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-tight shadow-sm">
                                            {link}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className={labelClass}>Slug Management</label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-400">
                                {page.slug}
                            </div>
                            <button
                                onClick={() => {
                                    const listingSection = page.sections.find(s => s.type === 'ListingsSection');
                                    if (listingSection?.config?.filters) {
                                        const newSlug = seoEngine.generateDynamicSlug(listingSection.config.filters);
                                        store.updatePage(pageId, { slug: newSlug });
                                        useNotificationStore.getState().addNotification({
                                            type: 'success',
                                            title: 'Slug Generated',
                                            message: `URL updated to ${newSlug}`
                                        });
                                    } else {
                                        useNotificationStore.getState().addNotification({
                                            type: 'warning',
                                            title: 'No MLS Data',
                                            message: 'Add a listings section first to generate a dynamic slug.'
                                        });
                                    }
                                }}
                                className="px-4 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                            >
                                Generate Dynamic Slug
                            </button>
                        </div>
                        <p className="mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-tight">Strategy: {'{city}-{propertyType}'}</p>
                    </div>
                </div>

                <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    {saving ? 'Saving...' : 'Apply Page SEO'}
                </button>
            </div>
        );
    };

    const renderGlobal = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="p-4 bg-slate-100 rounded-2xl space-y-2">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Fallbacks</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">Used when specific page SEO is missing or auto-generate is off.</p>
            </div>
            <div>
                <label className={labelClass}>Default Site Title</label>
                <input
                    className={fieldClass}
                    value={seo.global?.title || ''}
                    onChange={e => setSeo({ ...seo, global: { ...seo.global, title: e.target.value } })}
                    placeholder="Prestige Realty | Exclusive MLS Access"
                />
            </div>
            <div>
                <label className={labelClass}>Default Site Description</label>
                <textarea
                    rows={4}
                    className={fieldClass}
                    value={seo.global?.description || ''}
                    onChange={e => setSeo({ ...seo, global: { ...seo.global, description: e.target.value } })}
                    placeholder="Main site bio..."
                />
            </div>
            <div>
                <label className={labelClass}>Default OG Image URL</label>
                <div className="flex gap-2">
                    <input
                        className={fieldClass}
                        value={seo.global?.ogImage || ''}
                        onChange={e => setSeo({ ...seo, global: { ...seo.global, ogImage: e.target.value } })}
                        placeholder="https://..."
                    />
                    <button className="h-11 w-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                </div>
            </div>
            <button
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
            >
                {saving ? 'Processing...' : 'Sync Global SEO'}
            </button>
        </div>
    );

    const renderDynamic = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">MLS Filter Mapping</h5>
                </div>
                <div className="space-y-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div>
                        <label className={labelClass}>Title Template</label>
                        <input
                            className={fieldClass}
                            value={seo.dynamic?.listing?.titleTemplate || ''}
                            onChange={e => setSeo({ ...seo, dynamic: { ...seo.dynamic, listing: { ...seo.dynamic.listing, titleTemplate: e.target.value } } })}
                        />
                        <p className="mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-tight">Available: {'{propertyType}, {city}, {status}, {siteName}'}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
                {saving ? 'Updating Engine...' : 'Save Logic Templates'}
            </button>
        </div>
    );

    const renderPages = () => (
        <div className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-300">
            {Object.values(store.pages).map(p => (
                <div
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className="group bg-white border border-slate-200 p-4 rounded-3xl hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{p.name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-widest">{p.slug}</p>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <div className="p-6 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">SEO Engine</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dynamic Listing Optimization</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => { setSubTab('global'); setSelectedPageId(null); }} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${subTab === 'global' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Global</button>
                    <button onClick={() => { setSubTab('pages'); }} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${subTab === 'pages' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Pages</button>
                    <button onClick={() => { setSubTab('automation'); setSelectedPageId(null); }} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${subTab === 'automation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Automation</button>
                    <button onClick={() => { setSubTab('dynamic'); setSelectedPageId(null); }} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${subTab === 'dynamic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Logic</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {selectedPageId ? renderPageEditor(selectedPageId) : (
                    <>
                        {subTab === 'global' && renderGlobal()}
                        {subTab === 'pages' && renderPages()}
                        {subTab === 'automation' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-xl">
                                    <h4 className="text-sm font-black uppercase tracking-widest">SEO Automation Clusters</h4>
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                                        Generate high-ranking landing pages for specific locations and property types automatically.
                                    </p>
                                    <div className="pt-4 grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                const cities = ['Toronto', 'Vancouver', 'Richmond Hill', 'Oakville'];
                                                const types = ['Condo', 'Detached', 'Townhouse'];

                                                cities.forEach(city => {
                                                    types.forEach(type => {
                                                        const p = seoEngine.generateSeoPage(city, type);
                                                        store.addPage({
                                                            id: `auto-${city}-${type}-${Date.now()}`,
                                                            isPublished: true,
                                                            ...p
                                                        } as any);
                                                    });
                                                });
                                                useNotificationStore.getState().addNotification({
                                                    type: 'success',
                                                    title: 'Clusters Generated',
                                                    message: '12 search-optimized pages have been added to your site.'
                                                });
                                            }}
                                            className="p-4 bg-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all border border-indigo-600"
                                        >
                                            Generate 12 Clusters
                                        </button>
                                        <button className="p-4 bg-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700">
                                            Configure Template
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Automated Pages</p>
                                    {Object.values(store.pages).filter(p => p.id.startsWith('auto-')).map(p => (
                                        <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                                            <span className="text-[11px] font-black text-slate-900 truncate pr-4">{p.name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                <button
                                                    onClick={() => store.removePage(p.id)}
                                                    className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                                >
                                                    Disable
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {Object.values(store.pages).filter(p => p.id.startsWith('auto-')).length === 0 && (
                                        <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No automated clusters found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {subTab === 'dynamic' && renderDynamic()}
                    </>
                )}
            </div>
        </div>
    );
};

// --- AGENT PAGES PANEL ---
const AgentPagesPanel = ({
    agentId,
    websiteId,
    templateId: _templateId,
    currentPageId,
    onSelectPage,
}: {
    agentId: string;
    websiteId: string;
    templateId: string;
    currentPageId: string;
    onSelectPage: (id: string) => void;
}) => {
    const store = useBuilderStore();
    const [pages, setPages] = React.useState<AgentPage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isCreating, setIsCreating] = React.useState(false);
    const [newPageData, setNewPageData] = React.useState({ title: '', slug: '', isPublic: true });
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState('');

    const fetchPages = async () => {
        try {
            const data = await websiteInstanceService.getAgentPages(agentId, websiteId);
            setPages(data);
            // Sync into Zustand store
            const builderPages: BuilderPage[] = data.map(p => ({
                id: p.id,
                name: p.title,
                slug: p.slug,
                isPublic: p.isPublic,
                pageType: p.pageType,
                sections: (p.layoutConfig?.sections || []).map((s: any) => ({
                    id: s.id || crypto.randomUUID(),
                    type: s.type || 'unknown',
                    config: s.config || {},
                })),
            }));
            store.setPages(builderPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchPages();
    }, [agentId, websiteId]);

    const handleCreate = async () => {
        if (!newPageData.title || !newPageData.slug) return;
        try {
            const slug = newPageData.slug.startsWith('/') ? newPageData.slug : `/${newPageData.slug}`;
            const newPage = await websiteInstanceService.createAgentPage(agentId, {
                websiteId,
                title: newPageData.title,
                slug,
                layoutConfig: { sections: [] },
                isPublished: true,
                isPublic: newPageData.isPublic,
            });
            setPages([...pages, newPage]);
            store.addPage({
                id: newPage.id,
                name: newPage.title,
                slug: newPage.slug,
                isPublic: newPage.isPublic,
                pageType: 'static',
                sections: [],
            });
            setIsCreating(false);
            setNewPageData({ title: '', slug: '', isPublic: true });
            onSelectPage(newPage.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRename = async (id: string) => {
        if (!editTitle) return setEditingId(null);
        try {
            setPages(pages.map(p => p.id === id ? { ...p, title: editTitle } : p));
            store.updatePage(id, { name: editTitle });
            setEditingId(null);
            await websiteInstanceService.updateAgentPage(agentId, id, { title: editTitle });
        } catch (err) {
            console.error(err);
            fetchPages();
        }
    };

    const handleTogglePublic = async (e: React.MouseEvent, id: string, current: boolean | undefined) => {
        e.stopPropagation();
        try {
            // Normalize: if current is undefined, treat as true. So toggle to false.
            const isNowPublic = current === false ? true : false;
            const next = pages.map(p => p.id === id ? { ...p, isPublic: isNowPublic } : p);
            setPages(next);
            store.updatePage(id, { isPublic: isNowPublic });
            await websiteInstanceService.updateAgentPage(agentId, id, { isPublic: isNowPublic });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const page = pages.find(p => p.id === id);
        if (!page || page.slug === '/') return; // protect home
        if (!confirm(`Delete "${page.title}"?`)) return;
        try {
            await websiteInstanceService.deleteAgentPage(agentId, id);
            setPages(pages.filter(p => p.id !== id));
            store.removePage(id);
            if (id === currentPageId) {
                const home = pages.find(p => p.slug === '/') || pages[0];
                if (home && home.id !== id) onSelectPage(home.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Pages...</div>;

    const publicPages = pages.filter(p => p.isPublic !== false);
    const internalPages = pages.filter(p => p.isPublic === false);

    const renderPageItem = (page: AgentPage) => (
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
                    <p className="text-[9px] font-bold text-slate-400 font-mono">{page.slug}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={e => handleTogglePublic(e, page.id, page.isPublic)}
                    className={`p-2 transition-all ${page.isPublic ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-indigo-600'}`}
                    title={page.isPublic ? 'Visible in Nav' : 'Hidden from Nav'}
                >
                    {page.isPublic ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                </button>
                <button
                    onClick={e => { e.stopPropagation(); setEditingId(page.id); setEditTitle(page.title); }}
                    className="p-2 text-slate-300 hover:text-indigo-600 transition-all"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                {page.slug !== '/' && (
                    <button onClick={e => handleDelete(e, page.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-5 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Agent Pages</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Custom pages for your website</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-200"
                    title="Add New Page"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="p-5 bg-slate-900 rounded-[2rem] space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Page Title</p>
                        <input
                            autoFocus
                            placeholder="e.g. My Listings"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                            value={newPageData.title}
                            onChange={e => setNewPageData({ ...newPageData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Route Slug</p>
                        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                            <span className="text-xs font-black text-slate-500">/</span>
                            <input
                                placeholder="slug"
                                className="flex-1 bg-transparent text-white text-xs font-bold outline-none placeholder:text-slate-600"
                                value={newPageData.slug}
                                onChange={e => setNewPageData({ ...newPageData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-1 py-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-tight">Show in Navigation</span>
                            <span className="text-[9px] font-medium text-slate-500 italic">Adds link to site header</span>
                        </div>
                        <button
                            onClick={() => setNewPageData({ ...newPageData, isPublic: !newPageData.isPublic })}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${newPageData.isPublic ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${newPageData.isPublic ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={handleCreate} className="flex-1 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Create Page</button>
                        <button onClick={() => setIsCreating(false)} className="px-5 py-3 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            {/* Agent-advanced badge */}
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.18em]">Advanced Mode — Agent Website</p>
            </div>

            {/* Page lists */}
            <div className="space-y-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-1 w-3 bg-indigo-500 rounded-full" />
                        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Navigation Pages</h5>
                    </div>
                    <div className="space-y-1">{publicPages.map(renderPageItem)}</div>
                </div>
                {internalPages.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <div className="h-1 w-3 bg-amber-500 rounded-full" />
                            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Internal Pages</h5>
                        </div>
                        <div className="space-y-1">{internalPages.map(renderPageItem)}</div>
                    </div>
                )}
            </div>

            {/* Note about template base */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
                    <span className="text-slate-700 font-black">Template base is preserved.</span>{' '}
                    Custom pages are layered on top of the assigned template. The core template structure is never modified globally.
                </p>
            </div>
        </div>
    );
};

// --- PAGES PANEL ---
const PagesPanel = ({ websiteId, currentPageId, onSelectPage }: { websiteId: string; currentPageId: string; onSelectPage: (id: string) => void }) => {
    const store = useBuilderStore();
    const website = store.website; // Access website from store
    const [pages, setPages] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isCreating, setIsCreating] = React.useState(false);
    const [newPageData, setNewPageData] = React.useState({ title: '', slug: '', isPublic: false });
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState('');

    const handleRename = async (id: string) => {
        if (!editTitle) return setEditingId(null);
        try {
            // Optimistic update
            setPages(pages.map(p => p.id === id ? { ...p, title: editTitle } : p));
            store.updatePage(id, { name: editTitle });
            setEditingId(null);
            // Persistent update
            const orgId = website?.organizationId || 'org-1';
            await orgWebsiteService.updatePage(orgId, id, { title: editTitle });
        } catch (err) {
            console.error(err);
            fetchPages();
        }
    };

    const handleTogglePublic = async (e: React.MouseEvent, id: string, current: boolean | undefined) => {
        e.stopPropagation();
        try {
            // Normalize: if current is undefined, treat as true. So toggle to false.
            const isNowPublic = current === false ? true : false;
            const next = pages.map(p => p.id === id ? { ...p, isPublic: isNowPublic } : p);
            setPages(next);
            store.updatePage(id, { isPublic: isNowPublic });
            const orgId = website?.organizationId || 'org-1';
            await orgWebsiteService.updatePage(orgId, id, { isPublic: isNowPublic });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPages = async () => {
        try {
            const orgId = website?.organizationId || 'org-1';
            const data = await orgWebsiteService.getPages(orgId, websiteId);
            setPages(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (websiteId) fetchPages();
    }, [websiteId, website?.organizationId]);

    const handleCreate = async () => {
        if (!newPageData.title || !newPageData.slug) return;
        try {
            const orgId = website?.organizationId || 'org-1';
            const newPage = await orgWebsiteService.createPage(orgId, {
                websiteId,
                title: newPageData.title,
                slug: newPageData.slug.startsWith('/') ? newPageData.slug : `/${newPageData.slug}`,
                layoutConfig: {
                    sections: []
                },
                isPublished: true,
                isPublic: newPageData.isPublic
            });
            setPages([...pages, newPage]);
            store.addPage({ id: newPage.id, name: newPage.title, slug: newPage.slug || `/${newPageData.slug}`, isPublic: newPage.isPublic, pageType: 'static', sections: [] });
            setIsCreating(false);
            setNewPageData({ title: '', slug: '', isPublic: false });
            onSelectPage(newPage.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this page?')) return;
        try {
            const orgId = website?.organizationId || 'org-1';
            await orgWebsiteService.deletePage(orgId, id);
            setPages(pages.filter(p => p.id !== id));
            store.removePage(id);
            if (id === currentPageId) {
                const home = pages.find(p => p.slug === '/') || pages[0];
                if (home && home.id !== id) onSelectPage(home.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Pages...</div>;

    const publicPages = pages.filter(p => p.isPublic !== false);
    const internalPages = pages.filter(p => p.isPublic === false);

    const renderPageItem = (page: any) => (
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
                    <p className="text-[9px] font-bold text-slate-400 font-mono">{page.slug}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                    onClick={(e) => handleTogglePublic(e, page.id, page.isPublic)}
                    className={`p-2 transition-all ${page.isPublic ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-indigo-600'}`}
                    title={page.isPublic ? 'Visible in Nav' : 'Hidden from Nav'}
                >
                    {page.isPublic ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                </button>
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
    );

    return (
        <div className="p-5 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Website Structure</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Public & Internal Pages</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-200"
                    title="Create New Page"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            {isCreating && (
                <div className="p-5 bg-slate-900 rounded-[2rem] space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Page Title</p>
                        <input
                            autoFocus
                            placeholder="e.g. Dream Homes"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                            value={newPageData.title}
                            onChange={e => setNewPageData({ ...newPageData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Route Slug</p>
                        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                            <span className="text-xs font-black text-slate-500">/</span>
                            <input
                                placeholder="slug"
                                className="flex-1 bg-transparent text-white text-xs font-bold outline-none placeholder:text-slate-600"
                                value={newPageData.slug}
                                onChange={e => setNewPageData({ ...newPageData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1 py-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-tight">Show in Navigation</span>
                            <span className="text-[9px] font-medium text-slate-500 italic">Adds link to site header</span>
                        </div>
                        <button
                            onClick={() => setNewPageData({ ...newPageData, isPublic: !newPageData.isPublic })}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${newPageData.isPublic ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${newPageData.isPublic ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleCreate} className="flex-1 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">Create Page</button>
                        <button onClick={() => setIsCreating(false)} className="px-5 py-3 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {/* ── Public Pages ── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-1 w-3 bg-indigo-500 rounded-full" />
                        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Site Navigation Pages</h5>
                    </div>
                    <div className="space-y-1">
                        {publicPages.map(renderPageItem)}
                    </div>
                </div>

                {/* ── Internal Pages ── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-1 w-3 bg-amber-500 rounded-full" />
                        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Internal & Utility Pages</h5>
                    </div>
                    <div className="space-y-1">
                        {internalPages.length > 0 ? (
                            internalPages.map(renderPageItem)
                        ) : (
                            <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                                <p className="text-[10px] font-medium text-slate-300 italic">No internal pages found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NAVIGATION PANEL ---
const NavigationPanel = ({ websiteId, agentId, onUpdate }: { websiteId: string; agentId?: string | null; onUpdate: () => void }) => {
    const store = useBuilderStore();
    const website = store.website; // Access website from store
    const [nav, setNav] = React.useState<{ label: string; slug: string; children?: { label: string; slug: string }[] }[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [expandedIdx, setExpandedIdx] = React.useState<number | null>(null);

    const fetchData = async () => {
        let websiteData: any = null;
        if (agentId) {
            websiteData = await websiteInstanceService.getWebsiteByAgentId(agentId);
        } else {
            const orgId = website?.organizationId || 'org-1';
            websiteData = await orgWebsiteService.getOrgWebsite(orgId, websiteId);
        }

        // ─── Header Navigation Logic ─────────────────────────────
        // Filter out items from the navigation if their target pages are hidden (isPublic === false)
        const rawNav = store.agentNavigation.length > 0 ? store.agentNavigation : (websiteData?.navigation || []);
        const internalPageSlugs = new Set(
            Object.values(store.pages)
                .filter(p => p.isPublic === false)
                .map(p => p.slug)
        );

        const effectiveNavigation = rawNav
            .filter((item: any) => !internalPageSlugs.has(item.slug))
            .map((n: any) => ({ ...n, children: n.children || [] }));

        if (effectiveNavigation.length > 0) {
            setNav(effectiveNavigation);
        } else if (agentId) {
            // Default agent nav — derive from public pages in store
            const publicPages = Object.values(store.pages).filter(p => p.isPublic && p.pageType === 'static');
            if (publicPages.length > 0) {
                setNav(publicPages.map(p => ({ label: p.name, slug: p.slug })));
            } else {
                setNav([
                    { label: 'Home', slug: '/' },
                    { label: 'About', slug: '/about' },
                    { label: 'Contact', slug: '/contact' }
                ]);
            }
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, [websiteId, agentId, store.agentNavigation, store.pages, website?.organizationId]); // Add store dependencies

    const handleSave = async () => {
        // Strip empty children arrays before saving for cleanliness
        const cleaned = nav.map(item => ({
            ...item,
            children: item.children && item.children.length > 0 ? item.children : undefined,
        }));
        // Instantly sync store so preview header updates in real-time
        if (agentId) {
            store.setAgentNavigation(cleaned);
            await websiteInstanceService.updateAgentNavigation(websiteId, cleaned);
        } else {
            const orgId = website?.organizationId || 'org-1';
            await orgWebsiteService.updateNavigation(orgId, websiteId, cleaned);
        }
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
        <div className="p-5 space-y-6 overflow-y-auto h-full custom-scrollbar">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                        {agentId ? 'Agent Navigation' : 'Site Navigation'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                        {agentId
                            ? 'Agent-specific menu — does not affect org website'
                            : 'Configure header menu & submenus'}
                    </p>
                </div>
                <button onClick={addLink} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all" title="Add Menu Item">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            {agentId && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.18em]">Isolated — Agent Website Only</p>
                </div>
            )}

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
    const store = useBuilderStore();
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
                {selected.name === 'HeroSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'default'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <optgroup label="Original Designs">
                                    <option value="default">Dynamic Gradient</option>
                                    <option value="luxury">Luxury Black</option>
                                    <option value="agent">Agent Profile</option>
                                    <option value="corporate">Corporate Stats</option>
                                    <option value="minimal">Minimal Clean</option>
                                </optgroup>
                                <optgroup label="WP Residence Inspired">
                                    <option value="agent-spotlight">Agent Spotlight + Form</option>
                                    <option value="property-search">Property Search</option>
                                    <option value="sidebar-profile">Sidebar Profile</option>
                                    <option value="split-agent">Split Agent</option>
                                    <option value="nature-immersive">Nature Immersive</option>
                                </optgroup>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headline</span>
                            <input
                                type="text"
                                value={selected.props.content?.headline || ''}
                                onChange={e => updateProp('content.headline', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subheadline</span>
                            <textarea
                                rows={3}
                                value={selected.props.content?.subheadline || ''}
                                onChange={e => updateProp('content.subheadline', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Name</span>
                            <input
                                type="text"
                                value={selected.props.agentName || ''}
                                onChange={e => updateProp('agentName', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                placeholder="e.g. Sam Davis"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Title / Label</span>
                            <input
                                type="text"
                                value={selected.props.agentTitle || ''}
                                onChange={e => updateProp('agentTitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                placeholder="e.g. Senior Real Estate Agent"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Image URL</span>
                            <input
                                type="text"
                                value={selected.props.agentImage || ''}
                                onChange={e => updateProp('agentImage', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                placeholder="https://example.com/agent-photo.jpg"
                            />
                            {selected.props.agentImage && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 h-24 w-24 flex-shrink-0">
                                    <img src={selected.props.agentImage} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Text</span>
                            <input
                                type="text"
                                value={selected.props.content?.buttonText || ''}
                                onChange={e => updateProp('content.buttonText', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Background Image URL</span>
                            <input
                                type="text"
                                value={selected.props.bgImage || selected.props.content?.bgImage || ''}
                                onChange={e => updateProp('bgImage', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                placeholder="https://images.unsplash.com/..."
                            />
                        </label>
                    </>
                )}


                {selected.name === 'TextSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'standard'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="standard">Standard Body</option>
                                <option value="lead">Modern Lead Title</option>
                                <option value="muted">Muted Fine-print</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</span>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateProp('align', align)}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${(selected.props.align || 'center') === align
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Text Content</span>
                            <textarea
                                rows={6}
                                value={selected.props.text || ''}
                                onChange={e => updateProp('text', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'ImageSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'default'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="default">Standard View</option>
                                <option value="boxed">Framed Box</option>
                                <option value="parallax">Deep Parallax</option>
                                <option value="rounded">Minimal Round</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URL</span>
                            <input
                                type="text"
                                value={selected.props.url || ''}
                                onChange={e => updateProp('url', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption</span>
                            <input
                                type="text"
                                value={selected.props.caption || ''}
                                onChange={e => updateProp('caption', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'ContactSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Title</span>
                            <input
                                type="text"
                                value={selected.props.content?.title || ''}
                                onChange={e => updateProp('content.title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Label</span>
                            <input
                                type="text"
                                value={selected.props.content?.buttonLabel || ''}
                                onChange={e => updateProp('content.buttonLabel', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'ListingsSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'default'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="default">Modern Grid</option>
                                <option value="luxury">Luxury Overlay</option>
                                <option value="minimal">Minimal List</option>
                                <option value="corporate">Corporate Card</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title</span>
                            <input
                                type="text"
                                value={selected.props.content?.title || ''}
                                onChange={e => updateProp('content.title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle</span>
                            <input
                                type="text"
                                value={selected.props.content?.subtitle || ''}
                                onChange={e => updateProp('content.subtitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>

                        {/* ─── Listing Source Toggle ─── */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Listing Source</span>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {[
                                    { id: 'manual', label: 'Static Content' },
                                    { id: 'shortcode', label: 'Dynamic (Shortcode)' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            updateProp('source', tab.id);
                                            if (tab.id === 'manual') updateProp('shortcodeId', undefined);
                                        }}
                                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${(selected.props.source || 'manual') === tab.id
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ─── Shortcode mode ─── */}
                        {(selected.props.source === 'shortcode') && (
                            <ShortcodeSelector
                                selectedId={selected.props.shortcodeId}
                                websiteId={store.website?.id || 'default'}
                                organizationId={store.website?.organizationId}
                                role="super_admin"
                                onSelect={(scId, sc) => {
                                    updateProp('shortcodeId', scId);
                                    updateProp('source', 'shortcode');
                                    // Extract filters to section config for programmatic SEO extraction
                                    if (sc?.filters) {
                                        updateProp('filters', sc.filters);
                                    }
                                }}
                                onClear={() => {
                                    updateProp('shortcodeId', undefined);
                                }}
                            />
                        )}

                        {/* ─── Manual filters mode (default) ─── */}
                        {(selected.props.source !== 'shortcode') && (
                            <>
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target City</span>
                                    <input
                                        type="text"
                                        value={selected.props.filters?.city || ''}
                                        onChange={e => updateProp('filters.city', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    />
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Type</span>
                                    <select
                                        value={selected.props.filters?.propertyType || ''}
                                        onChange={e => updateProp('filters.propertyType', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    >
                                        <option value="">All Types</option>
                                        <option value="Condo">Condo</option>
                                        <option value="Detached">Detached</option>
                                        <option value="Townhouse">Townhouse</option>
                                    </select>
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Status</span>
                                    <select
                                        value={selected.props.filters?.status || ''}
                                        onChange={e => updateProp('filters.status', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    >
                                        <option value="">Any Status</option>
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                        <option value="sold">Sold</option>
                                    </select>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bedrooms</span>
                                        <input
                                            type="number"
                                            placeholder="Min beds"
                                            value={selected.props.filters?.bedrooms || ''}
                                            onChange={e => updateProp('filters.bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bathrooms</span>
                                        <input
                                            type="number"
                                            placeholder="Min baths"
                                            value={selected.props.filters?.bathrooms || ''}
                                            onChange={e => updateProp('filters.bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Price</span>
                                        <input
                                            type="number"
                                            placeholder="No min"
                                            value={selected.props.filters?.minPrice || ''}
                                            onChange={e => updateProp('filters.minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Price</span>
                                        <input
                                            type="number"
                                            placeholder="No max"
                                            value={selected.props.filters?.maxPrice || ''}
                                            onChange={e => updateProp('filters.maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Limit</span>
                                        <input
                                            type="number"
                                            value={selected.props.limit || 3}
                                            onChange={e => updateProp('limit', parseInt(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort Order</span>
                                        <select
                                            value={selected.props.sort || 'latest'}
                                            onChange={e => updateProp('sort', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        >
                                            <option value="latest">Newest First</option>
                                            <option value="price-low-high">Price: Low to High</option>
                                            <option value="price-high-low">Price: High to Low</option>
                                            <option value="price_asc" className="hidden">Price: Low to High (Legacy)</option>
                                            <option value="price_desc" className="hidden">Price: High to Low (Legacy)</option>
                                        </select>
                                    </label>
                                </div>
                            </>
                        )}
                    </>
                )}

                {selected.name === 'FeaturedListingsSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'default'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="default">Modern Grid</option>
                                <option value="luxury">Luxury Overlay</option>
                                <option value="minimal">Minimal List</option>
                                <option value="corporate">Corporate Card</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section Title</span>
                            <input
                                type="text"
                                value={selected.props.content?.title || ''}
                                onChange={e => updateProp('content.title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle</span>
                            <input
                                type="text"
                                value={selected.props.content?.subtitle || ''}
                                onChange={e => updateProp('content.subtitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>

                        {/* ─── Listing Source Toggle ─── */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Listing Source</span>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {[
                                    { id: 'manual', label: 'Static Content' },
                                    { id: 'shortcode', label: 'Dynamic (Shortcode)' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            updateProp('source', tab.id);
                                            if (tab.id === 'manual') updateProp('shortcodeId', undefined);
                                        }}
                                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${(selected.props.source || 'manual') === tab.id
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ─── Shortcode mode ─── */}
                        {(selected.props.source === 'shortcode') && (
                            <ShortcodeSelector
                                selectedId={selected.props.shortcodeId}
                                websiteId={store.website?.id || 'default'}
                                organizationId={store.website?.organizationId}
                                role="super_admin"
                                onSelect={(scId, _sc) => {
                                    updateProp('shortcodeId', scId);
                                    updateProp('source', 'shortcode');
                                }}
                                onClear={() => {
                                    updateProp('shortcodeId', undefined);
                                }}
                            />
                        )}

                        {/* ─── Manual filters mode (default) ─── */}
                        {(selected.props.source !== 'shortcode') && (
                            <>
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target City</span>
                                    <input
                                        type="text"
                                        value={selected.props.filters?.city || ''}
                                        onChange={e => updateProp('filters.city', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    />
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Type</span>
                                    <select
                                        value={selected.props.filters?.propertyType || ''}
                                        onChange={e => updateProp('filters.propertyType', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    >
                                        <option value="">All Types</option>
                                        <option value="Condo">Condo</option>
                                        <option value="Detached">Detached</option>
                                        <option value="Townhouse">Townhouse</option>
                                    </select>
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Status</span>
                                    <select
                                        value={selected.props.filters?.status || ''}
                                        onChange={e => updateProp('filters.status', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    >
                                        <option value="">Any Status</option>
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                        <option value="sold">Sold</option>
                                    </select>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bedrooms</span>
                                        <input
                                            type="number"
                                            placeholder="Min beds"
                                            value={selected.props.filters?.bedrooms || ''}
                                            onChange={e => updateProp('filters.bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bathrooms</span>
                                        <input
                                            type="number"
                                            placeholder="Min baths"
                                            value={selected.props.filters?.bathrooms || ''}
                                            onChange={e => updateProp('filters.bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Price</span>
                                        <input
                                            type="number"
                                            placeholder="No min"
                                            value={selected.props.filters?.minPrice || ''}
                                            onChange={e => updateProp('filters.minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Price</span>
                                        <input
                                            type="number"
                                            placeholder="No max"
                                            value={selected.props.filters?.maxPrice || ''}
                                            onChange={e => updateProp('filters.maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Limit</span>
                                        <input
                                            type="number"
                                            value={selected.props.limit || 2}
                                            onChange={e => updateProp('limit', parseInt(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort Order</span>
                                        <select
                                            value={selected.props.sort || 'latest'}
                                            onChange={e => updateProp('sort', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                        >
                                            <option value="latest">Newest First</option>
                                            <option value="price-low-high">Price: Low to High</option>
                                            <option value="price-high-low">Price: High to Low</option>
                                            <option value="price_asc" className="hidden">Price: Low to High (Legacy)</option>
                                            <option value="price_desc" className="hidden">Price: High to Low (Legacy)</option>
                                        </select>
                                    </label>
                                </div>
                            </>
                        )}
                    </>
                )}

                {selected.name === 'AgentProfilesSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'grid'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="grid">Classic Grid</option>
                                <option value="showcase">Elite Showcase</option>
                                <option value="mini">Modern Mini Circles</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headline</span>
                            <input
                                type="text"
                                value={selected.props.content?.title || ''}
                                onChange={e => updateProp('content.title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subheadline</span>
                            <textarea
                                value={selected.props.content?.subtitle || ''}
                                onChange={e => updateProp('content.subtitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none h-24"
                            />
                        </label>
                    </>
                )}

                {/* ─── NEW COMPONENT SETTINGS ─── */}

                {selected.name === 'HeadingSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'default'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="default">Standard Bold</option>
                                <option value="underline">Modern Underline</option>
                                <option value="accent">Primary Accent</option>
                                <option value="luxury">Luxury Statement</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</span>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateProp('align', align)}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${(selected.props.align || 'center') === align
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </label>
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </label>
                    </>
                )}

                {selected.name === 'SpacerSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spacing Preset</span>
                            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                                {[
                                    { id: 'small', label: 'Compact' },
                                    { id: 'medium', label: 'Standard' },
                                    { id: 'large', label: 'Grand' }
                                ].map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => updateProp('variant', preset.id)}
                                        className={`py-2 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all ${(selected.props.variant || 'medium') === preset.id
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </label>
                        <label className="block space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Height</span>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{selected.props.height || (selected.props.variant === 'small' ? 32 : selected.props.variant === 'large' ? 160 : 80)}px</span>
                            </div>
                            <input
                                type="range"
                                min={8}
                                max={320}
                                step={8}
                                value={selected.props.height || (selected.props.variant === 'small' ? 32 : selected.props.variant === 'large' ? 160 : 80)}
                                onChange={e => updateProp('height', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'DividerSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'solid'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="solid">Solid Line</option>
                                <option value="gradient">Gradient Fade</option>
                                <option value="dotted">Modern Dots</option>
                                <option value="accent">Indigo Accent Bar</option>
                                <option value="glass">Glass Translucent</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Color</span>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={selected.props.color || '#e2e8f0'}
                                    onChange={e => updateProp('color', e.target.value)}
                                    className="h-10 w-20 rounded-lg border border-slate-200 bg-white p-1 cursor-pointer"
                                />
                                <span className="text-xs font-mono text-slate-500 uppercase">{selected.props.color || '#e2e8f0'}</span>
                            </div>
                        </label>
                    </>
                )}
                {selected.name === 'ButtonSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'primary'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="primary">Primary Solid</option>
                                <option value="secondary">Sleek Luxury</option>
                                <option value="outline">Classic Outline</option>
                                <option value="ghost">Minimal Ghost</option>
                                <option value="glow">Active Glow</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment</span>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateProp('align', align)}
                                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${(selected.props.align || 'center') === align
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </label>
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Style</span>
                            <select
                                value={selected.props.variant || 'primary'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </label>
                    </>
                )}

                {selected.name === 'VideoSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'minimal'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="minimal">Minimalist Centered</option>
                                <option value="cinema">Full Cinema Mode</option>
                                <option value="story">Split Story Layout</option>
                                <option value="floating">Modern Overlap</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Title</span>
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video URL</span>
                            <input
                                type="text"
                                value={selected.props.url || ''}
                                onChange={e => updateProp('url', e.target.value)}
                                placeholder="YouTube or Vimeo link"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bottom Caption</span>
                            <input
                                type="text"
                                value={selected.props.caption || ''}
                                onChange={e => updateProp('caption', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <div className="h-px bg-slate-100 my-4" />
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Action Button Text</span>
                            <input
                                type="text"
                                value={selected.props.buttonLabel || ''}
                                onChange={e => updateProp('buttonLabel', e.target.value)}
                                placeholder="e.g. Watch Full Tour"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Link</span>
                            <input
                                type="text"
                                value={selected.props.buttonHref || ''}
                                onChange={e => updateProp('buttonHref', e.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Color</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={selected.props.buttonColor || '#4f46e5'}
                                    onChange={e => updateProp('buttonColor', e.target.value)}
                                    className="h-10 w-10 rounded-lg border-none cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selected.props.buttonColor || '#4f46e5'}
                                    onChange={e => updateProp('buttonColor', e.target.value)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </label>
                    </>
                )}

                {selected.name === 'TestimonialsSection' && (
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

                {selected.name === 'StatsSection' && (
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

                {selected.name === 'FAQSection' && (
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

                {selected.name === 'NewsletterSection' && (
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Text</span>
                            <input
                                type="text"
                                value={selected.props.buttonText || ''}
                                onChange={e => updateProp('buttonText', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
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

                {selected.name === 'GallerySection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'grid'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="grid">Modern Grid</option>
                                <option value="masonry">Mosaic Masonry</option>
                                <option value="minimal">Elegant Minimalist</option>
                            </select>
                        </label>
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value={2}>2 Columns</option>
                                <option value={3}>3 Columns</option>
                                <option value={4}>4 Columns</option>
                            </select>
                        </label>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gallery Images</span>
                                <button
                                    onClick={() => {
                                        const current = selected.props.images || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'];
                                        updateProp('images', [...current, 'https://images.unsplash.com/photo-1628744276229-c83440abb94e?auto=format&fit=crop&q=80&w=800']);
                                    }}
                                    className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                                    title="Add new image"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(selected.props.images || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600']).map((img: string, idx: number) => (
                                    <div key={idx} className="group relative bg-slate-50 rounded-xl p-3 border border-slate-200">
                                        <div className="flex gap-3">
                                            <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                                                <img src={img} className="h-full w-full object-cover" alt="" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <input
                                                    type="text"
                                                    value={img}
                                                    onChange={(e) => {
                                                        const current = [...(selected.props.images || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'])];
                                                        current[idx] = e.target.value;
                                                        updateProp('images', current);
                                                    }}
                                                    className="w-full bg-transparent text-[10px] font-medium text-slate-600 outline-none focus:text-indigo-600"
                                                    placeholder="Unsplash URL..."
                                                />
                                                <button
                                                    onClick={() => {
                                                        const current = (selected.props.images || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600']).filter((_: any, i: number) => i !== idx);
                                                        updateProp('images', current);
                                                    }}
                                                    className="text-[9px] font-black text-rose-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {selected.name === 'CommunitiesSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'grid'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="grid">Visual Grid</option>
                                <option value="list">Modern List</option>
                                <option value="featured">Luxury Featured</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headline</span>
                            <input
                                type="text"
                                value={selected.props.title || ''}
                                onChange={e => updateProp('title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subheadline</span>
                            <textarea
                                value={selected.props.subtitle || ''}
                                onChange={e => updateProp('subtitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                rows={3}
                            />
                        </label>
                    </>
                )}
                {selected.name === 'ListingDetailSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'default'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="default">Modern Default</option>
                                <option value="luxury">Luxury Estate</option>
                                <option value="minimal">Minimalist</option>
                                <option value="corporate">Corporate</option>
                                <option value="agent">Agent Portfolio</option>
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MLS Number</span>
                            <input
                                type="text"
                                value={selected.props.mlsNumber || ''}
                                onChange={e => updateProp('mlsNumber', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                placeholder="e.g. C8001234"
                            />
                        </label>
                    </>
                )}

                {selected.name === 'AgentDetailSection' && (
                    <div className="space-y-6">
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Link (Database ID)</span>
                            <input
                                type="text"
                                value={selected.props.agentId || ''}
                                onChange={e => updateProp('agentId', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                placeholder="e.g. agent-1"
                            />
                        </label>

                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 italic text-center">Manual Overrides</p>

                            <label className="block space-y-2 mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</span>
                                <input
                                    type="text"
                                    value={selected.props.name || ''}
                                    onChange={e => updateProp('name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                />
                            </label>

                            <label className="block space-y-2 mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title</span>
                                <input
                                    type="text"
                                    value={selected.props.title || ''}
                                    onChange={e => updateProp('title', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                />
                            </label>

                            <label className="block space-y-2 mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biography</span>
                                <textarea
                                    value={selected.props.bio || ''}
                                    onChange={e => updateProp('bio', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    rows={4}
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                                    <input
                                        type="text"
                                        value={selected.props.phone || ''}
                                        onChange={e => updateProp('phone', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    />
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                    <input
                                        type="text"
                                        value={selected.props.email || ''}
                                        onChange={e => updateProp('email', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    />
                                </label>
                            </div>

                            <label className="block space-y-2 mt-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Photo URL</span>
                                <input
                                    type="text"
                                    value={selected.props.profilePhoto || ''}
                                    onChange={e => updateProp('profilePhoto', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </label>
                        </div>
                    </div>
                )}

                {selected.name === 'MapSection' && (
                    <>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Style</span>
                            <select
                                value={selected.props.variant || 'classic'}
                                onChange={e => updateProp('variant', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            >
                                <option value="classic">Classic View</option>
                                <option value="minimal">Modern Dark</option>
                                <option value="split">Contact Info Split</option>
                            </select>
                        </label>
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
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle</span>
                            <input
                                type="text"
                                value={selected.props.subtitle || ''}
                                onChange={e => updateProp('subtitle', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white transition-all outline-none"
                            />
                        </label>
                    </>
                )}

                {/* GENERIC SECTION SEO OVERRIDE */}
                <div className="pt-8 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Section SEO Overrides</h4>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed font-italic">Force specific metadata when this section is dominant.</p>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Title Override</span>
                            <input
                                type="text"
                                value={selected.props.seoConfig?.title || ''}
                                onChange={e => updateProp('seoConfig.title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                placeholder="Block-specific title"
                            />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description Override</span>
                            <textarea
                                rows={2}
                                value={selected.props.seoConfig?.description || ''}
                                onChange={e => updateProp('seoConfig.description', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white transition-all outline-none"
                                placeholder="Localized description..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- TOPBAR ---
const Topbar = ({ onSave, agentId, builderMode, canPreview, isPreviewMode, onTogglePreview, userRole }: {
    onSave: (data: string) => void;
    agentId: string;
    builderMode: string;
    canPreview: boolean;
    isPreviewMode: boolean;
    onTogglePreview: (open: boolean) => void;
    userRole?: string;
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const websiteId = searchParams.get('websiteId');
    const { query, actions } = useEditor((state) => ({ enabled: state.options.enabled }));
    const [saving, setSaving] = React.useState(false);
    const [saved, setSaved] = React.useState(false);

    const handleSave = async () => {
        setSaving(true);
        const json = query.serialize();
        try {
            await onSave(json);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
            {/* LEFT: Brand + Back */}
            <div className="flex items-center gap-3 w-72">
                {userRole === 'superAdmin' ? (
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-all font-bold text-[11px] uppercase tracking-wider group border border-slate-200"
                    >
                        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </button>
                ) : (
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all group"
                        title="Exit Builder"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                )}
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200">W</div>
                <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">Website Builder</p>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                        {agentId ? (builderMode === 'agent-advanced' ? `Advanced · ${agentId}` : `Agent · ${agentId}`) : (websiteId?.slice(0, 12) || 'Organization')}
                    </p>
                </div>
            </div>

            {/* CENTER: Undo/Redo + Preview Toggle */}
            <div className="flex items-center gap-1.5">
                {!isPreviewMode && (
                    <>
                        <button
                            onClick={() => actions.history.undo()}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                            title="Undo"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                        </button>
                        <button
                            onClick={() => actions.history.redo()}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                            title="Redo"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-8l-6 6m6-6l-6-6" /></svg>
                        </button>
                        <div className="w-px h-5 bg-slate-200 mx-1" />
                    </>
                )}

                {/* Preview toggle pill — only visible after first change */}
                {canPreview && (
                    <button
                        onClick={() => onTogglePreview(!isPreviewMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${isPreviewMode
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {isPreviewMode ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                Exit Preview
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Preview
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* RIGHT: Save / Publish */}
            <div className="flex items-center gap-3 w-64 justify-end">
                {!isPreviewMode && (
                    <>
                        {saved && (
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                Saved!
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-indigo-200 disabled:opacity-50 group"
                        >
                            {saving ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ) : (
                                <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            )}
                            {saving ? 'Saving…' : 'Publish'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// --- INITIALIZER / LOADER ---
// TEMPLATE_CONTENT_DEFAULTS removed: Templates now define their own structure/sections via templateRegistry.


// (Loader is defined below)


const Loader = ({ agentId, websiteId, pageId, templateId, agentAdvanced }: { agentId?: string | null; websiteId?: string | null; pageId?: string | null; templateId: string; agentAdvanced?: boolean }) => {
    const { actions, query } = useEditor((state) => ({ enabled: state.options.enabled }));
    const [loading, setLoading] = React.useState(true);
    const store = useBuilderStore();
    // Track the previous page so we can save its snapshot before loading the new one
    const prevPageRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        setLoading(true);
        let cancelled = false;

        const initBuilder = async () => {
            const effectivePageId = pageId || 'home';

            // ── Save snapshot of the page we're leaving ──────────
            const prevPage = prevPageRef.current;
            if (prevPage && prevPage !== effectivePageId) {
                try {
                    const snapshot = query.serialize();
                    store.savePageSnapshot(prevPage, snapshot);
                } catch { /* serialisation can fail if editor is empty */ }
            }
            prevPageRef.current = effectivePageId;

            // ── Check for a cached snapshot in the store ─────────
            const cached = store.pageSnapshots[effectivePageId];
            if (cached) {
                try {
                    if (!cancelled) actions.deserialize(cached);
                    if (!cancelled) setLoading(false);
                    return;
                } catch { /* fall through to normal loading */ }
            }
            let sectionsData: any[] = [];
            let website: any = null;
            let targetOrgId = 'org-1'; // Default orgId
            let fetchedSlug: string | null = null;

            try {
                // 1) Load website data
                if (websiteId) {
                    const orgWebsite = await orgWebsiteService.getOrgWebsite(targetOrgId, websiteId);
                    if (orgWebsite) {
                        website = orgWebsite;
                        targetOrgId = orgWebsite.organizationId || targetOrgId;
                    }
                } else if (agentId) {
                    website = await websiteInstanceService.getWebsiteByAgentId(agentId);
                    if (website) {
                        targetOrgId = website.organizationId || targetOrgId;
                    }
                }

                // 2) Load sections for Agent or Org Page
                if (agentId) {
                    if (agentAdvanced && pageId) {
                        try {
                            const agentPage = await websiteInstanceService.getAgentPageById(agentId, pageId);
                            if (agentPage) fetchedSlug = agentPage.slug;

                            // 1a) Target page has its own custom Craft.js layout? Use it!
                            if (agentPage?.customLayoutJson) {
                                if (!cancelled) {
                                    actions.deserialize(agentPage.customLayoutJson);
                                    store.savePageSnapshot(effectivePageId, agentPage.customLayoutJson);
                                }
                                return;
                            }
                            // 1b) Fallback for 'Home': if the new per-page record is empty, check legacy site-wide layout
                            if (agentPage?.slug === '/' && website?.layoutConfig?.customLayoutJson) {
                                if (!cancelled) {
                                    actions.deserialize(website.layoutConfig.customLayoutJson);
                                    store.savePageSnapshot(effectivePageId, website.layoutConfig.customLayoutJson);
                                }
                                return;
                            }
                        } catch { }
                    } else if (website?.layoutConfig?.customLayoutJson) {
                        // legacy agent mode: load website instance layout
                        if (!cancelled) {
                            actions.deserialize(website.layoutConfig.customLayoutJson);
                            store.savePageSnapshot(effectivePageId, website.layoutConfig.customLayoutJson);
                        }
                        return;
                    }
                } else if (websiteId && pageId) {
                    try {
                        const page = await orgWebsiteService.getPageById(targetOrgId, websiteId, pageId);
                        if (page) fetchedSlug = page.slug;

                        if (page?.customLayoutJson) {
                            if (!cancelled) {
                                actions.deserialize(page.customLayoutJson);
                                store.savePageSnapshot(effectivePageId, page.customLayoutJson);
                            }
                            return;
                        }
                        // Fallback to sections list if no Craft JSON
                        if (page?.layoutConfig?.sections) {
                            sectionsData = page.layoutConfig.sections.map(s => ({
                                id: s.id,
                                type: s.type,
                                config: (s as any).config
                            }));
                        }
                    } catch { }
                }

                // 3) No custom layout saved yet → build sections from template
                if (sectionsData.length === 0) {
                    const templateMod = templateRegistry[templateId as TemplateName];
                    if (templateMod?.structure) {
                        // Intelligent mapping: use the slug to find the matching template key
                        let structureKey = 'homepage';
                        const currentPage = store.pages[pageId || ''];
                        const slug = fetchedSlug || currentPage?.slug || (pageId === 'home' || !pageId ? '/' : '');

                        if (slug === '/' || pageId === 'home' || slug === 'home') structureKey = 'homepage';
                        else if (slug.includes('about')) structureKey = 'about';
                        else if (slug.includes('listings') || slug.includes('properties')) structureKey = 'listings';
                        else if (slug.includes('contact')) structureKey = 'contact';
                        else if (slug.includes('agent')) structureKey = 'agent';

                        const defaultStructure = templateMod.structure[structureKey] || templateMod.structure.homepage;

                        if (defaultStructure) {
                            sectionsData = defaultStructure.map((s: any) => ({
                                type: s.type,
                                config: s.config,
                                variant: (s as any).variant
                            }));
                        }
                    }

                    // Fallbacks for Legacy/Static
                    if (sectionsData.length === 0 && website?.layoutConfig?.sections && Array.isArray(website.layoutConfig.sections)) {
                        const wsSections = website.layoutConfig.sections as any[];
                        if (wsSections.length > 0) {
                            sectionsData = wsSections
                                .filter((s: any) => s.isVisible !== false && s.type)
                                .map((s: any) => ({
                                    id: s.id,
                                    type: s.type,
                                    config: s.config,
                                    variant: (s as any).variant
                                }));
                        }
                    }
                }

                // 4) Clear existing sections from canvas before loading new ones
                if (!cancelled) {
                    try {
                        const emptyJson = '{"ROOT":{"type":{"resolvedName":"Element"},"isCanvas":true,"props":{"id":"ROOT","canvas":true},"nodes":[],"linkedNodes":{},"hidden":false,"custom":{},"displayName":"Element"}}';
                        actions.deserialize(emptyJson);
                    } catch (e) {
                        const currentNodes = query.node('ROOT').get().data.nodes || [];
                        currentNodes.forEach(id => actions.delete(id));
                    }
                }

                // Small delay to let clearing settle
                if (!cancelled) await new Promise(r => setTimeout(r, 20));

                // 5) Convert template section types into Craft.js nodes and add to canvas
                if (sectionsData.length > 0 && !cancelled) {
                    for (const section of sectionsData) {
                        if (cancelled) break;
                        try {
                            const sectionElement = renderSection({
                                type: section.type,
                                config: section.config,
                                variant: section.variant
                            });

                            if (!sectionElement) continue;

                            const tree = query.parseReactElement(
                                sectionElement as React.ReactElement
                            ).toNodeTree();
                            actions.addNodeTree(tree, 'ROOT');
                        } catch (e) {
                            console.warn(`Failed to add section "${section.type}":`, e);
                        }
                    }

                    // Cache the newly built layout snapshot
                    if (!cancelled) {
                        try {
                            const builtJson = query.serialize();
                            store.savePageSnapshot(effectivePageId, builtJson);
                        } catch { /* ignore */ }
                    }
                }
            } catch (err) {
                console.error('Failed to load website configuration:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        initBuilder();
        return () => { cancelled = true; };
    }, [agentId, websiteId, pageId, templateId, agentAdvanced]); // Exclude actions, query to avoid resetting on every selection state update

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

export interface WebsiteBuilderProps {
    builderMode?: 'organization' | 'agent' | 'agent-advanced';
    userRole?: 'clientAdmin' | 'superAdmin';
    entityId?: string;       // org ID or agent ID
    websiteId?: string;
    pageId?: string;
    templateId?: string;
    initialTab?: 'pages' | 'toolbox' | 'nav' | 'seo' | 'design';
}

export default function WebsiteBuilderPage(props: WebsiteBuilderProps) {
    return (
        <React.Suspense fallback={<div className="p-20 text-center font-black text-slate-300 uppercase italic">Loading Ecosystem...</div>}>
            <WebsiteBuilderInternalWrapper {...props} />
        </React.Suspense>
    );
}

function WebsiteBuilderInternalWrapper(props: WebsiteBuilderProps) {
    const searchParams = useSearchParams();
    const templateId = props.templateId || (searchParams.get('templateId') as TemplateName) || 'modern-realty';

    // Resolve template-specific components to override Sections
    const templateMod = React.useMemo(() => templateRegistry[templateId as TemplateName], [templateId]);

    const mergedSections = React.useMemo(() => ({
        ...Sections,
        ...(templateMod?.sections || {})
    }), [templateId, templateMod]);

    console.log("Loaded template:", templateId);

    return (
        <Editor resolver={mergedSections}>
            <WebsiteBuilderInternal resolver={mergedSections} {...props} />
        </Editor>
    );
}

function WebsiteBuilderInternal({ resolver, ...props }: { resolver: any } & WebsiteBuilderProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const userRole = props.userRole || 'clientAdmin';
    const isAgentInUrl = !!searchParams.get('agentId');
    const agentAdvanced = (props.builderMode === 'agent-advanced') || searchParams.get('agentAdvanced') === 'true' || (userRole === 'superAdmin' && isAgentInUrl);

    const builderMode = props.builderMode || (isAgentInUrl ? (agentAdvanced ? 'agent-advanced' : 'agent') : 'organization');

    const agentId = (builderMode.includes('agent') ? (props.entityId || searchParams.get('agentId')) : null);
    const websiteIdFromPropsOrParams = props.websiteId || (builderMode === 'organization' ? props.entityId : null) || searchParams.get('websiteId');

    // Default websiteId for clientAdmin if nothing else provided
    const websiteId = websiteIdFromPropsOrParams || (userRole === 'clientAdmin' && !agentId ? 'ws_brokerage_001' : null);

    const pageId = props.pageId || searchParams.get('pageId');
    const pageSlugParam = searchParams.get('page');
    const templateId = props.templateId || searchParams.get('templateId');

    const [activeTab, setActiveTab] = React.useState<'pages' | 'toolbox' | 'nav' | 'seo' | 'design'>(props.initialTab || 'toolbox');
    const [isPreviewMode, setIsPreviewMode] = React.useState(false);
    const [hasInteracted, setHasInteracted] = React.useState(false);


    // ─── Editor State ───
    const { selected, actions, canUndo } = useEditor((state, query) => {
        const [id] = state.events.selected;
        return {
            selected: id ? state.nodes[id] : null,
            canUndo: query.history.canUndo()
        };
    });

    // Track if user has ever made a change (persists even after undo)
    React.useEffect(() => {
        if (canUndo) setHasInteracted(true);
    }, [canUndo]);

    const isConfigTab = activeTab === 'nav' || activeTab === 'seo' || activeTab === 'design';
    const isRightPanelOpen = !isPreviewMode && (!!selected || isConfigTab);

    const togglePreview = (open: boolean) => {
        setIsPreviewMode(open);
        try {
            actions.setOptions((options: any) => {
                options.enabled = !open;
            });
        } catch (err) {
            console.error("Preview toggle error:", err);
        }
    };

    // ── Zustand store (single source of truth) ──────────────
    const store = useBuilderStore();

    // Determine if sidebar header variant is selected (must be after store)
    const isSidebarHeader = store.globalSections?.header?.type === 'sidebar';

    // ─── Direct Header/Footer Click Handlers ──────────────────
    React.useEffect(() => {
        (window as any).onHeaderClick = () => setActiveTab('design');
        (window as any).onFooterClick = () => setActiveTab('design');
        return () => {
            delete (window as any).onHeaderClick;
            delete (window as any).onFooterClick;
        };
    }, []);

    // ─── Navigation Logic ────────────────────────────────────
    const normalize = React.useCallback((s?: string | null) => {
        if (!s || s === '/' || s === 'home') return '/';
        // strip leading hash if present (e.g. #about -> /about)
        let clean = s.startsWith('#') ? s.substring(1) : s;
        if (clean.startsWith('/#')) clean = clean.substring(2);
        // Lowercase everything for robust matching
        clean = clean.toLowerCase();
        return clean.startsWith('/') ? clean : `/${clean}`;
    }, []);

    const website = store.website;
    const activePageId = store.activePageId;
    const storePages = store.pages;
    // Derive a flat pages array for backward-compat with UI components
    const pages = React.useMemo(() => Object.values(storePages), [storePages]);
    const resolvedPageId = activePageId || pageId || null;
    const activePageSlug = normalize(pages.find(p => p.id === resolvedPageId)?.slug || '/');

    // ── Sync Active Page from URL ────────────────────────────
    React.useEffect(() => {
        if (pageId && store.activePageId !== pageId) {
            store.setActivePage(pageId);
        }
    }, [pageId, store]);

    // Set builder mode and template in store on mount
    React.useEffect(() => {
        let mode: 'organization' | 'agent' | 'agent-advanced';
        if (agentId && agentAdvanced) {
            mode = 'agent-advanced';
        } else if (agentId) {
            mode = 'agent';
        } else {
            mode = 'organization';
        }
        store.setBuilderMode(mode);
        if (templateId) store.setTemplateId(templateId);

        // agent-advanced gets full access, legacy 'agent' stays on toolbox
        if (mode === 'agent') setActiveTab('toolbox');
        if (mode === 'agent-advanced') setActiveTab('pages');
    }, [templateId, agentId, agentAdvanced]);

    // Reset store on unmount
    React.useEffect(() => () => { store.reset(); }, []);

    // Helper: navigate to another page within the same website (internal ID)
    // Instantly updates store and syncing URL
    const navigateToInternalPage = React.useCallback((targetPageId: string) => {
        store.setActivePage(targetPageId);
        // Persist to URL so refresh handles it
        const params = new URLSearchParams(searchParams.toString());
        params.set('pageId', targetPageId);
        params.delete('page');
        router.push(`/website-builder?${params.toString()}`);
    }, [router, searchParams, store]);

    // Helper: navigate to a page by slug
    const navigateToSlug = React.useCallback(async (slug: string) => {
        // Skip non-page protocols
        if (slug.startsWith('mailto:') || slug.startsWith('tel:')) return;

        // ── 1) Match against in-memory store pages FIRST (no websiteId needed) ──
        const targetSlug = normalize(slug);
        const storeMatch = pages.find(p => normalize(p.slug) === targetSlug);
        if (storeMatch) {
            navigateToInternalPage(storeMatch.id);
            return;
        }

        // ── Hash link fallback: scroll to element if no page matched ──
        if (slug.startsWith('#')) {
            const el = document.getElementById(slug.substring(1));
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
        }

        // ── Everything below needs a websiteId for server calls ──
        const id = websiteId || website?.id;
        if (!id) return;

        const targetOrgId = website?.organizationId || 'org-1';

        // 2) Check services
        let page;
        if (agentId) {
            try {
                const agentPagesView = await websiteInstanceService.getAgentPages(agentId, id);
                page = agentPagesView.find(p => normalize(p.slug) === targetSlug);
            } catch { }
        } else {
            page = await orgWebsiteService.getPageBySlug(targetOrgId, id, slug);
        }

        if (page) {
            // Ensure server-found page is in store
            if (!store.pages[page.id]) {
                store.addPage({
                    id: page.id,
                    name: page.title,
                    slug: page.slug,
                    isPublic: page.isPublic !== false,
                    pageType: (page.pageType || 'static') as any,
                    sections: (page.layoutConfig?.sections || []).map((s: any) => ({
                        id: s.id || crypto.randomUUID(),
                        type: s.type,
                        config: s.config || {},
                    }))
                });
            }
            navigateToInternalPage(page.id);
        } else {
            // 3) Page missing -> Offer to create
            if (confirm(`The page "${slug}" doesn't exist. Would you like to create it now?`)) {
                try {
                    const title = slug.replace('/', '').split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'New Page';
                    let newPage;

                    if (agentId) {
                        // Create Agent-Advanced page
                        newPage = await websiteInstanceService.createAgentPage(agentId, {
                            websiteId: id,
                            title,
                            slug: targetSlug,
                            layoutConfig: { sections: [] },
                            isPublished: true,
                            isPublic: true,
                        });
                    } else {
                        // Create Org page
                        newPage = await orgWebsiteService.createPage(targetOrgId, {
                            websiteId: id,
                            title,
                            slug: targetSlug,
                            layoutConfig: { sections: [] },
                            isPublished: true,
                            isPublic: true,
                        });
                    }

                    if (newPage) {
                        store.addPage({
                            id: newPage.id,
                            name: newPage.title,
                            slug: newPage.slug || targetSlug,
                            isPublic: true,
                            pageType: 'static',
                            sections: []
                        });
                        navigateToInternalPage(newPage.id);
                        useNotificationStore.getState().addNotification({ type: 'success', title: 'Page Created', message: `Added new ${title} page to your site.` });
                    }
                } catch (err) {
                    console.error('Failed to create page:', err);
                    useNotificationStore.getState().addNotification({ type: 'error', title: 'Create Failed', message: 'Could not generate the new page record.' });
                }
            }
        }
    }, [websiteId, website?.id, navigateToInternalPage, store, pages, website?.organizationId]);

    const fetchWebsite = async () => {
        // Determine the target organization ID.
        // If passed via props (e.g. from Super Admin), use it.
        // Otherwise default to the one in the website data once loaded, or 'org-1' as fallback.
        const defaultOrgId = 'org-1';
        let targetOrgId = defaultOrgId;

        if (websiteId) {
            const data = await orgWebsiteService.getOrgWebsite(targetOrgId, websiteId);
            store.setWebsite(data);
            targetOrgId = data?.organizationId || defaultOrgId;
            const pageList = await orgWebsiteService.getPages(targetOrgId, websiteId);
            // Convert to BuilderPage format
            const builderPages: BuilderPage[] = (pageList || []).map((p: any) => ({
                id: p.id,
                name: p.title || p.name || 'Untitled',
                slug: p.slug || '/',
                isPublic: p.isPublic === true || (p.isPublic === undefined && ['/', '/about', '/properties', '/communities', '/contact'].includes((p.slug || '/').toLowerCase())),
                pageType: (p.pageType || 'static') as 'static' | 'listing' | 'agent',
                sections: (p.layoutConfig?.sections || []).map((s: any) => ({
                    id: s.id || crypto.randomUUID(),
                    type: s.type || 'unknown',
                    config: s.config || {},
                })),
                overrideSections: true
            }));
            store.setPages(builderPages);

            // Handle page resolution from slug if pageId is missing
            if (!pageId && (pageSlugParam || websiteId)) {
                const slug = pageSlugParam || '/';
                const page = await orgWebsiteService.getPageBySlug(targetOrgId, websiteId, slug);
                if (page) {
                    store.setActivePage(page.id);
                } else if (slug === '/') {
                    await orgWebsiteService.provisionDefaultPages(targetOrgId, websiteId);
                    const home = await orgWebsiteService.getPageBySlug(targetOrgId, websiteId, '/');
                    if (home) store.setActivePage(home.id);
                }
            } else if (pageId) {
                store.setActivePage(pageId);
            }
        } else if (agentId) {
            try {
                // Try direct, then with prefix
                let data = await websiteInstanceService.getWebsiteByAgentId(agentId);
                if (!data && !agentId.startsWith('agent-')) {
                    data = await websiteInstanceService.getWebsiteByAgentId(`agent-${agentId}`);
                }
                if (data) {
                    store.setWebsite(data);

                    if (agentAdvanced) {
                        // --- agent-advanced: load per-agent pages ---
                        const agentPages = await websiteInstanceService.getAgentPages(agentId, data.id);
                        const builderPages: BuilderPage[] = agentPages.map((p: AgentPage) => ({
                            id: p.id,
                            name: p.title,
                            slug: p.slug,
                            isPublic: p.isPublic,
                            pageType: p.pageType,
                            sections: (p.layoutConfig?.sections || []).map((s: any) => ({
                                id: s.id || crypto.randomUUID(),
                                type: s.type || 'unknown',
                                config: s.config || {},
                            })),
                        }));
                        store.setPages(builderPages);
                        // Load agent navigation into dedicated slice
                        if (data.navigation && data.navigation.length > 0) {
                            store.setAgentNavigation(data.navigation);
                        }
                        // Activate first page or pageId param
                        const targetPageId = pageId || builderPages[0]?.id || '';
                        if (targetPageId) store.setActivePage(targetPageId);
                    } else {
                        // --- legacy agent mode: single virtual home page ---
                        const agentSections: any[] = data.layoutConfig?.sections || [];
                        const homePage: BuilderPage = {
                            id: 'home',
                            name: 'Home Page',
                            slug: '/',
                            sections: agentSections.map((s: any) => ({
                                id: s.id || crypto.randomUUID(),
                                type: s.type || 'unknown',
                                config: s.config || {},
                            })),
                            isPublic: false,
                            pageType: 'static',
                        };
                        store.setPages([homePage]);
                        store.setActivePage('home');
                    }
                }
            } catch { }
        }
        store.setInitialised(true);
    };

    React.useEffect(() => {
        fetchWebsite();
        // NOTE: intentionally excludes pageId and pageSlugParam.
        // Page switching is handled by navigateToInternalPage + Loader.
        // Re-fetching the entire website on every page change was causing
        // store.setPages() to wipe the snapshot cache, reverting navigation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [websiteId, agentId]);


    const handleSave = async (json: string) => {
        const targetOrgId = store.website?.organizationId || 'org-1';
        try {
            if (store.builderMode === 'organization' && resolvedPageId) {
                await orgWebsiteService.savePageLayout(targetOrgId, resolvedPageId, json);
            } else if (store.builderMode === 'agent-advanced' && agentId && resolvedPageId) {
                // agent-advanced: save to per-agent page layout
                await websiteInstanceService.saveAgentPageLayout(agentId, resolvedPageId, json);
            } else if (agentId) {
                // legacy agent mode: save to website instance layoutConfig
                let agentWebsite = await websiteInstanceService.getWebsiteByAgentId(agentId);

                if (!agentWebsite) {
                    agentWebsite = await websiteInstanceService.createWebsiteInstance({
                        organizationId: targetOrgId,
                        agentId: agentId,
                        templateId: templateId || 'modern-realty',
                        domain: `agent-${agentId}.realestate.com`,
                    });
                }

                await websiteInstanceService.updateWebsiteInstance(agentWebsite.id, {
                    layoutConfig: {
                        ...agentWebsite.layoutConfig,
                        customLayoutJson: json,
                    } as any
                });
            }

            // Update the store's snapshot cache
            const effectivePageId = resolvedPageId || 'home';
            store.savePageSnapshot(effectivePageId, json);

            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Published Successfully',
                message: 'Your website design has been saved and published.'
            });
        } catch (err) {
            console.error('Save error:', err);
            useNotificationStore.getState().addNotification({
                type: 'error',
                title: 'Publish Failed',
                message: 'Could not sync with the database.'
            });
            throw err; // Re-throw so Topbar can handle loading state
        }
    };

    // ─── Header Navigation Logic ─────────────────────────────
    // Filter out items from the navigation if their target pages are hidden (isPublic === false)
    const effectiveNavigation = React.useMemo(() => {
        const rawNav = store.agentNavigation.length > 0 ? store.agentNavigation : (website?.navigation || []);

        // Build a list of "Hidden" slugs (e.g. ['/about', 'about', '#about'])
        const hiddenSlugs = new Set<string>();
        Object.values(store.pages).forEach(p => {
            if (p.isPublic === false) {
                const s = p.slug.replace(/^\/+/, ''); // trim leading slashes
                hiddenSlugs.add(p.slug);
                hiddenSlugs.add(s);
                hiddenSlugs.add(`/ ${s}`);
                hiddenSlugs.add(`#${s}`);
                if (s === 'home') hiddenSlugs.add('/');
            }
        });

        const filteredNav = rawNav.filter((item: any) => {
            const itemSlug = item.slug || '';
            return !hiddenSlugs.has(itemSlug);
        });

        // If no custom navigation is set, derive from public static pages (works for both org and agent)
        if (rawNav.length === 0) {
            return Object.values(store.pages)
                .filter(p => p.isPublic && p.pageType === 'static')
                .map(p => ({
                    id: p.id,
                    label: p.name,
                    slug: p.slug
                }));
        }

        return filteredNav;
    }, [store.agentNavigation, website?.navigation, store.pages, agentId, pages]);


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
            <Loader agentId={agentId} websiteId={websiteId} pageId={resolvedPageId} templateId={templateId || 'modern-realty'} agentAdvanced={agentAdvanced} />
            <Topbar
                onSave={handleSave}
                agentId={agentId || ''}
                builderMode={store.builderMode}
                canPreview={hasInteracted}
                isPreviewMode={isPreviewMode}
                onTogglePreview={togglePreview}
                userRole={userRole}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar - Tab Side Nav */}
                {!isPreviewMode && (
                    <div className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-6 z-50 flex-shrink-0">
                        {/* Pages tab — org or agent-advanced */}
                        {(builderMode === 'organization' || builderMode === 'agent-advanced') && (
                            <button
                                onClick={() => setActiveTab('pages')}
                                className={`p-3 rounded-2xl transition-all ${activeTab === 'pages' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50' : 'text-slate-500 hover:text-white'}`}
                                title="Pages"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </button>
                        )}

                        {/* Toolbox tab — all modes */}
                        <button
                            onClick={() => setActiveTab('toolbox')}
                            className={`p-3 rounded-2xl transition-all ${activeTab === 'toolbox' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50' : 'text-slate-500 hover:text-white'}`}
                            title={builderMode === 'agent' ? 'Components (Locked)' : 'Add Elements'}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>

                        {/* Navigation tab — org or agent-advanced */}
                        {(builderMode === 'organization' || builderMode === 'agent-advanced') && (
                            <button
                                onClick={() => setActiveTab('nav')}
                                className={`p-3 rounded-2xl transition-all ${activeTab === 'nav' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50' : 'text-slate-500 hover:text-white'}`}
                                title={builderMode === 'agent-advanced' ? 'Agent Navigation' : 'Navigation Menu'}
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        )}

                        {/* SEO tab — org or agent-advanced */}
                        {(builderMode === 'organization' || builderMode === 'agent-advanced') && (
                            <button
                                onClick={() => setActiveTab('seo')}
                                className={`p-3 rounded-2xl transition-all ${activeTab === 'seo' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50' : 'text-slate-500 hover:text-white'}`}
                                title="SEO Settings"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        )}

                        {/* Branding/Design tab — org or agent-advanced */}
                        {(builderMode === 'organization' || builderMode === 'agent-advanced') && (
                            <button
                                onClick={() => setActiveTab('design')}
                                className={`p-3 rounded-2xl transition-all ${activeTab === 'design' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50' : 'text-slate-500 hover:text-white'}`}
                                title="Site Design & Header"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Left Panel: Structure & Sources */}
                {!isPreviewMode && (activeTab === 'pages' || activeTab === 'toolbox') && (
                    <div className="w-[340px] max-w-[340px] bg-white border-r border-slate-200 flex flex-col overflow-y-auto overflow-x-hidden shadow-sm z-40 flex-shrink-0 animate-in slide-in-from-left duration-300">
                        {/* ── Organization: full pages panel ── */}
                        {activeTab === 'pages' && (websiteId || website?.id) && builderMode === 'organization' && (
                            <PagesPanel
                                websiteId={(websiteId || website?.id) as string}
                                currentPageId={resolvedPageId || ''}
                                onSelectPage={(id) => navigateToInternalPage(id)}
                            />
                        )}

                        {/* ── Agent-advanced: agent-scoped pages panel ── */}
                        {activeTab === 'pages' && agentId && builderMode === 'agent-advanced' && (
                            <AgentPagesPanel
                                agentId={agentId}
                                websiteId={(website?.id || store.website?.id || '')}
                                templateId={templateId || store.templateId}
                                currentPageId={resolvedPageId || ''}
                                onSelectPage={(id) => navigateToInternalPage(id)}
                            />
                        )}

                        {/* ── Legacy agent: locked pages ── */}
                        {activeTab === 'pages' && agentId && builderMode === 'agent' && (
                            <div className="p-8 text-center space-y-4">
                                <div className="h-16 w-16 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Pages Locked</h3>
                                <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">Agents cannot create or manage pages. Please customize your profile below.</p>
                            </div>
                        )}

                        {/* ── Toolbox ── */}
                        {activeTab === 'toolbox' && <Toolbox resolver={resolver} setActiveTab={setActiveTab} />}
                    </div>
                )}

                {/* Center Panel: Live Preview Canvas */}
                {/* overflow-hidden clips the SideDrawer to this frame */}
                <div className={`flex-1 bg-slate-100 transition-all duration-500 ${isPreviewMode ? 'p-0' : 'p-8'} overflow-hidden relative`}>
                    <div
                        className={`mx-auto transition-all duration-500 bg-white ${isPreviewMode ? 'max-w-none h-full rounded-none' : 'w-full max-w-[1200px] h-[calc(100vh-120px)] rounded-[3rem] shadow-2xl border border-slate-200'} overflow-hidden flex flex-col relative`}
                        style={{
                            perspective: '1px',
                            isolate: 'isolate',
                            transform: 'translate3d(0,0,0)',
                            backfaceVisibility: 'hidden'
                        } as any}
                    >
                        {/* Browser-like Header */}
                        {!isPreviewMode && (
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center justify-center gap-4 z-[70] sticky top-0 flex-shrink-0">
                                <div className="absolute left-8 flex gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-400" />
                                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                                </div>
                                <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 px-4 py-1.5 text-[10px] font-bold text-slate-400 italic font-mono truncate shadow-sm">
                                    {agentId ? `https://agent-${agentId}.realestate.com` : `https://brokerage.realestate.com${pages.find(p => p.id === resolvedPageId)?.slug || '/'}`}
                                </div >
                                <div className="absolute right-8 flex items-center gap-2">
                                    <div className="px-3 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-black text-slate-400 uppercase tracking-widest">LIVE EDITOR</div>
                                </div>
                            </div >
                        )}

                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative bg-white">
                            {!isPreviewMode && <SectionCounter />}
                            <TemplateProvider
                                templateId={(templateId as TemplateName)}
                                navigation={effectiveNavigation}
                                currentPageSlug={activePageSlug}
                                onNavigate={navigateToSlug}
                                organizationName={store.website?.brandingConfig?.organizationName || (website?.organizationId === 'org-1' ? 'Skyline Estates' : 'Agent Website')}
                                branding={store.website?.brandingConfig}
                            >
                                {/* Outer layout: flex-row for sidebar variant (nav beside content), flex-col for all other header variants (nav above content) */}
                                <div className={`relative flex min-h-full transition-all duration-300 ${isSidebarHeader ? 'flex-row' : 'flex-col'}`}>
                                    {/* GlobalHeader renders as sidebar aside OR top header based on the selected variant */}
                                    <GlobalHeader
                                        isEditor={!isPreviewMode}
                                        props={{ ...store.globalSections.header.props, layout: store.globalSections.header.type }}
                                    />

                                    {/* Main Content + Footer: in sidebar mode, this sits beside the sidebar. In top-nav mode, it sits below. */}
                                    <div className="flex-1 flex flex-col bg-white">
                                        <div className="flex-1">
                                            <Frame>
                                                <Element is="div" id="ROOT" canvas />
                                            </Frame>
                                        </div>

                                        {/* Global Footer Renderer */}
                                        <GlobalFooter
                                            isEditor={!isPreviewMode}
                                            props={{ ...store.globalSections.footer.props, layout: store.globalSections.footer.type }}
                                        />
                                    </div>
                                </div>
                            </TemplateProvider>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Configuration */}
                {isRightPanelOpen && (
                    <div className="w-[340px] max-w-[340px] bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-xl z-40 animate-in slide-in-from-right duration-300">
                        {/* 1) Specific element configuration takes precedence */}
                        {selected ? (
                            <SettingsPanel />
                        ) : (
                            <>
                                {/* 2) Otherwise, show global configuration panels based on active tab */}
                                {activeTab === 'nav' && builderMode === 'organization' && (websiteId || website?.id || store.website?.id) && (
                                    <NavigationPanel
                                        websiteId={(websiteId || website?.id || store.website?.id) as string}
                                        agentId={null}
                                        onUpdate={fetchWebsite}
                                    />
                                )}
                                {activeTab === 'nav' && builderMode === 'agent-advanced' && (
                                    <NavigationPanel
                                        websiteId={(website?.id || store.website?.id || '') as string}
                                        agentId={agentId}
                                        onUpdate={fetchWebsite}
                                    />
                                )}

                                {activeTab === 'seo' && (builderMode === 'organization' || builderMode === 'agent-advanced') && (
                                    <SeoPanel
                                        agentId={agentId}
                                        websiteId={(website?.id || store.website?.id || '') as string}
                                    />
                                )}

                                {activeTab === 'design' && (
                                    <DesignPanel
                                        websiteId={(website?.id || store.website?.id || '') as string}
                                        agentId={agentId}
                                    />
                                )}


                            </>
                        )}
                    </div>
                )}
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
