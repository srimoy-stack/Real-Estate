'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import {
    useTemplate,
    templateRegistry,
    TemplateModule,
    TemplateName
} from '@repo/ui';
import { HeroContent, ListingsSectionContent, AgentsContent, ContactCtaContent } from '@repo/types';

// Wrapper to inject Craft.js connectors + hover controls into each section
const CraftWrapper = ({ child }: { child: React.ReactNode }) => {
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

    if (!connect || !drag) return <>{child}</>;

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className="relative cursor-pointer group/section"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {child}

            {hovered && (
                <>
                    <div className="absolute inset-0 border-2 border-indigo-500/50 pointer-events-none z-40 rounded-sm" />
                    <div className="absolute top-2 left-2 z-50 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-lg pointer-events-none">
                        Click to Edit
                    </div>
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
                </>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
//  TEMPLATE-AWARE SECTIONS
// ═══════════════════════════════════════════════════════════

export const HeroSection = ({ content }: { content?: HeroContent }) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.Hero || templateRegistry['modern-realty'].Hero!;
    return <CraftWrapper child={<Component {...(content || {})} />} />;
};

export const ListingsSection = ({ content, filters, limit }: { content?: ListingsSectionContent; filters?: any; limit?: number }) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.Listings || templateRegistry['modern-realty'].Listings!;
    return <CraftWrapper child={<Component {...(content || {})} filters={filters || {}} limit={limit || 3} />} />;
};

export const AgentProfilesSection = ({ content }: { content?: AgentsContent }) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.Agents || templateRegistry['modern-realty'].Agents!;
    return <CraftWrapper child={<Component {...(content || {})} />} />;
};

export const ContactSection = ({ content }: { content?: ContactCtaContent }) => {
    const { templateId } = useTemplate();
    const template = templateRegistry[templateId as TemplateName] as TemplateModule;
    const Component = template?.Contact || templateRegistry['modern-realty'].Contact!;
    return <CraftWrapper child={<Component {...(content || {})} />} />;
};

// ═══════════════════════════════════════════════════════════
//  GENERIC SECTIONS
// ═══════════════════════════════════════════════════════════

export const TextSection = ({ text }: { text?: string }) => {
    return <CraftWrapper child={<div className="py-20 px-6 max-w-4xl mx-auto text-center"><p className="text-2xl text-slate-600 font-medium leading-relaxed">{text}</p></div>} />;
};

export const ImageSection = ({ url, caption }: { url?: string; caption?: string }) => {
    return (
        <CraftWrapper child={
            <div className="py-12 flex flex-col items-center">
                <img src={url} alt={caption} className="max-w-4xl w-full rounded-3xl shadow-2xl" />
                {caption && <p className="mt-4 text-sm text-slate-400 font-medium italic">{caption}</p>}
            </div>
        } />
    );
};

// ═══════════════════════════════════════════════════════════
//  NEW COMPONENTS
// ═══════════════════════════════════════════════════════════

// ─── Heading Section ──────────────────────────────────────
export const HeadingSection = ({ text, level, align }: { text?: string; level?: 'h1' | 'h2' | 'h3' | 'h4'; align?: 'left' | 'center' | 'right' }) => {
    const Tag = level || 'h2';
    const sizes = { h1: 'text-5xl', h2: 'text-4xl', h3: 'text-3xl', h4: 'text-2xl' };
    const alignment = { left: 'text-left', center: 'text-center', right: 'text-right' };
    return (
        <CraftWrapper child={
            <div className={`py-12 px-6 max-w-5xl mx-auto ${alignment[align || 'center']}`}>
                <Tag className={`${sizes[Tag]} font-black text-slate-900 tracking-tight leading-tight`}>
                    {text || 'Your Heading Here'}
                </Tag>
            </div>
        } />
    );
};

// ─── Spacer Section ───────────────────────────────────────
export const SpacerSection = ({ height }: { height?: number }) => {
    return (
        <CraftWrapper child={
            <div
                className="w-full relative group"
                style={{ height: `${height || 60}px` }}
            >
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{height || 60}px</span>
                    </div>
                </div>
            </div>
        } />
    );
};

// ─── Divider Section ──────────────────────────────────────
export const DividerSection = ({ style, color }: { style?: 'solid' | 'dashed' | 'dotted' | 'gradient'; color?: string }) => {
    return (
        <CraftWrapper child={
            <div className="py-8 px-6 max-w-5xl mx-auto">
                {style === 'gradient' ? (
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                ) : (
                    <hr
                        className="border-0 h-px"
                        style={{
                            borderTop: `1px ${style || 'solid'} ${color || '#e2e8f0'}`,
                            backgroundColor: 'transparent',
                        }}
                    />
                )}
            </div>
        } />
    );
};

