'use client';

import React, { useState, useEffect } from 'react';
import { SectionConfig, SectionType, WebsiteInstance, ShortcodeConfig } from '@repo/types';
import { SectionRenderer, Navbar, Footer } from '@repo/ui';
import { getWebsiteByAgentId, updateWebsiteInstance, shortcodeConfigService } from '@repo/services';
import { useSearchParams } from 'next/navigation';

// Field labels/descriptions logic for builder
const FIELD_PROFILES: Record<string, { label: string; placeholder: string; type: 'text' | 'textarea' | 'image' | 'shortcode' }> = {
    headline: { label: 'Primary Headline', placeholder: 'Enter a bold headline...', type: 'textarea' },
    subheadline: { label: 'Supporting Subline', placeholder: 'Add more context...', type: 'textarea' },
    buttonText: { label: 'Action Button Label', placeholder: 'e.g. Call Now', type: 'text' },
    bgImage: { label: 'Background Image Path', placeholder: '/images/hero.jpg', type: 'image' },
    title: { label: 'Section Title', placeholder: 'e.g. Recent Success', type: 'text' },
    subtitle: { label: 'Section Subtitle', placeholder: 'Small descriptive text...', type: 'text' },
    maxItems: { label: 'Items to Show', placeholder: '6', type: 'text' },
    shortcodeName: { label: 'Listing Source (Shortcode)', placeholder: 'Select a filter config...', type: 'shortcode' },
    shortcode: { label: 'Dynamic Listing Shortcode', placeholder: '[listings city="Toronto"]', type: 'shortcode' },
};

const SECTION_TYPES_METADATA: Record<SectionType, { name: string; description: string; icon: string }> = {
    hero: { name: 'Hero Header', description: 'Impact visual with call-to-action', icon: 'H' },
    featured_listings: { name: 'Properties', description: 'Dynamic listing showcase', icon: 'L' },
    how_it_works: { name: 'Workflow', description: 'Process steps for clients', icon: 'W' },
    testimonials: { name: 'Social Proof', description: 'Client reviews and ratings', icon: 'T' },
    stats: { name: 'Metrics', description: 'Sales and success counters', icon: 'S' },
    contact_cta: { name: 'Contact Trigger', description: 'Persistent conversion banner', icon: 'C' },
    blog_preview: { name: 'Insights', description: 'Latest market news feed', icon: 'B' },
    newsletter: { name: 'Lead Grab', description: 'Email subscription capture', icon: 'N' },
    about_banner: { name: 'About', description: 'Professional biography/intro', icon: 'A' },
    gallery: { name: 'Gallery', description: 'Visual asset showcase', icon: 'G' },
    communities: { name: 'Communities', description: 'Neighborhood focus areas', icon: 'P' }
};

