'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { CustomPage, PageBlock, BlockType } from '@repo/types';
import { PageBlockRenderer, Navbar, Footer } from '@repo/ui';
import { useNotificationStore } from '@repo/services';

const BLOCK_DEFINITIONS: Record<BlockType, { name: string; icon: string; defaultContent: any }> = {
    text: { name: 'Rich Text', icon: 'T', defaultContent: { text: 'Enter your content here...' } },
    image: { name: 'Full Image', icon: 'I', defaultContent: { url: '', caption: '' } },
    text_image: { name: 'Text + Image', icon: 'TI', defaultContent: { text: '', url: '', layout: 'left' } },
    cta: { name: 'Call to Action', icon: '!', defaultContent: { label: 'Click Here', href: '#' } },
    gallery: { name: 'Image Gallery', icon: 'G', defaultContent: { images: [] } },
    video: { name: 'Video Embed', icon: 'V', defaultContent: { url: '', platform: 'youtube' } },
};

const SYSTEM_RESERVED_SLUGS = ['search', 'listings', 'dashboard', 'login', 'admin', 'api'];

export default function PageBuilderEditor() {
    const params = useParams();
    const router = useRouter();
    const [page, setPage] = useState<CustomPage>({
        id: params.id as string,
        tenantId: 't-1',
        title: 'New Custom Page',
        slug: 'new-page',
        blocks: [],
        isPublished: false,
        sortOrder: 0,
        seo: { title: '', description: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [slugError, setSlugError] = useState('');
    const [showSeoSettings, setShowSeoSettings] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const validateSlug = (slug: string) => {
        if (SYSTEM_RESERVED_SLUGS.includes(slug.toLowerCase())) {
            setSlugError('This is a reserved system URL.');
            return false;
        }
        setSlugError('');
        return true;
    };

    const addBlock = (type: BlockType) => {
        const newBlock: PageBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: { ...BLOCK_DEFINITIONS[type].defaultContent },
            order: page.blocks.length
        };
        setPage({ ...page, blocks: [...page.blocks, newBlock] });
        setActiveBlockId(newBlock.id);
    };

    const removeBlock = (id: string) => {
        setPage({ ...page, blocks: page.blocks.filter(b => b.id !== id) });
        if (activeBlockId === id) setActiveBlockId(null);
    };

    const updateBlockContent = (id: string, newContent: any) => {
        setPage({
            ...page,
            blocks: page.blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b)
        });
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...page.blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setPage({ ...page, blocks: newBlocks.map((b, i) => ({ ...b, order: i })) });
    };

    const activeBlock = page.blocks.find(b => b.id === activeBlockId);

    return (
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push('/website-builder/pages' as Route)}
                        className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <input
                            type="text"
                            value={page.title}
                            onChange={e => setPage({ ...page, title: e.target.value })}
                            className="text-2xl font-black text-slate-900 focus:outline-none focus:text-indigo-600 bg-transparent"
                            placeholder="Untitiled Page"
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug:</span>
                            <span className="text-[10px] font-bold text-slate-400 italic">/pages/</span>
                            <input
                                type="text"
                                value={page.slug}
                                onChange={e => {
                                    setPage({ ...page, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                                    validateSlug(e.target.value);
                                }}
                                className={`text-[10px] font-black uppercase tracking-widest bg-transparent border-b ${slugError ? 'border-red-500 text-red-500' : 'border-slate-200 text-indigo-600'}`}
                            />
                            {slugError && <span className="text-[9px] font-bold text-red-500 italic">{slugError}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSeoSettings(true)}
                        className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2 group"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">SEO Settings</span>
                    </button>
                    <div className="flex items-center gap-2 mr-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Draft</span>
                        <button
                            onClick={() => setPage({ ...page, isPublished: !page.isPublished })}
                            className={`relative w-12 h-6 rounded-full transition-all duration-500 ${page.isPublished ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all transform duration-500 ${page.isPublished ? 'left-7' : 'left-1'}`} />
                        </button>
                        <span>Published</span>
                    </div>
                    <button
                        onClick={() => setPreviewMode(true)}
                        className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm font-black hover:border-slate-400 transition-all mr-2"
                    >
                        Live Preview
                    </button>
                    <button
                        onClick={() => {
                            useNotificationStore.getState().addNotification({
                                type: 'success',
                                title: 'Website Synced',
                                message: 'Global changes have been pushed to the edge cache.'
                            });
                        }}
                        className="px-10 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/10"
                    >
                        Sync Website
                    </button>
                </div>
            </div>

            {/* SEO Settings Panel */}
            {showSeoSettings && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-end p-0 animate-in fade-in slide-in-from-right duration-300">
                    <div className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">
                                    SEO <span className="text-indigo-600">Architect</span>
                                </h3>
                                <p className="text-slate-400 font-bold mt-2">Configure search indexing and social visibility for this page.</p>
                            </div>
                            <button
                                onClick={() => setShowSeoSettings(false)}
                                className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all"
                            >
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Meta Title Override</label>
                                    <input
                                        type="text"
                                        value={page.seo.title}
                                        onChange={e => setPage({ ...page, seo: { ...page.seo, title: e.target.value } })}
                                        placeholder={page.title}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium italic">Recommended: 50-60 characters. Current: {page.seo.title.length}</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
                                    <textarea
                                        value={page.seo.description}
                                        onChange={e => setPage({ ...page, seo: { ...page.seo, description: e.target.value } })}
                                        placeholder="Briefly describe the content of this page for search engines..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[120px] resize-none"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium italic">Recommended: 150-160 characters. Current: {page.seo.description.length}</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Canonical URL Lock</label>
                                    <input
                                        type="text"
                                        value={page.seo.canonicalUrl || ''}
                                        onChange={e => setPage({ ...page, seo: { ...page.seo, canonicalUrl: e.target.value } })}
                                        placeholder="https://yourdomain.com/pages/your-page"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all font-inter text-xs"
                                    />
                                </div>

                                <div className="pt-8 border-t border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Social Sharing Signature (Open Graph)</h4>

                                    <div className="space-y-6">
                                        <div className="aspect-[1.91/1] bg-slate-100 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group cursor-pointer hover:border-indigo-400 transition-all">
                                            {page.seo.ogImage ? (
                                                <img src={page.seo.ogImage} className="w-full h-full object-cover rounded-[30px]" />
                                            ) : (
                                                <>
                                                    <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload OG Image (1200x630)</p>
                                                </>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">OG Title</label>
                                            <input
                                                type="text"
                                                value={page.seo.ogTitle || ''}
                                                onChange={e => setPage({ ...page, seo: { ...page.seo, ogTitle: e.target.value } })}
                                                placeholder="Title for Facebook/Twitter sharing..."
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">OG Description</label>
                                            <textarea
                                                value={page.seo.ogDescription || ''}
                                                onChange={e => setPage({ ...page, seo: { ...page.seo, ogDescription: e.target.value } })}
                                                placeholder="Description for social snippets..."
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-slate-100 flex gap-4 bg-white">
                            <button
                                onClick={() => setShowSeoSettings(false)}
                                className="flex-1 py-5 rounded-[24px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-2xl"
                            >
                                Apply SEO Config
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex gap-8 min-h-0">
                {/* Block List / Toolset */}
                <div className="w-80 flex flex-col gap-8 shrink-0">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex-1 flex flex-col">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Component Palette</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {(Object.keys(BLOCK_DEFINITIONS) as BlockType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => addBlock(type)}
                                    className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-lg transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg font-black text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 mb-2">
                                        {BLOCK_DEFINITIONS[type].icon}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{BLOCK_DEFINITIONS[type].name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Canvas */}
                <div className="flex-1 bg-slate-100 rounded-[48px] border-2 border-dashed border-slate-200 p-10 overflow-y-auto scrollbar-hide flex flex-col items-center gap-6">
                    {page.blocks.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-center">
                            <div className="max-w-xs space-y-4 opacity-40">
                                <div className="h-24 w-24 rounded-full border-4 border-dashed border-slate-400 mx-auto" />
                                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Canvas is Empty</p>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed italic">Start adding blocks from the palette to architect your custom page content.</p>
                            </div>
                        </div>
                    ) : (
                        page.blocks.map((block, index) => (
                            <div
                                key={block.id}
                                onClick={() => setActiveBlockId(block.id)}
                                className={`w-full max-w-3xl p-8 rounded-[36px] bg-white border-2 transition-all cursor-pointer relative group ${activeBlockId === block.id ? 'border-indigo-500 shadow-2xl' : 'border-transparent hover:border-slate-200'
                                    }`}
                            >
                                {/* Block Controls */}
                                <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }}
                                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }}
                                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 shadow-sm mt-4"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-4 border-b border-slate-50 pb-4">
                                    <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-black text-white">
                                        {BLOCK_DEFINITIONS[block.type].icon}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{BLOCK_DEFINITIONS[block.type].name} Block</span>
                                </div>

                                {/* Mock Preview of Block Content */}
                                <div className="space-y-4">
                                    {block.type === 'text' && (
                                        <p className="text-slate-900 font-medium leading-relaxed">{(block.content as any).text}</p>
                                    )}
                                    {block.type === 'image' && (
                                        <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center overflow-hidden">
                                            {(block.content as any).url ? <img src={(block.content as any).url} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-slate-300 uppercase italic">Image Placeholder</span>}
                                        </div>
                                    )}
                                    {block.type === 'cta' && (
                                        <div className="py-4 flex justify-center">
                                            <button className="px-12 py-4 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-widest">{(block.content as any).label}</button>
                                        </div>
                                    )}
                                    {block.type === 'video' && (
                                        <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center">
                                            <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                        </div>
                                    )}
                                    {block.type === 'text_image' && (
                                        <div className={`flex items-center gap-8 ${(block.content as any).layout === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className="flex-1 space-y-3">
                                                <h4 className="text-xl font-black text-slate-900 leading-tight">High Impact Headline</h4>
                                                <p className="text-slate-500 font-medium">{(block.content as any).text || 'Complementary narrative text for your imagery.'}</p>
                                            </div>
                                            <div className="flex-1 aspect-video bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
                                                {(block.content as any).url ? <img src={(block.content as any).url} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-slate-300 uppercase italic">Image</span>}
                                            </div>
                                        </div>
                                    )}
                                    {block.type === 'gallery' && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Properties Inspector */}
                <div className="w-96 flex flex-col gap-8 shrink-0">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex-1 overflow-y-auto">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Properties Inspector</h3>

                        {activeBlock ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-3">
                                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Block Type</p>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{BLOCK_DEFINITIONS[activeBlock.type].name}</p>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-slate-50">
                                    {activeBlock.type === 'text' && (
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Visual Text Content</label>
                                            <textarea
                                                value={(activeBlock.content as any).text}
                                                onChange={e => updateBlockContent(activeBlock.id, { text: e.target.value })}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[200px]"
                                            />
                                        </div>
                                    )}
                                    {activeBlock.type === 'text_image' && (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Layout Orientation</label>
                                                <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1.5">
                                                    <button
                                                        onClick={() => updateBlockContent(activeBlock.id, { layout: 'left' })}
                                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(activeBlock.content as any).layout === 'left' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        Image Left
                                                    </button>
                                                    <button
                                                        onClick={() => updateBlockContent(activeBlock.id, { layout: 'right' })}
                                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(activeBlock.content as any).layout === 'right' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        Image Right
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Image Source URL</label>
                                                <input
                                                    type="text"
                                                    value={(activeBlock.content as any).url}
                                                    onChange={e => updateBlockContent(activeBlock.id, { url: e.target.value })}
                                                    placeholder="https://..."
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Story Text</label>
                                                <textarea
                                                    value={(activeBlock.content as any).text}
                                                    onChange={e => updateBlockContent(activeBlock.id, { text: e.target.value })}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[120px]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeBlock.type === 'gallery' && (
                                        <div className="space-y-6">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Gallery Orchestration</label>
                                            <div className="p-8 border-2 border-dashed border-slate-200 rounded-[32px] text-center bg-slate-50/50">
                                                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multi-upload Images</p>
                                            </div>
                                        </div>
                                    )}
                                    {activeBlock.type === 'image' && (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Image Source URL</label>
                                                <input
                                                    type="text"
                                                    value={(activeBlock.content as any).url}
                                                    onChange={e => updateBlockContent(activeBlock.id, { url: e.target.value })}
                                                    placeholder="https://..."
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Display Caption</label>
                                                <input
                                                    type="text"
                                                    value={(activeBlock.content as any).caption}
                                                    onChange={e => updateBlockContent(activeBlock.id, { caption: e.target.value })}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeBlock.type === 'cta' && (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Button Label</label>
                                                <input
                                                    type="text"
                                                    value={(activeBlock.content as any).label}
                                                    onChange={e => updateBlockContent(activeBlock.id, { label: e.target.value })}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Destination URL</label>
                                                <input
                                                    type="text"
                                                    value={(activeBlock.content as any).href}
                                                    onChange={e => updateBlockContent(activeBlock.id, { href: e.target.value })}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeBlock.type === 'video' && (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Video URL (YouTube/Vimeo)</label>
                                                <input
                                                    type="text"
                                                    value={(activeBlock.content as any).url}
                                                    onChange={e => updateBlockContent(activeBlock.id, { url: e.target.value })}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 opacity-30 italic font-bold text-slate-400 text-sm">
                                Select a block on the canvas to edit its identity properties.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Properties Inspector Implementation (Already exists in the file, keeping it for context) */}

            {/* Live Preview System for Custom Pages */}
            {previewMode && (
                <div className="fixed inset-0 bg-slate-900/95 z-[100] flex flex-col items-center animate-in fade-in duration-500">
                    <div className="w-full h-24 bg-slate-900 border-b border-white/5 flex items-center justify-between px-12 shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white">RE</div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Page Projection</h4>
                                <p className="text-slate-500 text-[9px] font-bold italic tracking-wide">Route: /pages/{page.slug} • Draft State</p>
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

                        <button
                            onClick={() => setPreviewMode(false)}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-sm transition-all border border-white/10 flex items-center gap-2"
                        >
                            Close Preview
                        </button>
                    </div>

                    <div className="flex-1 w-full overflow-y-auto p-12 flex justify-center scrollbar-hide">
                        <div className={`bg-white shadow-2xl transition-all duration-700 overflow-hidden relative ${previewDevice === 'desktop' ? 'w-full' :
                            previewDevice === 'tablet' ? 'w-[768px]' : 'w-[414px]'
                            } h-fit min-h-full rounded-[48px]`}
                        >
                            <Navbar />
                            <div className="animate-in fade-in zoom-in-95 duration-1000">
                                <PageBlockRenderer blocks={page.blocks} />
                            </div>
                            <Footer />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
