'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { agentService, PLATFORM_TEMPLATES, useNotificationStore } from '@repo/services';
import { Agent, Template } from '@repo/types';

export default function AgentConfigPage() {
    const params = useParams();
    const router = useRouter();
    const agentId = params.agentId as string;

    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<'details' | 'website' | 'seo'>('details');

    const [form, setForm] = useState({
        name: '', email: '', phone: '', licenseNumber: '', city: '', bio: '',
        templateId: '', domain: '', websiteStatus: 'ACTIVE' as string,
        metaTitle: '', metaDescription: '',
        listingCity: '', propertyType: 'residential', status: 'active',
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await agentService.getAgentById(agentId);
            if (data) {
                setAgent(data);
                setForm({
                    name: data.name, email: data.email, phone: data.phone,
                    licenseNumber: data.licenseNumber || '', city: data.city || '', bio: data.bio || '',
                    templateId: data.templateId || '', domain: data.domain || '',
                    websiteStatus: data.websiteStatus || 'ACTIVE',
                    metaTitle: '', metaDescription: '',
                    listingCity: data.city || '', propertyType: 'residential', status: 'active',
                });
            }
            setLoading(false);
        })();
    }, [agentId]);

    const update = (fields: Partial<typeof form>) => setForm(prev => ({ ...prev, ...fields }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await agentService.updateAgent(agentId, {
                name: form.name, email: form.email, phone: form.phone,
                licenseNumber: form.licenseNumber, city: form.city, bio: form.bio,
                templateId: form.templateId, domain: form.domain,
                websiteStatus: form.websiteStatus as Agent['websiteStatus'],
            });
            useNotificationStore.getState().addNotification({ type: 'success', title: 'Agent Updated', message: `${form.name}'s profile has been saved.` });
        } catch { /* handled */ }
        setSaving(false);
    };

    const inputCls = "w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none font-medium text-slate-800 placeholder:text-slate-300 transition-all";
    const labelCls = "text-[10px] font-black uppercase tracking-widest text-slate-400";

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="h-12 w-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <button onClick={() => router.push('/agents')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-colors flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>Back to Agents
                    </button>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">{agent?.name || 'Agent'} <span className="text-violet-600">Configuration</span></h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push(`/preview/agent/${agentId}`)} className="px-5 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Preview
                    </button>
                    <button onClick={() => router.push(`/website-builder?agentId=${agentId}&templateId=${form.templateId}`)} className="px-5 py-3 bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-200 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Website Builder
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                {([['details', 'Agent Details', '👤'], ['website', 'Website & Template', '🎨'], ['seo', 'SEO & Listings', '🔍']] as const).map(([id, label, icon]) => (
                    <button key={id} onClick={() => setTab(id)} className={`flex-1 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${tab === id ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                        <span>{icon}</span>{label}
                    </button>
                ))}
            </div>

            {/* Details Tab */}
            {tab === 'details' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-5 bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm">
                        <div className="col-span-2 space-y-1.5"><label className={labelCls}>Full Name</label><input type="text" value={form.name} onChange={e => update({ name: e.target.value })} className={inputCls} /></div>
                        <div className="space-y-1.5"><label className={labelCls}>Email</label><input type="email" value={form.email} onChange={e => update({ email: e.target.value })} className={inputCls} /></div>
                        <div className="space-y-1.5"><label className={labelCls}>Phone</label><input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })} className={inputCls} /></div>
                        <div className="space-y-1.5"><label className={labelCls}>License Number</label><input type="text" value={form.licenseNumber} onChange={e => update({ licenseNumber: e.target.value })} className={inputCls} /></div>
                        <div className="space-y-1.5"><label className={labelCls}>City</label><input type="text" value={form.city} onChange={e => update({ city: e.target.value })} className={inputCls} /></div>
                        <div className="col-span-2 space-y-1.5"><label className={labelCls}>Bio</label><textarea value={form.bio} onChange={e => update({ bio: e.target.value })} className={`${inputCls} h-24 resize-none`} /></div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={saving} className="px-10 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-200 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button></div>
                </div>
            )}

            {/* Website Tab */}
            {tab === 'website' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 p-8 bg-white rounded-[28px] border border-slate-100 shadow-sm space-y-5">
                            <h3 className="text-lg font-black text-slate-900">Template</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {PLATFORM_TEMPLATES.map((tpl: Template) => (
                                    <div key={tpl.templateKey} onClick={() => update({ templateId: tpl.templateKey })} className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${form.templateId === tpl.templateKey ? 'border-violet-600 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <img src={tpl.previewImage} alt="" className="h-20 w-full object-cover" />
                                        <div className="p-2"><p className="text-[9px] font-black uppercase tracking-widest text-violet-600">{tpl.templateName}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-8 bg-slate-900 rounded-[28px] text-white space-y-5">
                            <h3 className="text-lg font-black">Website Config</h3>
                            <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Domain</label><input type="text" value={form.domain} onChange={e => update({ domain: e.target.value })} className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-violet-500" /></div>
                            <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
                                <select value={form.websiteStatus} onChange={e => update({ websiteStatus: e.target.value })} className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-violet-500">
                                    <option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="PENDING">Pending</option>
                                </select>
                            </div>
                            <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all mt-2">{saving ? 'Saving...' : 'Update Website'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SEO Tab */}
            {tab === 'seo' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 bg-white rounded-[28px] border border-slate-100 shadow-sm space-y-5">
                            <h3 className="text-lg font-black text-slate-900">SEO Settings</h3>
                            <div className="space-y-1.5"><label className={labelCls}>Meta Title</label><input type="text" value={form.metaTitle} onChange={e => update({ metaTitle: e.target.value })} className={inputCls} placeholder="Agent Name | Real Estate" /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Meta Description</label><textarea value={form.metaDescription} onChange={e => update({ metaDescription: e.target.value })} className={`${inputCls} h-24 resize-none`} placeholder="Real estate specialist..." /></div>
                        </div>
                        <div className="p-8 bg-white rounded-[28px] border border-slate-100 shadow-sm space-y-5">
                            <h3 className="text-lg font-black text-slate-900">Listing Filters</h3>
                            <div className="space-y-1.5"><label className={labelCls}>City</label><input type="text" value={form.listingCity} onChange={e => update({ listingCity: e.target.value })} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Property Type</label><select value={form.propertyType} onChange={e => update({ propertyType: e.target.value })} className={inputCls}><option>residential</option><option>commercial</option><option>condo</option></select></div>
                            <div className="space-y-1.5"><label className={labelCls}>Status</label><select value={form.status} onChange={e => update({ status: e.target.value })} className={inputCls}><option>active</option><option>sold</option><option>pending</option></select></div>
                        </div>
                    </div>
                    <div className="flex justify-end"><button onClick={handleSave} disabled={saving} className="px-10 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-200 disabled:opacity-50">{saving ? 'Saving...' : 'Save All'}</button></div>
                </div>
            )}
        </div>
    );
}