export default function WebsiteBuilderPage() {
    const searchParams = useSearchParams();
    const agentId = searchParams.get('agentId');

    // Website Instance State
    const [instance, setInstance] = useState<WebsiteInstance | null>(null);
    const [sections, setSections] = useState<SectionConfig[]>([]);
    const [branding, setBranding] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // UI State
    const [editingSection, setEditingSection] = useState<SectionConfig | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    // Shortcode Management State
    const [shortcodes, setShortcodes] = useState<ShortcodeConfig[]>([]);
    const [showShortcodeManager, setShowShortcodeManager] = useState(false);
    const [editingShortcode, setEditingShortcode] = useState<Partial<ShortcodeConfig> | null>(null);

    useEffect(() => {
        const fetchInstance = async () => {
            if (!agentId) return;
            try {
                const ws = await getWebsiteByAgentId(agentId);
                if (ws) {
                    setInstance(ws);
                    setSections(ws.layoutConfig?.sections || []);
                    setBranding(ws.brandingConfig || {});

                    // Fetch associated shortcodes
                    const configs = shortcodeConfigService.getConfigs({
                        websiteId: ws.id,
                        tenantId: ws.tenantId,
                        role: 'client_admin'
                    });
                    setShortcodes(configs);
                }
            } catch (err) {
                console.error('Failed to load website instance', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInstance();
    }, [agentId]);

    const handleSave = async () => {
        if (!instance) return;
        setSaving(true);
        try {
            await updateWebsiteInstance(instance.id, {
                layoutConfig: { ...instance.layoutConfig, sections },
                brandingConfig: branding
            });
            alert('Website Synchronized Successfully!');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const toggleVisibility = (id: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setSections(newSections.map((s, i) => ({ ...s, order: i })));
    };

    const updateSectionContent = (id: string, field: string, value: string) => {
        setSections(sections.map(s => {
            if (s.id === id) {
                return { ...s, content: { ...s.content, [field]: value } };
            }
            return s;
        }));
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-indigo-600">Syncing Architecture...</div>;

    if (!instance) return (
        <div className="p-20 text-center space-y-4">
            <h1 className="text-4xl font-black italic">Instance Not Found</h1>
            <p className="text-slate-400">Ensure the agent has been assigned a template first.</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Context Badge */}
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-xl shadow-indigo-500/20 animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center font-black">
                        A
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Managing Associate Branding</p>
                        <p className="font-bold">Agent Identity Engine — {instance.domain}</p>
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = '/team'}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Return to Team
                </button>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Enterprise Builder</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                        Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 italic">Architect</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Customize branding and layout for the agent website. Changes will modify the underlying JSON configuration for this specific instance.
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
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-emerald-600 disabled:bg-slate-300 transition-all shadow-xl shadow-emerald-500/10"
                    >
                        {saving ? 'Transmitting...' : 'Sync Identity'}
                    </button>
                </div>
            </div>

            {/* Main Builder Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Section List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-4 px-4">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Home Structure</h2>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 italic">
                            Instance ID: {instance.id}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {sections.sort((a, b) => (a.order || 0) - (b.order || 0)).map((section, index) => (
                            <div
                                key={section.id}
                                className={`group flex items-center gap-6 p-6 rounded-[32px] bg-white border h-32 transition-all duration-300 ${section.isVisible ? 'border-slate-200 shadow-sm' : 'border-slate-100 bg-slate-50/50 opacity-60'
                                    } hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5`}
                            >
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

                                <div className="flex-1 flex items-center gap-6">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${section.isLocked ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
                                        }`}>
                                        {SECTION_TYPES_METADATA[section.type]?.icon || '?'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-black text-slate-900">{section.title}</h3>
                                            {section.isLocked && (
                                                <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v2a2 2 0 012 2v5a2 2 0 01-2-2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                                    Locked
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-slate-400">{SECTION_TYPES_METADATA[section.type]?.name || 'Custom Section'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleVisibility(section.id)}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-500 ${section.isVisible ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all transform duration-500 ${section.isVisible ? 'left-7' : 'left-1'}`} />
                                    </button>
                                    <button
                                        onClick={() => setEditingSection(section)}
                                        className="px-6 py-3 rounded-2xl bg-slate-50 text-xs font-black text-slate-600 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest shadow-sm"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Branding Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm space-y-8">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Branding Configuration</h2>

                        <div className="space-y-4">
                            <label className="block space-y-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Primary Identity Color</span>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        value={branding?.primaryColor || '#4f46e5'}
                                        onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
                                        className="h-12 w-12 rounded-xl outline-none cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={branding?.primaryColor || '#4f46e5'}
                                        onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
                                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold uppercase"
                                    />
                                </div>
                            </label>

                            <label className="block space-y-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Logo (URL)</span>
                                <input
                                    type="text"
                                    placeholder="/logos/agent-logo.png"
                                    value={branding?.logoUrl || ''}
                                    onChange={e => setBranding({ ...branding, logoUrl: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold bg-slate-50"
                                />
                            </label>

                            <label className="block space-y-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global Font Family</span>
                                <select
                                    value={branding?.fontHeading || 'Inter'}
                                    onChange={e => setBranding({ ...branding, fontHeading: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold bg-slate-50 appearance-none"
                                >
                                    <option value="Inter">Inter (Sans)</option>
                                    <option value="Playfair Display">Playfair (Serif)</option>
                                    <option value="Outfit">Outfit (Modern)</option>
                                </select>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <button
                                onClick={() => setShowShortcodeManager(true)}
                                className="w-full py-4 rounded-2xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Configure Listing Sources
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                            >
                                Commit All Architecture
                            </button>
                        </div>
                    </div>
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
                                <p className="text-slate-400 font-bold mt-2">Section Configuration — {SECTION_TYPES_METADATA[editingSection.type]?.name}</p>
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
                                "Updating content for {editingSection.title}. These changes apply the configuration directly to this specific agent's website instance."
                            </div>

                            {Object.entries(editingSection.content).filter(([k]) => !k.startsWith('_')).map(([field, value]) => {
                                const profile = FIELD_PROFILES[field];
                                if (!profile) return null;

                                return (
                                    <div key={field} className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            {profile.label}
                                            {profile.type === 'shortcode' && <span className="text-[9px] text-amber-500 bg-amber-50 px-2 rounded-md">Dynamic</span>}
                                        </label>

                                        {profile.type === 'shortcode' ? (
                                            <div className="space-y-3">
                                                <select
                                                    value={value as string}
                                                    onChange={e => updateSectionContent(editingSection.id, field, e.target.value)}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="">-- Platform Default --</option>
                                                    {shortcodes.map(sc => (
                                                        <option key={sc.id} value={sc.shortcodeName}>{sc.shortcodeName} ({sc.filters.city || 'All Cities'})</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => setShowShortcodeManager(true)}
                                                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                                >
                                                    + Create New Listing Source
                                                </button>
                                            </div>
                                        ) : profile.type === 'textarea' ? (
                                            <textarea
                                                value={value as string}
                                                onChange={e => updateSectionContent(editingSection.id, field, e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={value as string}
                                                onChange={e => updateSectionContent(editingSection.id, field, e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                        )}
                                        <p className="text-[10px] text-slate-400 italic">Field ID: <span className="font-mono">{field}</span></p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-10 border-t border-slate-100 flex gap-4 bg-white">
                            <button
                                onClick={() => setEditingSection(null)}
                                className="flex-1 py-5 rounded-[24px] bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest"
                            >
                                Close Editor
                            </button>
                            <button
                                onClick={handleSave}
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
            {/* Shortcode Management Modal */}
            {showShortcodeManager && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 leading-none mb-2">Listing <span className="text-indigo-600 italic">Architect</span></h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Configure Dynamic MLS Filtering Patterns</p>
                            </div>
                            <button
                                onClick={() => setShowShortcodeManager(false)}
                                className="h-14 w-14 rounded-2xl bg-white text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all border border-slate-200 shadow-sm"
                            >
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* List of existing */}
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Configuration Patterns</h4>
                                {shortcodes.length === 0 ? (
                                    <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-300 italic">
                                        No custom filter sets defined yet.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {shortcodes.map(sc => (
                                            <div key={sc.id} className="p-5 rounded-3xl border border-slate-100 hover:border-indigo-200 bg-slate-50/30 transition-all flex items-center justify-between group">
                                                <div>
                                                    <p className="font-black text-slate-900">{sc.shortcodeName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{sc.filters.city || 'All'} • {sc.filters.propertyType || 'Any'}</p>
                                                </div>
                                                <button
                                                    onClick={() => setEditingShortcode(sc)}
                                                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-indigo-600 text-white text-[9px] font-black rounded-xl transition-all"
                                                >
                                                    Modify
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setEditingShortcode({
                                        shortcodeName: 'newFilterset',
                                        filters: {},
                                        limit: 6,
                                        isActive: true,
                                        createdByRole: 'client_admin',
                                        tenantId: instance.tenantId,
                                        websiteId: instance.id
                                    })}
                                    className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    + Define New listing set
                                </button>
                            </div>

                            {/* Editor Form */}
                            {editingShortcode ? (
                                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Configuration Profile</h4>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Name (ID)</label>
                                            <input
                                                type="text"
                                                value={editingShortcode.shortcodeName || ''}
                                                onChange={e => setEditingShortcode({ ...editingShortcode, shortcodeName: e.target.value })}
                                                className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold"
                                                placeholder="e.g. luxuryCondos"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred City</label>
                                                <input
                                                    type="text"
                                                    value={editingShortcode.filters?.city || ''}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, filters: { ...editingShortcode.filters, city: e.target.value } })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold"
                                                    placeholder="Toronto"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                                                <input
                                                    type="text"
                                                    value={editingShortcode.filters?.propertyType as string || ''}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, filters: { ...editingShortcode.filters, propertyType: e.target.value } })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold"
                                                    placeholder="Condo"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Price</label>
                                                <input
                                                    type="number"
                                                    value={editingShortcode.filters?.minPrice || ''}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, filters: { ...editingShortcode.filters, minPrice: parseInt(e.target.value) } })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Price</label>
                                                <input
                                                    type="number"
                                                    value={editingShortcode.filters?.maxPrice || ''}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, filters: { ...editingShortcode.filters, maxPrice: parseInt(e.target.value) } })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Bedrooms</label>
                                                <input
                                                    type="number"
                                                    value={editingShortcode.filters?.bedrooms || ''}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, filters: { ...editingShortcode.filters, bedrooms: parseInt(e.target.value) } })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Bathrooms</label>
                                                <input
                                                    type="number"
                                                    value={editingShortcode.filters?.bathrooms || ''}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, filters: { ...editingShortcode.filters, bathrooms: parseInt(e.target.value) } })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Status</label>
                                                <select
                                                    value={editingShortcode.filters?.status as string || ''}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, filters: { ...editingShortcode.filters, status: e.target.value as any } })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold appearance-none"
                                                >
                                                    <option value="">Any Status</option>
                                                    <option value="FOR_SALE">Available (Sale)</option>
                                                    <option value="FOR_LEASE">Available (Lease)</option>
                                                    <option value="SOLD">Sold Properties</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort Order</label>
                                                <select
                                                    value={editingShortcode.sort || 'latest'}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, sort: e.target.value as any })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold appearance-none"
                                                >
                                                    <option value="latest">Newest First</option>
                                                    <option value="price_asc">Price (Low to High)</option>
                                                    <option value="price_desc">Price (High to Low)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Limit</label>
                                                <input
                                                    type="number"
                                                    value={editingShortcode.limit || 6}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, limit: parseInt(e.target.value) })}
                                                    className="w-full rounded-2xl border border-slate-100 px-4 py-3 bg-slate-50 font-bold"
                                                />
                                            </div>
                                            <div className="flex items-end pb-1 gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={editingShortcode.filters?.featured || false}
                                                    onChange={e => setEditingShortcode({ ...editingShortcode, filters: { ...editingShortcode.filters, featured: e.target.checked } })}
                                                    className="w-6 h-6 rounded-lg text-indigo-600 border-slate-200"
                                                />
                                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Featured Only</label>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    if (editingShortcode.id) {
                                                        const updated = shortcodeConfigService.updateConfig(editingShortcode.id, editingShortcode);
                                                        if (updated) setShortcodes(shortcodes.map(s => s.id === updated.id ? updated : s));
                                                    } else {
                                                        const created = shortcodeConfigService.createConfig(editingShortcode as any);
                                                        setShortcodes([...shortcodes, created]);
                                                    }
                                                    setEditingShortcode(null);
                                                }}
                                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200"
                                            >
                                                Save Pattern
                                            </button>
                                            <button
                                                onClick={() => setEditingShortcode(null)}
                                                className="px-6 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[40px] border border-slate-100">
                                    <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                    </div>
                                    <p className="text-center text-slate-400 text-sm font-medium leading-relaxed">
                                        Select a pattern on the left to modify its parameters, or define a new one to use in your listings sections.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-10 bg-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-white text-[10px]">AI</div>
                                <p className="text-white/60 font-medium text-[10px] uppercase tracking-widest">Neural Shortcode Engine V2.1 — Diffusion Ready</p>
                            </div>
                            <button
                                onClick={() => setShowShortcodeManager(false)}
                                className="px-8 py-3 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                            >
                                Optimized Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
