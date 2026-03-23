'use client';

import React from 'react';
import { useEditor, useNode } from '@craftjs/core';
import {
    useTemplate,
    templateRegistry,
    TemplateModule,
    TemplateName
} from '@repo/ui';
import { HeroContent, ListingsSectionContent, AgentsContent, ContactCtaContent } from '@repo/types';
import { useBuilderStore } from './useBuilderStore';

// Wrapper to inject Craft.js connectors + hover controls into each section
const CraftWrapper = ({ child, id: sectionId }: { child: React.ReactNode; id?: string }) => {
    const { connectors: { connect, drag }, id } = useNode();
    const { actions, query } = useEditor();
    const [hovered, setHovered] = React.useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.delete(id);
    };

    const handleMoveUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const nodeData = query.node(id).get();
            const parentId = nodeData.data.parent;
            if (!parentId) return;
            const parentNode = query.node(parentId).get();
            const children = parentNode.data.nodes || [];
            const currentIndex = children.indexOf(id);
            if (currentIndex > 0) {
                actions.move(id, parentId, currentIndex - 1);
            }
        } catch { }
    };

    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const nodeData = query.node(id).get();
            const parentId = nodeData.data.parent;
            if (!parentId) return;
            const parentNode = query.node(parentId).get();
            const children = parentNode.data.nodes || [];
            const currentIndex = children.indexOf(id);
            if (currentIndex < children.length - 1) {
                actions.move(id, parentId, currentIndex + 2);
            }
        } catch { }
    };

    const store = useBuilderStore();
    const isAgentMode = store.builderMode === 'agent'; // Modified line

    if (!connect || !drag) return <>{child}</>;

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            id={sectionId}
            className={`relative group/section ${isAgentMode ? '' : 'cursor-pointer'}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {child}

            {hovered && (
                <>
                    <div className="absolute inset-0 border-2 border-indigo-500/50 pointer-events-none z-40 rounded-sm" />
                    <div className="absolute top-2 left-2 z-50 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-lg pointer-events-none">
                        {isAgentMode ? 'Click to Customize' : 'Click to Edit'}
                    </div>
                    {!isAgentMode && (
                        <div className="absolute top-2 right-2 z-50 flex items-center gap-1">
                            <button onClick={handleMoveUp} className="h-7 w-7 bg-slate-800/90 hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors" title="Move Up">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button onClick={handleMoveDown} className="h-7 w-7 bg-slate-800/90 hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors" title="Move Down">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <button onClick={handleDelete} className="h-7 w-7 bg-red-500/90 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors" title="Remove Section">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
//  TEMPLATE-AWARE SECTIONS
// ═══════════════════════════════════════════════════════════

export const HeroSection = ({ content, variant, id }: { content?: HeroContent; variant?: string; id?: string }) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.Hero || templateRegistry['modern-realty'].Hero!;
    return <CraftWrapper id={id} child={<Component id={id} variant={variant} {...(content || {})} />} />;
};
HeroSection.displayName = 'HeroSection';

export const ListingsSection = ({ content, filters, limit, variant, id, source, shortcodeId, ...props }: {
    content?: ListingsSectionContent;
    filters?: any;
    limit?: number;
    variant?: string;
    id?: string;
    source?: 'manual' | 'shortcode';
    shortcodeId?: string;
    [key: string]: any
}) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.Listings || templateRegistry['modern-realty'].Listings!;

    // When source is 'shortcode', resolve filters from the centralized service
    const [resolvedFilters, setResolvedFilters] = React.useState<any>(filters || {});
    const [resolvedLimit, setResolvedLimit] = React.useState<number>(limit || 3);

    React.useEffect(() => {
        if (source === 'shortcode' && shortcodeId) {
            try {
                // Import dynamically to avoid circular deps — use the singleton
                const { shortcodeConfigService } = require('@repo/services');
                // Try to find by ID in all configs (super_admin has access to all)
                const allConfigs = shortcodeConfigService.getConfigs({ role: 'super_admin' });
                const config = allConfigs.find((c: any) => c.id === shortcodeId);
                if (config) {
                    setResolvedFilters(config.filters || {});
                    setResolvedLimit(config.limit || 3);
                }
            } catch (err) {
                console.warn('ListingsSection: Failed to resolve shortcode', shortcodeId, err);
            }
        } else {
            setResolvedFilters(filters || {});
            setResolvedLimit(limit || 3);
        }
    }, [source, shortcodeId, filters, limit]);

    const combinedFilters = { ...resolvedFilters, ...props };
    return <CraftWrapper id={id} child={<Component id={id} content={content || {}} filters={combinedFilters} limit={resolvedLimit} variant={variant} {...props} />} />;
};
ListingsSection.displayName = 'ListingsSection';

export const FeaturedListingsSection = ({ content, filters, limit, variant, id, source, shortcodeId, ...props }: {
    content?: ListingsSectionContent;
    filters?: any;
    limit?: number;
    variant?: string;
    id?: string;
    source?: 'manual' | 'shortcode';
    shortcodeId?: string;
    [key: string]: any
}) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.FeaturedListings || templateRegistry['modern-realty'].Listings!;

    const [resolvedFilters, setResolvedFilters] = React.useState<any>(filters || {});
    const [resolvedLimit, setResolvedLimit] = React.useState<number>(limit || 3);

    React.useEffect(() => {
        if (source === 'shortcode' && shortcodeId) {
            try {
                const { shortcodeConfigService } = require('@repo/services');
                const allConfigs = shortcodeConfigService.getConfigs({ role: 'super_admin' });
                const config = allConfigs.find((c: any) => c.id === shortcodeId);
                if (config) {
                    setResolvedFilters(config.filters || {});
                    setResolvedLimit(config.limit || 3);
                }
            } catch (err) {
                console.warn('FeaturedListingsSection: Failed to resolve shortcode', shortcodeId, err);
            }
        } else {
            setResolvedFilters(filters || {});
            setResolvedLimit(limit || 3);
        }
    }, [source, shortcodeId, filters, limit]);

    const combinedFilters = { ...resolvedFilters, featured: true, ...props };
    return <CraftWrapper id={id} child={<Component id={id} content={content || {}} filters={combinedFilters} limit={resolvedLimit} variant={variant || "default"} {...props} />} />;
};
FeaturedListingsSection.displayName = 'FeaturedListingsSection';

export const AgentProfilesSection = ({ content, variant, id }: { content?: AgentsContent; variant?: 'grid' | 'showcase' | 'mini'; id?: string }) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.Agents || templateRegistry['modern-realty'].Agents!;
    return <CraftWrapper id={id} child={<Component id={id} variant={variant} {...(content || {})} />} />;
};
AgentProfilesSection.displayName = 'AgentProfilesSection';

export const ContactSection = ({ content, id }: { content?: ContactCtaContent; id?: string }) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.Contact || templateRegistry['modern-realty'].Contact!;
    return <CraftWrapper id={id} child={<Component id={id} {...(content || {})} />} />;
};

import { listingService, agentService } from '@repo/services';
import { Listing, Agent } from '@repo/types';

export const ListingDetailSection = ({ mlsNumber, id }: { mlsNumber?: string, id?: string }) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const [listing, setListing] = React.useState<Listing | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (mlsNumber) {
            setLoading(true);
            listingService.getByMLS(mlsNumber)
                .then(setListing)
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [mlsNumber]);

    const Component = template?.ListingDetailPage || templateRegistry['modern-realty'].ListingDetailPage;

    if (loading) return <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Retrieving Property Details...</div>;

    return <CraftWrapper id={id} child={<Component listing={listing || undefined} />} />;
};
ListingDetailSection.displayName = 'ListingDetailSection';

export const AgentDetailSection = ({
    agentId,
    name,
    title,
    bio,
    phone,
    email,
    profilePhoto,
    id
}: {
    agentId?: string;
    name?: string;
    title?: string;
    bio?: string;
    phone?: string;
    email?: string;
    profilePhoto?: string;
    id?: string
}) => {
    const [agentData, setAgentData] = React.useState<Agent | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (agentId) {
            setLoading(true);
            agentService.getAgentById(agentId)
                .then(a => setAgentData(a || null))
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [agentId]);

    if (loading) return <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Retrieving Agent Profile...</div>;

    // Use overrides if provided, otherwise fallback to database agent data
    const agent = {
        name: name || agentData?.name || 'Agent Name',
        title: title || agentData?.title || 'Real Estate Professional',
        bio: bio || agentData?.bio || 'This agent has not provided a biography yet.',
        phone: phone || agentData?.phone || '(555) 000-0000',
        email: email || agentData?.email || 'contact@agent.com',
        profilePhoto: profilePhoto || agentData?.profilePhoto
    };

    return (
        <CraftWrapper id={id} child={
            <div className="py-20 px-6 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
                    <div className="w-48 h-48 bg-slate-100 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-2xl">
                        {agent.profilePhoto ? (
                            <img src={agent.profilePhoto} alt={agent.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2">{agent.title}</p>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{agent.name}</h1>
                        </div>
                        <p className="text-slate-500 text-lg leading-relaxed font-medium">{agent.bio}</p>
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-[10px]">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {agent.phone}
                            </div>
                            <div className="flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-[10px]">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {agent.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        } />
    );
};
AgentDetailSection.displayName = 'AgentDetailSection';

// ═══════════════════════════════════════════════════════════
//  GENERIC SECTIONS
// ═══════════════════════════════════════════════════════════

export const TextSection = ({ text, variant, align, id }: {
    text?: string;
    variant?: 'standard' | 'lead' | 'muted';
    align?: 'left' | 'center' | 'right';
    id?: string
}) => {
    const activeVariant = variant || 'standard';
    const alignment = { left: 'text-left', center: 'text-center', right: 'text-right' };
    const styles = {
        standard: 'text-xl text-slate-700 font-medium leading-[1.8]',
        lead: 'text-3xl text-slate-900 font-black tracking-tight leading-relaxed',
        muted: 'text-sm text-slate-400 font-bold uppercase tracking-[0.15em] leading-loose',
    };

    return (
        <CraftWrapper id={id} child={
            <div id={id} className={`py-12 px-6 max-w-5xl mx-auto ${alignment[align || 'center']}`}>
                <p className={`${styles[activeVariant]} transition-all duration-300`}>
                    {text || 'Your content goes here. Write something compelling that describes your services or tells your brand story effectively.'}
                </p>
            </div>
        } />
    );
};
TextSection.displayName = 'TextSection';

export const ImageSection = ({ url, caption, variant, id }: {
    url?: string;
    caption?: string;
    variant?: 'default' | 'boxed' | 'parallax' | 'rounded';
    id?: string;
}) => {
    const activeUrl = url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200';
    const activeVariant = variant || 'default';

    const renderDefault = () => (
        <div className="py-12 px-6 flex flex-col items-center">
            <div className="max-w-4xl w-full group relative">
                <img src={activeUrl} alt={caption} className="w-full rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/10" />
                {caption && <p className="mt-4 text-sm text-slate-400 font-medium italic text-center">{caption}</p>}
            </div>
        </div>
    );

    const renderBoxed = () => (
        <div className="py-24 px-6 flex flex-col items-center bg-slate-50">
            <div className="max-w-3xl w-full p-4 bg-white rounded-[2rem] shadow-2xl border border-slate-100 relative group">
                <div className="aspect-[16/10] rounded-[1.5rem] overflow-hidden">
                    <img src={activeUrl} alt={caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                {caption && (
                    <div className="pt-6 pb-2 text-center">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-2">Featured View</span>
                        <p className="text-slate-900 font-black tracking-tight">{caption}</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderParallax = () => (
        <div className="py-0 overflow-hidden relative group h-[60vh] flex items-center justify-center">
            <img
                src={activeUrl}
                alt={caption}
                className="absolute inset-0 w-full h-[120%] object-cover -top-[10%] group-hover:-translate-y-4 transition-transform duration-[2000ms] ease-out"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            {caption && (
                <div className="relative z-10 p-8 border border-white/30 backdrop-blur-md rounded-2xl max-w-lg text-center">
                    <p className="text-white text-2xl font-black italic tracking-tight drop-shadow-lg">{caption}</p>
                </div>
            )}
        </div>
    );

    const renderRounded = () => (
        <div className="py-16 px-6 flex flex-col items-center">
            <div className="max-w-xl w-full aspect-square rounded-[80px] overflow-hidden shadow-2xl group border-4 border-white">
                <img src={activeUrl} alt={caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            {caption && <p className="mt-8 text-indigo-600 font-black uppercase tracking-[0.2em] text-xs">{caption}</p>}
        </div>
    );

    return (
        <CraftWrapper id={id} child={
            <div id={id}>
                {activeVariant === 'default' && renderDefault()}
                {activeVariant === 'boxed' && renderBoxed()}
                {activeVariant === 'parallax' && renderParallax()}
                {activeVariant === 'rounded' && renderRounded()}
            </div>
        } />
    );
};
ImageSection.displayName = 'ImageSection';

// ═══════════════════════════════════════════════════════════
//  NEW COMPONENTS
// ═══════════════════════════════════════════════════════════

// ─── Heading Section ──────────────────────────────────────
export const HeadingSection = ({ text, level, align, variant, id }: {
    text?: string;
    level?: 'h1' | 'h2' | 'h3' | 'h4';
    align?: 'left' | 'center' | 'right';
    variant?: 'default' | 'underline' | 'accent' | 'luxury';
    id?: string
}) => {
    const Tag = level || 'h2';
    const activeVariant = variant || 'default';
    const sizes = { h1: 'text-6xl', h2: 'text-4xl', h3: 'text-3xl', h4: 'text-2xl' };
    const alignment = { left: 'text-left items-start', center: 'text-center items-center', right: 'text-right items-end' };

    const renderDefault = () => (
        <Tag className={`${sizes[Tag]} font-black text-slate-900 tracking-tighter leading-[1.1]`}>
            {text || 'Modern Headline'}
        </Tag>
    );

    const renderUnderline = () => (
        <div className="flex flex-col gap-4">
            <Tag className={`${sizes[Tag]} font-black text-slate-900 tracking-tighter leading-tight`}>
                {text || 'Modern Section Title'}
            </Tag>
            <div className={`h-1.5 w-24 bg-indigo-600 rounded-full ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''}`} />
        </div>
    );

    const renderAccent = () => (
        <div className={`flex items-center gap-6 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
            <div className="w-2 self-stretch bg-indigo-600 rounded-full" />
            <Tag className={`${sizes[Tag]} font-black text-slate-900 tracking-tight leading-tight py-1`}>
                {text || 'Primary Accent Heading'}
            </Tag>
        </div>
    );

    const renderLuxury = () => (
        <Tag className={`${sizes[Tag]} font-black text-slate-900 uppercase tracking-[0.25em] leading-normal italic opacity-80 decoration-indigo-500/30 underline decoration-8 underline-offset-[12px]`}>
            {text || 'Luxury Statement'}
        </Tag>
    );

    return (
        <CraftWrapper id={id} child={
            <div id={id} className={`py-12 px-6 max-w-7xl mx-auto flex flex-col ${alignment[align || 'center']}`}>
                {activeVariant === 'default' && renderDefault()}
                {activeVariant === 'underline' && renderUnderline()}
                {activeVariant === 'accent' && renderAccent()}
                {activeVariant === 'luxury' && renderLuxury()}
            </div>
        } />
    );
};
HeadingSection.displayName = 'HeadingSection';

