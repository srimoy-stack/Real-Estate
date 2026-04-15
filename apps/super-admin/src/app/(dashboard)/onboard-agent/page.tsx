'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentService, PLATFORM_TEMPLATES, useNotificationStore } from '@repo/services';
import { Template } from '@repo/types';

export default function OnboardAgentPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', phone: '', brokerage: '', licenseNumber: '',
        templateId: '', domain: '',
        listingCity: '', propertyType: 'residential', status: 'active',
        listingProvider: {
            providerName: 'CREA DDF',
            apiEndpoint: '',
            apiKey: '',
            authKey: '',
        },
        metaTitle: '', metaDescription: '',
        sendCredentials: true,
    });

    const update = (fields: Partial<typeof form>) => setForm(prev => ({ ...prev, ...fields }));
    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await agentService.createAgent({
                organizationId: form.brokerage || '',
                name: form.name,
                email: form.email,
                phone: form.phone,
                licenseNumber: form.licenseNumber,
                templateId: form.templateId,
                slug: form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                websiteStatus: 'ACTIVE',
                domain: form.domain || `${form.name.toLowerCase().replace(/\s+/g, '-')}.realestate.com`,
                city: form.listingCity,
            });
            useNotificationStore.getState().addNotification({ type: 'success', title: 'Agent Onboarded', message: `${form.name} has been successfully onboarded.` });
            setTimeout(() => router.push('/agents'), 800);
        } catch { setLoading(false); }
    };

    const inputCls = "w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none font-medium text-slate-800 placeholder:text-slate-300 transition-all";
    const labelCls = "text-[10px] font-black uppercase tracking-widest text-slate-400";

    return (
        <div className="min-h-[85vh] flex items-start justify-center pt-8">
            <div className="w-full max-w-5xl bg-white rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[620px]">

                {/* Sidebar */}
                <div className="w-full md:w-72 bg-gradient-to-b from-violet-900 to-slate-900 p-10 text-white flex flex-col shrink-0">
                    <div className="mb-10">
                        <div className="h-10 w-10 bg-violet-600 rounded-2xl flex items-center justify-center text-lg mb-4">👤</div>
                        <h1 className="text-lg font-black tracking-tight">Agent<br /><span className="text-violet-400">Onboarding</span></h1>
                    </div>
                    <div className="flex-1 space-y-6">
                        {[
                            { s: 1, label: 'Agent Info' },
                            { s: 2, label: 'Listing Provider' },
                            { s: 3, label: 'Website Setup' },
                            { s: 4, label: 'Listing Filters' },
                            { s: 5, label: 'SEO & Submit' },
                        ].map(item => (
                            <div key={item.s} className="flex items-center gap-3 cursor-pointer" onClick={() => step > item.s && setStep(item.s)}>
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition-all ${step === item.s ? 'bg-violet-600 scale-110 shadow-lg' : step > item.s ? 'bg-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
                                    {step > item.s ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg> : item.s}
                                </div>
                                <span className={`text-sm font-bold ${step === item.s ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => router.push('/agents')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mt-6">← Back to Agents</button>
                </div>

                {/* Content */}
                <div className="flex-1 p-10 overflow-y-auto">
                    {/* Step 1: Agent Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Agent Information</h2><p className="text-slate-500 font-medium mt-1">Personal and professional details.</p></div>
                            <div className="grid grid-cols-2 gap-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="col-span-2 space-y-1.5"><label className={labelCls}>Agent Name *</label><input type="text" value={form.name} onChange={e => update({ name: e.target.value })} className={inputCls} placeholder="e.g. John Smith" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Email *</label><input type="email" value={form.email} onChange={e => update({ email: e.target.value })} className={inputCls} placeholder="john@example.com" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Phone *</label><input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })} className={inputCls} placeholder="+1 (416) 555-0000" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Brokerage (optional)</label><input type="text" value={form.brokerage} onChange={e => update({ brokerage: e.target.value })} className={inputCls} placeholder="Brokerage ID or name" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>License Number</label><input type="text" value={form.licenseNumber} onChange={e => update({ licenseNumber: e.target.value })} className={inputCls} placeholder="RE-2024-XXXX" /></div>
                                <div className="col-span-2 mt-4 flex items-center gap-3 p-4 bg-violet-50/50 rounded-2xl border border-violet-100/50">
                                    <input
                                        type="checkbox"
                                        id="sendAgentCreds"
                                        checked={form.sendCredentials}
                                        onChange={e => update({ sendCredentials: e.target.checked })}
                                        className="h-5 w-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    <label htmlFor="sendAgentCreds" className="text-xs font-bold text-slate-700 cursor-pointer">
                                        Email secure login credentials to agent once account is active
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={next} disabled={!form.name || !form.email || !form.phone} className="px-10 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-200 hover:bg-violet-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Listing Provider */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Listing Provider</h2><p className="text-slate-500 font-medium mt-1">Configure property data source for this agent.</p></div>
                            <div className="grid grid-cols-2 gap-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="space-y-1.5"><label className={labelCls}>Provider Name *</label><input type="text" value={form.listingProvider.providerName} onChange={e => update({ listingProvider: { ...form.listingProvider, providerName: e.target.value } })} className={inputCls} placeholder="e.g. CREA DDF" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>API Endpoint</label><input type="text" value={form.listingProvider.apiEndpoint} onChange={e => update({ listingProvider: { ...form.listingProvider, apiEndpoint: e.target.value } })} className={inputCls} placeholder="https://api.provider.com/v3" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>API Key</label><input type="password" value={form.listingProvider.apiKey} onChange={e => update({ listingProvider: { ...form.listingProvider, apiKey: e.target.value } })} className={inputCls} placeholder="••••••••••••••••" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Auth Key</label><input type="password" value={form.listingProvider.authKey} onChange={e => update({ listingProvider: { ...form.listingProvider, authKey: e.target.value } })} className={inputCls} placeholder="••••••••••••••••" /></div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} disabled={!form.listingProvider.providerName} className="px-10 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-200 hover:bg-violet-500 transition-all disabled:opacity-40">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Website Setup */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Website Setup</h2><p className="text-slate-500 font-medium mt-1">Choose a template for the agent&apos;s website.</p></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2">
                                {PLATFORM_TEMPLATES.map((tpl: Template) => (
                                    <div key={tpl.templateKey} onClick={() => update({ templateId: tpl.templateKey })} className={`group relative rounded-[24px] border-3 transition-all duration-300 overflow-hidden cursor-pointer ${form.templateId === tpl.templateKey ? 'border-violet-600 shadow-xl ring-2 ring-violet-600/20' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <img src={tpl.previewImage} alt={tpl.templateName} className="h-32 w-full object-cover" />
                                        <div className="p-3 bg-white"><h4 className="text-[10px] font-black uppercase tracking-widest text-violet-600">{tpl.templateName}</h4></div>
                                        {form.templateId === tpl.templateKey && <div className="absolute top-2 right-2 h-6 w-6 bg-violet-600 rounded-full flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1.5"><label className={labelCls}>Custom Domain (optional)</label><input type="text" value={form.domain} onChange={e => update({ domain: e.target.value })} className={inputCls} placeholder="john-smith.realestate.com" /></div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} disabled={!form.templateId} className="px-10 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-200 hover:bg-violet-500 transition-all disabled:opacity-40">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Listing Filters */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Default Listing Filters</h2><p className="text-slate-500 font-medium mt-1">Pre-configure the listing filters for the agent website.</p></div>
                            <div className="grid grid-cols-2 gap-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="space-y-1.5"><label className={labelCls}>City</label><input type="text" value={form.listingCity} onChange={e => update({ listingCity: e.target.value })} className={inputCls} placeholder="Toronto" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Property Type</label><select value={form.propertyType} onChange={e => update({ propertyType: e.target.value })} className={inputCls}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="condo">Condo</option><option value="townhouse">Townhouse</option></select></div>
                                <div className="space-y-1.5"><label className={labelCls}>Status</label><select value={form.status} onChange={e => update({ status: e.target.value })} className={inputCls}><option value="active">Active</option><option value="sold">Sold</option><option value="pending">Pending</option></select></div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} className="px-10 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-200 hover:bg-violet-500 transition-all">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: SEO & Submit */}
                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">SEO & Review</h2><p className="text-slate-500 font-medium mt-1">SEO settings and final review before submission.</p></div>
                            <div className="space-y-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="space-y-1.5"><label className={labelCls}>Meta Title</label><input type="text" value={form.metaTitle} onChange={e => update({ metaTitle: e.target.value })} className={inputCls} placeholder="John Smith | Toronto Real Estate Agent" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Meta Description</label><textarea value={form.metaDescription} onChange={e => update({ metaDescription: e.target.value })} className={`${inputCls} h-24 resize-none`} placeholder="Expert real estate agent specializing in..." /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 rounded-[20px]">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-2">Agent</h3>
                                    <p className="font-bold text-slate-900">{form.name}</p>
                                    <p className="text-sm text-slate-500">{form.email} · {form.phone}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-[20px]">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-2">Website</h3>
                                    <p className="font-bold text-slate-900">{PLATFORM_TEMPLATES.find(t => t.templateKey === form.templateId)?.templateName}</p>
                                    <p className="text-sm text-slate-500 font-mono">{form.domain || 'Auto-generated'}</p>
                                </div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} disabled={loading} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-30">Back</button>
                                <button onClick={handleSubmit} disabled={loading} className="px-12 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-300/30 hover:scale-[1.02] transition-all disabled:opacity-50">
                                    {loading ? 'Creating...' : 'Onboard Agent'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
