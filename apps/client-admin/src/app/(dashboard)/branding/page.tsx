'use client';

import React, { useState } from 'react';
import { useNotificationStore } from '@repo/services';

interface BrandingFormState {
    templateId: string;
    allowedTemplates: string[];
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    companyName: string;
    tagline: string;
    headerFont: string;
    bodyFont: string;
    social: {
        facebook: string;
        instagram: string;
        twitter: string;
        linkedin: string;
    };
    officeLocations: {
        address: string;
        city: string;
        phone: string;
        email: string;
    }[];
}

import { useSearchParams } from 'next/navigation';

const mockAgents: Record<string, { name: string; template: string }> = {
    '1': { name: 'David Armstrong', template: 'corporate-brokerage' },
    '2': { name: 'Sarah Jenkins', template: 'agent-portfolio' },
    '3': { name: 'Michael Chen', template: 'modern-realty' },
    '4': { name: 'Emily Park', template: 'agent-portfolio' },
    '5': { name: 'James Wilson', template: 'agent-portfolio' },
};

export default function BrandingPage() {
    const searchParams = useSearchParams();
    const agentId = searchParams.get('agentId');
    const targetAgent = agentId ? mockAgents[agentId] : null;

    const [form, setForm] = useState<BrandingFormState>({
        templateId: targetAgent ? targetAgent.template : 'modern-realty',
        allowedTemplates: targetAgent ? ['agent-portfolio', 'modern-realty', 'minimal-realty'] : ['modern-realty', 'luxury-estate', 'minimal-realty'],
        primaryColor: targetAgent ? '#4f46e5' : '#6366f1',
        secondaryColor: targetAgent ? '#7c3aed' : '#8b5cf6',
        logoUrl: '',
        faviconUrl: '',
        companyName: targetAgent ? targetAgent.name : 'Prestige Realty',
        tagline: targetAgent ? 'Expert Guidance, Personal Touch' : 'Luxury Living, Redefined',
        headerFont: 'Inter',
        bodyFont: 'Inter',
        social: {
            facebook: `https://facebook.com/${targetAgent ? targetAgent.name.toLowerCase().replace(' ', '') : 'prestigerealty'}`,
            instagram: `https://instagram.com/${targetAgent ? targetAgent.name.toLowerCase().replace(' ', '') : 'prestigerealty'}`,
            twitter: `https://twitter.com/${targetAgent ? targetAgent.name.toLowerCase().replace(' ', '') : 'prestigerealty'}`,
            linkedin: `https://linkedin.com/in/${targetAgent ? targetAgent.name.toLowerCase().replace(' ', '') : 'prestigerealty'}`,
        },
        officeLocations: [
            {
                address: '123 Luxury Ave',
                city: 'Beverly Hills, CA',
                phone: '+1 (555) 123-4567',
                email: targetAgent ? `${targetAgent.name.toLowerCase().replace(' ', '.')}@prestigerealty.com` : 'contact@prestigerealty.com'
            }
        ]
    });

    const [previewTemplate, setPreviewTemplate] = useState<{ id: string, name: string } | null>(null);
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        if (!form.companyName.trim()) {
            setError('Legal Identity is required');
            return;
        }
        setError(null);
        setIsSaving(true);

        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: targetAgent ? 'Agent Branding Synced' : 'Corporate Branding Saved',
                message: targetAgent
                    ? `Changes for ${targetAgent.name} have been propagated to their personal site.`
                    : 'Your website branding has been updated and published.'
            });
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    return (
        <div className="space-y-10">
            {/* Context Badge */}
            {targetAgent && (
                <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-xl shadow-emerald-500/20 animate-in slide-in-from-top duration-500 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center font-black">
                            {targetAgent.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Managing Associate Branding</p>
                            <p className="font-bold">{targetAgent.name} — Personal Identity</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '/team'}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Return to Team
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="h-1 w-8 bg-indigo-600 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">{targetAgent ? 'Personal Identity' : 'Brand Identity'}</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                    {targetAgent ? 'Agent' : 'Website'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Branding</span>
                </h1>
                <p className="text-lg text-slate-600 font-medium max-w-2xl">
                    {targetAgent
                        ? `Customize the visual identity for ${targetAgent.name}. These settings define their personal logo, colors, and social presence.`
                        : 'Customize how your public-facing real estate website looks and feels. Changes here will be reflected on your live site.'}
                </p>
            </div>

            {/* Live Preview Card */}
            <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Live Preview</h3>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-6 min-h-[180px]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: form.primaryColor }}>
                            {form.companyName.split(' ').map(w => w[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-lg" style={{ fontFamily: form.headerFont }}>{form.companyName}</p>
                            <p className="text-xs text-slate-500" style={{ fontFamily: form.bodyFont }}>{form.tagline}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <span className="px-5 py-2 rounded-xl text-slate-900 text-xs font-bold" style={{ backgroundColor: form.primaryColor }}>Primary CTA</span>
                        <span className="px-5 py-2 rounded-xl text-slate-900 text-xs font-bold" style={{ backgroundColor: form.secondaryColor }}>Secondary CTA</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Company Identity */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Company Identity</h3>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Company Name</span>
                            <input
                                type="text"
                                value={form.companyName}
                                onChange={e => setForm({ ...form, companyName: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tagline</span>
                            <input
                                type="text"
                                value={form.tagline}
                                onChange={e => setForm({ ...form, tagline: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </label>
                    </div>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Logo URL</span>
                            <input
                                type="text"
                                value={form.logoUrl}
                                onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                                placeholder="https://example.com/logo.png"
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Favicon URL</span>
                            <input
                                type="text"
                                value={form.faviconUrl}
                                onChange={e => setForm({ ...form, faviconUrl: e.target.value })}
                                placeholder="https://example.com/favicon.ico"
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
                            />
                        </label>
                    </div>
                </div>

                {/* Template Selection */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 col-span-1 lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Website Template</h3>
                            <p className="text-sm text-slate-500 font-medium">Choose the base layout for your public website.</p>
                        </div>
                        <span className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest leading-none">
                            Current: {form.templateId.replace('-', ' ')}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { id: 'modern-realty', name: 'Modern Realty', img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=400' },
                            { id: 'luxury-estate', name: 'Luxury Estate', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400' },
                            { id: 'corporate-brokerage', name: 'Corporate', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400' },
                            { id: 'agent-portfolio', name: 'Portfolio', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400' },
                            { id: 'minimal-realty', name: 'Minimal', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=400' },
                        ].filter(t => form.allowedTemplates.includes(t.id)).map((tpl) => (
                            <button
                                key={tpl.id}
                                onClick={() => setForm({ ...form, templateId: tpl.id as any })}
                                className={`relative group p-2 rounded-[28px] border-2 transition-all text-left overflow-hidden ${form.templateId === tpl.id
                                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-500/10'
                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                    }`}
                            >
                                <div className="aspect-[4/3] rounded-[20px] bg-slate-100 mb-3 overflow-hidden border border-slate-200/50">
                                    <div className="w-full h-full bg-slate-200 animate-pulse group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="px-2 pb-2">
                                    <p className={`text-xs font-black uppercase tracking-widest ${form.templateId === tpl.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                                        {tpl.name}
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setPreviewTemplate(tpl); }}
                                        className="text-[10px] text-indigo-600 font-bold mt-1 hover:underline flex items-center gap-1"
                                    >
                                        Review Layout
                                        <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                {form.templateId === tpl.id && (
                                    <div className="absolute top-4 right-4 h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Social Links */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Social Links</h3>
                    <div className="space-y-4">
                        {['facebook', 'instagram', 'twitter', 'linkedin'].map((network) => (
                            <label key={network} className="block">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{network} URL</span>
                                <input
                                    type="url"
                                    value={form.social[network as keyof typeof form.social]}
                                    onChange={e => setForm({
                                        ...form,
                                        social: { ...form.social, [network]: e.target.value }
                                    })}
                                    placeholder={`https://${network}.com/yourpage`}
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Office Locations */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Office Locations</h3>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
                            + Add Office
                        </button>
                    </div>

                    <div className="space-y-6">
                        {form.officeLocations.map((office, idx) => (
                            <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 relative group">
                                <button className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Office Address & City</span>
                                        <input
                                            type="text"
                                            value={`${office.address}, ${office.city}`}
                                            onChange={() => { }}
                                            placeholder="123 Luxury Ave, Beverly Hills, CA"
                                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone</span>
                                            <input
                                                type="text"
                                                value={office.phone}
                                                onChange={() => { }}
                                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</span>
                                            <input
                                                type="email"
                                                value={office.email}
                                                onChange={() => { }}
                                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Template Preview Modal */}
            {
                previewTemplate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[48px] border border-slate-200 shadow-3xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-400">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Template <span className="text-indigo-600">Preview</span></h2>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Viewing: {previewTemplate.name}</p>
                                </div>
                                <button onClick={() => setPreviewTemplate(null)} className="h-14 w-14 flex items-center justify-center hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200">
                                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-2 bg-slate-100">
                                <div className="aspect-video bg-white rounded-[36px] shadow-inner overflow-hidden border border-slate-200 relative group">
                                    <div className="absolute inset-0 bg-slate-200 animate-pulse" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                        <div className="h-20 w-20 bg-indigo-600 rounded-3xl mb-6 flex items-center justify-center text-white shadow-2xl">
                                            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-4xl font-black text-slate-900 mb-4">{previewTemplate.name}</h3>
                                        <p className="text-xl text-slate-500 max-w-lg font-medium leading-relaxed">
                                            This is a high-fidelity preview of the {previewTemplate.name} layout.
                                            All your brand colors and logos will be automatically injected into this structure.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 flex items-center justify-between bg-white">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full border-2 border-slate-100 p-1 flex items-center justify-center">
                                        <div className="h-full w-full rounded-full" style={{ backgroundColor: form.primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Branding</p>
                                        <p className="text-xs font-bold text-slate-900">Colors will match {form.primaryColor}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setForm({ ...form, templateId: previewTemplate.id }); setPreviewTemplate(null); }}
                                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/10 uppercase tracking-widest"
                                >
                                    Activate This Template
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Save Action */}
            <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex-1 flex gap-4 items-center">
                    {/* Notice for Team Management since it was in PRD for Module 1 */}
                    <p className="text-sm font-medium text-slate-500 flex-1">
                        Looking for team management? <a href="/team" className="text-indigo-600 font-bold hover:underline">Manage your team members and roles here</a>.
                    </p>

                    {error && (
                        <span className="text-sm font-bold text-red-500 animate-in fade-in">
                            {error}
                        </span>
                    )}
                    {saved && (
                        <span className="text-sm font-bold text-emerald-500 animate-in fade-in">
                            ✓ Branding saved successfully & applied to live site
                        </span>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-2xl ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'} text-white font-bold text-sm transition-all flex items-center gap-2`}
                >
                    {isSaving ? 'Publishing...' : 'Publish Changes'}
                </button>
            </div>
        </div >
    );
}