// ─── Spacer Section ───────────────────────────────────────
export const SpacerSection = ({ height, variant, id }: { height?: number; variant?: 'small' | 'medium' | 'large'; id?: string }) => {
    const activeVariant = variant || 'medium';
    const heights = { small: 32, medium: 80, large: 160 };
    const activeHeight = height || heights[activeVariant];

    return (
        <CraftWrapper id={id} child={
            <div
                id={id}
                style={{ height: `${activeHeight}px` }}
                className="w-full flex items-center justify-center group relative border-y border-transparent hover:border-indigo-100 transition-colors bg-slate-50/20"
            >
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-60 transition-all pointer-events-none scale-90 group-hover:scale-100">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    <span className="text-[10px] font-black tracking-[0.2em] text-indigo-400 uppercase">Vertical Space {activeHeight}px</span>
                </div>
            </div>
        } />
    );
};
SpacerSection.displayName = 'SpacerSection';

// ─── Divider Section ──────────────────────────────────────
export const DividerSection = ({ style, color, variant, id }: {
    style?: 'solid' | 'dashed' | 'dotted' | 'gradient';
    color?: string;
    variant?: 'solid' | 'gradient' | 'dotted' | 'accent' | 'glass';
    id?: string
}) => {
    const activeVariant = variant || (style as any) || 'solid';

    const renderSolid = () => <div className="h-px w-full bg-slate-200" style={{ backgroundColor: color }} />;
    const renderGradient = () => <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent" />;
    const renderDotted = () => <div className="h-1 w-full border-t-2 border-dotted border-slate-300" />;
    const renderAccent = () => <div className="h-1.5 w-32 mx-auto bg-indigo-600 rounded-full" />;
    const renderGlass = () => <div className="h-px w-full bg-white/10 dark:bg-black/10 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />;

    return (
        <CraftWrapper id={id} child={
            <div id={id} className="py-12 px-6 max-w-7xl mx-auto flex items-center justify-center overflow-hidden">
                {activeVariant === 'solid' && renderSolid()}
                {activeVariant === 'gradient' && renderGradient()}
                {activeVariant === 'dotted' && renderDotted()}
                {activeVariant === 'accent' && renderAccent()}
                {activeVariant === 'glass' && renderGlass()}
            </div>
        } />
    );
};