// ─── Button Section ───────────────────────────────────────
export const ButtonSection = ({ label, href, variant, align }: { label?: string; href?: string; variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; align?: 'left' | 'center' | 'right' }) => {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20',
        secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg',
        outline: 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white',
        ghost: 'text-indigo-600 hover:bg-indigo-50',
    };
    const alignment = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };
    return (
        <CraftWrapper child={
            <div className={`py-8 px-6 flex ${alignment[align || 'center']}`}>
                <a
                    href={href || '#'}
                    className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${variants[variant || 'primary']}`}
                >
                    {label || 'Click Me'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </a>
            </div>
        } />
    );
};

// ─── Video Section ────────────────────────────────────────
export const VideoSection = ({ url, caption }: { url?: string; caption?: string }) => {
    const getEmbedUrl = (rawUrl: string) => {
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

    return (
        <CraftWrapper child={
            <div className="py-12 px-6 max-w-4xl mx-auto">
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-900">
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
                {caption && <p className="mt-4 text-center text-sm text-slate-400 font-medium italic">{caption}</p>}
            </div>
        } />
    );
};

// ─── Testimonials Section ─────────────────────────────────
export const TestimonialsSection = ({ title, testimonials }: {
    title?: string;
    testimonials?: { quote: string; author: string; role?: string }[];
}) => {
    const items = testimonials?.length ? testimonials : [
        { quote: 'Working with this team was an absolute pleasure. They found us our dream home in under a month!', author: 'Sarah M.', role: 'Homebuyer' },
        { quote: 'Professional, knowledgeable, and always available. I couldn\'t have asked for a better experience.', author: 'James T.', role: 'Seller' },
        { quote: 'They turned what could have been a stressful process into a seamless journey. Highly recommended!', author: 'Emily R.', role: 'First-time Buyer' },
    ];
    return (
        <CraftWrapper child={
            <div className="py-20 px-6 bg-slate-50">
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
export const StatsSection = ({ title, stats }: {
    title?: string;
    stats?: { value: string; label: string }[];
}) => {
    const items = stats?.length ? stats : [
        { value: '500+', label: 'Properties Sold' },
        { value: '$2.1B', label: 'Total Sales Volume' },
        { value: '98%', label: 'Client Satisfaction' },
        { value: '15+', label: 'Years Experience' },
    ];
    return (
        <CraftWrapper child={
            <div className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
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
export const FAQSection = ({ title, items }: {
    title?: string;
    items?: { question: string; answer: string }[];
}) => {
    const faqs = items?.length ? items : [
        { question: 'How do I schedule a viewing?', answer: 'You can schedule a viewing by clicking the "Book a Tour" button on any listing, or by contacting us directly through our contact form.' },
        { question: 'What areas do you serve?', answer: 'We serve the Greater Toronto Area including downtown Toronto, North York, Scarborough, Mississauga, and surrounding neighborhoods.' },
        { question: 'Do you help with financing?', answer: 'While we are not financial advisors, we have partnerships with trusted mortgage brokers and can connect you with the right professionals.' },
    ];
    const [openIdx, setOpenIdx] = React.useState<number | null>(0);

    return (
        <CraftWrapper child={
            <div className="py-20 px-6">
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
export const NewsletterSection = ({ title, subtitle, buttonText, bgColor }: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    bgColor?: string;
}) => {
    return (
        <CraftWrapper child={
            <div className="py-20 px-6" style={{ backgroundColor: bgColor || '#4f46e5' }}>
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
export const GallerySection = ({ title, images, columns }: {
    title?: string;
    images?: string[];
    columns?: 2 | 3 | 4;
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
    const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' };

    return (
        <CraftWrapper child={
            <div className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    {title && (
                        <>
                            <h2 className="text-3xl font-black text-slate-900 text-center mb-4 tracking-tight">{title}</h2>
                            <div className="h-1 w-16 bg-indigo-600 rounded-full mx-auto mb-12" />
                        </>
                    )}
                    <div className={`grid ${colClass[cols]} gap-4`}>
                        {imgs.map((img, i) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-shadow">
                                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        } />
    );
};

// ─── Map / Location Section ───────────────────────────────
export const MapSection = ({ address, title, subtitle }: { address?: string; title?: string; subtitle?: string }) => {
    const mapQuery = encodeURIComponent(address || '40 King Street West, Toronto, ON');
    return (
        <CraftWrapper child={
            <div className="py-16 px-6">
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
    displayName: 'Hero Section'
};
ListingsSection.craft = {
    props: { content: { title: 'Curated Portfolio' } },
    displayName: 'Listings Section'
};
AgentProfilesSection.craft = {
    displayName: 'Agents Section'
};
ContactSection.craft = {
    displayName: 'Contact Section'
};
TextSection.craft = {
    props: { text: 'Elevating real estate through design.' },
    displayName: 'Text Section'
};
ImageSection.craft = {
    displayName: 'Image Section'
};

// New components
HeadingSection.craft = {
    props: { text: 'Your Heading Here', level: 'h2', align: 'center' },
    displayName: 'Heading Section'
};
SpacerSection.craft = {
    props: { height: 60 },
    displayName: 'Spacer Section'
};
DividerSection.craft = {
    props: { style: 'gradient', color: '#e2e8f0' },
    displayName: 'Divider Section'
};
ButtonSection.craft = {
    props: { label: 'Get Started', href: '#', variant: 'primary', align: 'center' },
    displayName: 'Button Section'
};
VideoSection.craft = {
    props: { url: '', caption: '' },
    displayName: 'Video Section'
};
TestimonialsSection.craft = {
    props: { title: 'What Our Clients Say' },
    displayName: 'Testimonials Section'
};
StatsSection.craft = {
    props: { title: 'Our Track Record' },
    displayName: 'Stats Section'
};
FAQSection.craft = {
    props: { title: 'Frequently Asked Questions' },
    displayName: 'FAQ Section'
};
NewsletterSection.craft = {
    props: { title: 'Stay in the Loop', subtitle: 'Get the latest listings and market insights.', buttonText: 'Subscribe', bgColor: '#4f46e5' },
    displayName: 'Newsletter Section'
};
GallerySection.craft = {
    props: { title: 'Photo Gallery', columns: 3 },
    displayName: 'Gallery Section'
};
MapSection.craft = {
    props: { address: '40 King Street West, Toronto, ON', title: 'Visit Our Office' },
    displayName: 'Map Section'
};