// ─── Button Section ───────────────────────────────────────
export const ButtonSection = ({ label, href, variant, align, id }: {
    label?: string;
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
    align?: 'left' | 'center' | 'right';
    id?: string
}) => {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:-translate-y-1',
        secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xl hover:-translate-y-1',
        outline: 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900',
        ghost: 'text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100',
        glow: 'bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] hover:-translate-y-1 ring-4 ring-amber-400/20',
    };
    const { onNavigate } = useTemplate();
    const alignment = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

    const handleClick = (e: React.MouseEvent) => {
        if (onNavigate && href && href !== '#') {
            e.preventDefault();
            onNavigate(href);
        }
    };

    return (
        <CraftWrapper id={id} child={
            <div id={id} className={`py-12 px-6 flex items-center ${alignment[align || 'center']}`}>
                <a
                    href={href || '#'}
                    onClick={handleClick}
                    className={`inline-flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 whitespace-nowrap ${variants[variant || 'primary']}`}
                >
                    {label || 'Action Button'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
            </div>
        } />
    );
};

// ─── Video Section ────────────────────────────────────────
export const VideoSection = ({
    url,
    caption,
    title,
    subtitle,
    variant,
    buttonLabel,
    buttonColor,
    buttonHref,
    id
}: {
    url?: string;
    caption?: string;
    title?: string;
    subtitle?: string;
    variant?: string;
    buttonLabel?: string;
    buttonColor?: string;
    buttonHref?: string;
    id?: string
}) => {
    const getEmbedUrl = (rawUrl: string) => {
        if (!rawUrl) return '';
        if (rawUrl.includes('youtube.com/watch?v=')) {
            const videoId = rawUrl.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (rawUrl.includes('youtu.be/')) {
            const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (rawUrl.includes('vimeo.com/')) {
            const videoId = rawUrl.split('vimeo.com/')[1];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        return rawUrl;
    };

    const renderPlayer = (className: string = "aspect-video") => (
        <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 ${className}`}>
            {url ? (
                <iframe
                    src={getEmbedUrl(url)}
                    className="absolute inset-0 w-full h-full border-none"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title="Video"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-bold uppercase tracking-widest">Add a video URL</span>
                </div>
            )}
        </div>
    );

    const btnStyle = { backgroundColor: buttonColor || '#4f46e5' };

    const renderButton = () => {
        if (!buttonLabel) return null;
        return (
            <a
                href={buttonHref || '#'}
                style={btnStyle}
                className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-indigo-600/20 text-center"
            >
                {buttonLabel}
            </a>
        );
    };

    const v = variant || 'minimal';

    if (v === 'cinema') {
        return (
            <CraftWrapper id={id} child={
                <div id={id} className="py-0 w-full bg-slate-900 group/cinema overflow-hidden relative">
                    <div className="max-w-[1400px] mx-auto py-20 px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-8">
                                {renderPlayer("aspect-[21/9]")}
                            </div>
                            <div className="lg:col-span-4 space-y-6">
                                <div className="space-y-4">
                                    <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">Cinematic Preview</p>
                                    <h2 className="text-4xl font-black text-white tracking-tighter leading-none">{title || 'Experience the Architecture'}</h2>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{subtitle || 'Take a deep dive into our craft and vision through this immersive cinematic journey.'}</p>
                                </div>
                                {renderButton()}
                            </div>
                        </div>
                    </div>
                    {/* Background decorative element */}
                    <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                </div>
            } />
        );
    }

    if (v === 'story') {
        return (
            <CraftWrapper id={id} child={
                <div id={id} className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 order-2 md:order-1">
                            <div className="space-y-4">
                                <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">{title || 'Telling Our Vision Through Motion'}</h2>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed italic">{subtitle || 'A story of innovation, passion, and the future of real estate design.'}</p>
                                <div className="pt-4">
                                    {renderButton()}
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 relative group/card overflow-hidden">
                                <div className="relative z-10 space-y-4">
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed">We believe that every home has a pulse, and every neighborhood has a heartbeat. Watch our story to see how we bridge the gap between imagination and reality.</p>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-indigo-100 rounded-full border-2 border-white flex items-center justify-center text-indigo-600 shadow-sm">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Leading Vision</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:scale-125 transition-transform duration-700">
                                    <svg className="w-24 h-24 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16L19.017 16C20.1216 16 21.017 16.8954 21.017 18L21.017 21L14.017 21ZM14.017 21L7.017 21L7.017 18C7.017 16.8954 7.91243 16 9.017 16L12.017 16C13.1216 16 14.017 16.8954 14.017 18L14.017 21ZM4.017 21L4.017 18C4.017 16.8954 4.91243 16 6.017 16L9.017 16C10.1216 16 11.017 16.8954 11.017 18L11.017 21L4.017 21Z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 relative">
                            {renderPlayer("aspect-square")}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-[4rem] -z-10 animate-pulse" />
                        </div>
                    </div>
                </div>
            } />
        );
    }

    if (v === 'floating') {
        return (
            <CraftWrapper id={id} child={
                <div id={id} className="py-20 px-6 max-w-6xl mx-auto relative group/floating">
                    <div className="relative">
                        {renderPlayer("aspect-video opacity-90 grayscale group-hover/floating:grayscale-0 group-hover/floating:opacity-100 transition-all duration-1000")}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 bg-white/20 backdrop-blur-md rounded-full border border-white/50 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-2xl z-20 pointer-events-none">
                            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                    </div>
                    <div className="mt-[-100px] relative z-30 max-w-xl mx-auto md:ml-0 bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 space-y-6 hover:-translate-y-2 transition-transform duration-500">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{caption || 'Live Broadcast'}</span>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{title || 'Modern Minimalism Overlapping Layout'}</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{subtitle || 'Exclusive Neighborhood Walkthrough'}</p>
                        </div>
                        <div className="pt-2">
                            {renderButton()}
                        </div>
                    </div>
                </div>
            } />
        );
    }

    // Default: minimal
    return (
        <CraftWrapper id={id} child={
            <div id={id} className="py-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-10 space-y-4">
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{title || 'Video Spotlight'}</h2>
                        {subtitle && <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>}
                    </div>
                    {renderButton()}
                </div>
                {renderPlayer("aspect-video ring-8 ring-slate-100 shadow-3xl")}
                {caption && <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{caption}</p>}
            </div>
        } />
    );
};
VideoSection.displayName = 'VideoSection';

// ─── Testimonials Section ─────────────────────────────────
export const TestimonialsSection = ({ title, testimonials, id }: {
    title?: string;
    testimonials?: { quote: string; author: string; role?: string }[];
    id?: string;
}) => {
    const items = testimonials?.length ? testimonials : [
        { quote: 'Working with this team was an absolute pleasure. They found us our dream home in under a month!', author: 'Sarah M.', role: 'Homebuyer' },
        { quote: 'Professional, knowledgeable, and always available. I couldn\'t have asked for a better experience.', author: 'James T.', role: 'Seller' },
        { quote: 'They turned what could have been a stressful process into a seamless journey. Highly recommended!', author: 'Emily R.', role: 'First-time Buyer' },
    ];
    return (
        <CraftWrapper id={id} child={
            <div id={id} className="py-20 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-4 tracking-tight">{title || 'What Our Clients Say'}</h2>
                    <div className="h-1 w-16 bg-indigo-600 rounded-full mx-auto mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {items.map((t, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, s) => (
                                        <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="font-black text-slate-900 text-sm">{t.author}</p>
                                    {t.role && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t.role}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        } />
    );
};

// ─── Stats / Counter Section ──────────────────────────────
export const StatsSection = ({ title, stats, id }: {
    title?: string;
    stats?: { value: string; label: string }[];
    id?: string;
}) => {
    const items = stats?.length ? stats : [
        { value: '500+', label: 'Properties Sold' },
        { value: '$2.1B', label: 'Total Sales Volume' },
        { value: '98%', label: 'Client Satisfaction' },
        { value: '15+', label: 'Years Experience' },
    ];
    return (
        <CraftWrapper id={id} child={
            <div id={id} className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="max-w-5xl mx-auto">
                    {title && <h2 className="text-2xl font-black text-white text-center mb-12 tracking-tight">{title}</h2>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {items.map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">{s.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        } />
    );
};

// ─── FAQ / Accordion Section ──────────────────────────────
export const FAQSection = ({ title, items, id }: {
    title?: string;
    items?: { question: string; answer: string }[];
    id?: string;
}) => {
    const faqs = items?.length ? items : [
        { question: 'How do I schedule a viewing?', answer: 'You can schedule a viewing by clicking the "Book a Tour" button on any listing, or by contacting us directly through our contact form.' },
        { question: 'What areas do you serve?', answer: 'We serve the Greater Toronto Area including downtown Toronto, North York, Scarborough, Mississauga, and surrounding neighborhoods.' },
        { question: 'Do you help with financing?', answer: 'While we are not financial advisors, we have partnerships with trusted mortgage brokers and can connect you with the right professionals.' },
    ];
    const [openIdx, setOpenIdx] = React.useState<number | null>(0);

    return (
        <CraftWrapper id={id} child={
            <div id={id} className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-4 tracking-tight">{title || 'Frequently Asked Questions'}</h2>
                    <div className="h-1 w-16 bg-indigo-600 rounded-full mx-auto mb-12" />
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setOpenIdx(openIdx === i ? null : i); }}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-bold text-slate-900 text-sm pr-4">{faq.question}</span>
                                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${openIdx === i ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </button>
                                {openIdx === i && (
                                    <div className="px-6 pb-6 -mt-2">
                                        <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        } />
    );
};

// ─── Newsletter / Email Signup Section ────────────────────
export const NewsletterSection = ({ title, subtitle, buttonText, bgColor, id }: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    bgColor?: string;
    id?: string;
}) => {
    return (
        <CraftWrapper id={id} child={
            <div id={id} className="py-20 px-6" style={{ backgroundColor: bgColor || '#4f46e5' }}>
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight">{title || 'Stay in the Loop'}</h2>
                    <p className="text-white/70 text-sm font-medium mb-8">{subtitle || 'Get the latest listings and market insights delivered to your inbox.'}</p>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm font-medium outline-none focus:bg-white/20 transition-all backdrop-blur-sm"
                            readOnly
                        />
                        <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg whitespace-nowrap">
                            {buttonText || 'Subscribe'}
                        </button>
                    </div>
                </div>
            </div>
        } />
    );
};

// ─── Gallery / Image Grid Section ─────────────────────────
export const GallerySection = ({ title, images, columns, variant, id }: {
    title?: string;
    images?: string[];
    columns?: 2 | 3 | 4;
    variant?: 'grid' | 'masonry' | 'minimal';
    id?: string;
}) => {
    const defaultImages = [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600',
    ];
    const imgs = images?.length ? images : defaultImages;
    const cols = columns || 3;
    const activeVariant = variant || 'grid';

    const renderGrid = () => {
        const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4' };
        return (
            <div className={`grid ${colClass[cols]} gap-6`}>
                {imgs.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-50 group-hover:scale-100 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderMasonry = () => {
        return (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {imgs.map((img, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden group break-inside-avoid shadow-sm hover:shadow-xl transition-all duration-500">
                        <img src={img} alt="" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        );
    };

    const renderMinimal = () => {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {imgs.map((img, i) => (
                    <div key={i} className="relative aspect-[3/4] overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/40 transition-colors mix-blend-multiply" />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <CraftWrapper id={id} child={
            <div id={id} className={`py-20 px-6 ${activeVariant === 'minimal' ? 'bg-slate-950' : 'bg-white'}`}>
                <div className={activeVariant === 'minimal' ? 'max-w-full px-2' : 'max-w-7xl mx-auto'}>
                    {title && (
                        <div className="text-center mb-16">
                            <h2 className={`text-4xl font-black ${activeVariant === 'minimal' ? 'text-white' : 'text-slate-900'} tracking-tight mb-4`}>{title}</h2>
                            <div className="h-1.5 w-20 bg-indigo-600 rounded-full mx-auto" />
                        </div>
                    )}

                    {activeVariant === 'grid' && renderGrid()}
                    {activeVariant === 'masonry' && renderMasonry()}
                    {activeVariant === 'minimal' && renderMinimal()}
                </div>
            </div>
        } />
    );
};
GallerySection.displayName = 'GallerySection';

// ─── Communities / Neighborhoods Section ───────────────────
export const CommunitiesSection = ({ title, subtitle, items, variant, id }: {
    title?: string;
    subtitle?: string;
    items?: { title: string; image: string; count: number }[];
    variant?: 'grid' | 'list' | 'featured';
    id?: string;
}) => {
    const defaultItems = [
        { title: 'Toronto West', image: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&q=80&w=800', count: 42 },
        { title: 'King West', image: 'https://images.unsplash.com/photo-1503125203510-19a923b7418a?auto=format&fit=crop&q=80&w=800', count: 18 },
        { title: 'Yorkville', image: 'https://images.unsplash.com/photo-1507914372368-b2b0ef58dbc1?auto=format&fit=crop&q=80&w=800', count: 24 },
        { title: 'Harbourfront', image: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=800', count: 12 },
    ];
    const displayItems = items || defaultItems;
    const activeVariant = variant || 'grid';

    const renderGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayItems.map((item, i) => (
                <div key={i} className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8">
                        <p className="text-white text-2xl font-black mb-1">{item.title}</p>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{item.count} Listings</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderList = () => (
        <div className="max-w-4xl mx-auto space-y-4">
            {displayItems.map((item, i) => (
                <div key={i} className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all group">
                    <div className="h-20 w-32 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Communities</p>
                    </div>
                    <div className="px-6 py-2 bg-indigo-50 rounded-full text-indigo-600 font-black text-xs uppercase tracking-widest">
                        {item.count} Units
                    </div>
                </div>
            ))}
        </div>
    );

    const renderFeatured = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayItems.slice(0, 2).map((item, i) => (
                <div key={i} className="relative aspect-video rounded-[3rem] overflow-hidden group border-8 border-white shadow-2xl">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-indigo-950/20 mix-blend-multiply group-hover:bg-transparent transition-colors" />
                    <div className="absolute inset-0 p-12 flex flex-col justify-end">
                        <span className="w-fit px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">Master Planned</span>
                        <h3 className="text-white text-5xl font-black tracking-tighter drop-shadow-2xl">{item.title}</h3>
                        <button className="mt-6 w-fit text-white font-bold text-sm border-b-2 border-white/50 pb-1 hover:border-white transition-all italic">Explore Neighborhood →</button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <CraftWrapper id={id} child={
            <div id={id} className={`py-24 px-6 ${activeVariant === 'list' ? 'bg-white' : 'bg-slate-50'}`}>
                <div className="max-w-7xl mx-auto">
                    {(title || subtitle) && (
                        <div className="mb-16">
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{title || 'Discover Neighborhoods'}</h2>
                            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">{subtitle || 'Find the place that fits your personality and lifestyle.'}</p>
                            <div className="h-1.5 w-24 bg-indigo-600 mt-8 rounded-full" />
                        </div>
                    )}
                    {activeVariant === 'grid' && renderGrid()}
                    {activeVariant === 'list' && renderList()}
                    {activeVariant === 'featured' && renderFeatured()}
                </div>
            </div>
        } />
    );
};
CommunitiesSection.displayName = 'CommunitiesSection';

// ─── Map / Location Section ───────────────────────────────
export const MapSection = ({ address, title, subtitle, id }: { address?: string; title?: string; subtitle?: string; id?: string }) => {
    const mapQuery = encodeURIComponent(address || '40 King Street West, Toronto, ON');
    return (
        <CraftWrapper id={id} child={
            <div id={id} className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    {title && (
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{title}</h2>
                            {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
                        </div>
                    )}
                    <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100">
                        <iframe
                            src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                            className="absolute inset-0 w-full h-full border-none"
                            loading="lazy"
                            title="Location Map"
                        />
                    </div>
                    {address && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500 font-medium">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {address}
                        </div>
                    )}
                </div>
            </div>
        } />
    );
};

// ═══════════════════════════════════════════════════════════
//  CRAFT SETTINGS
// ═══════════════════════════════════════════════════════════

HeroSection.craft = {
    props: { content: { headline: 'Your Signature Address' } },
    displayName: 'HeroSection'
};
ListingsSection.craft = {
    props: { content: { title: 'Curated Portfolio' } },
    displayName: 'ListingsSection'
};
AgentProfilesSection.craft = {
    displayName: 'AgentProfilesSection'
};
ContactSection.craft = {
    displayName: 'ContactSection'
};
TextSection.craft = {
    props: { text: 'Elevating real estate through design.' },
    displayName: 'TextSection'
};
ImageSection.craft = {
    displayName: 'ImageSection'
};

// New components
HeadingSection.craft = {
    props: { text: 'Your Heading Here', level: 'h2', align: 'center' },
    displayName: 'HeadingSection'
};
SpacerSection.craft = {
    props: { height: 60 },
    displayName: 'SpacerSection'
};
DividerSection.craft = {
    props: { style: 'gradient', color: '#e2e8f0' },
    displayName: 'DividerSection'
};
ButtonSection.craft = {
    props: { label: 'Get Started', href: '#', variant: 'primary', align: 'center' },
    displayName: 'ButtonSection'
};
VideoSection.craft = {
    props: {
        url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        caption: 'Property Tour',
        title: 'Experience Innovation',
        subtitle: 'Watch our vision come to life',
        buttonLabel: 'Watch Full Tour',
        buttonColor: '#4f46e5',
        buttonHref: '#'
    },
    displayName: 'VideoSection'
};
TestimonialsSection.craft = {
    props: { title: 'What Our Clients Say' },
    displayName: 'TestimonialsSection'
};
StatsSection.craft = {
    props: { title: 'Our Track Record' },
    displayName: 'StatsSection'
};
FAQSection.craft = {
    props: { title: 'Frequently Asked Questions' },
    displayName: 'FAQSection'
};
NewsletterSection.craft = {
    props: { title: 'Stay in the Loop', subtitle: 'Get the latest listings and market insights.', buttonText: 'Subscribe', bgColor: '#4f46e5' },
    displayName: 'NewsletterSection'
};
GallerySection.craft = {
    props: { title: 'Photo Gallery', columns: 3 },
    displayName: 'GallerySection'
};
MapSection.craft = {
    props: { address: '40 King Street West, Toronto, ON', title: 'Visit Our Office' },
    displayName: 'MapSection'
};

ListingDetailSection.craft = {
    displayName: 'ListingDetailSection'
};

AgentDetailSection.craft = {
    displayName: 'AgentDetailSection'
};

CommunitiesSection.craft = {
    props: { title: 'Discover Neighborhoods', variant: 'grid' },
    displayName: 'CommunitiesSection'
};

FeaturedListingsSection.craft = {
    props: { content: { title: 'Featured Properties' } },
    displayName: 'FeaturedListingsSection'
};

