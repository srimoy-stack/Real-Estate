'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardOrganization, PLATFORM_TEMPLATES, ProvisioningProgress } from '@repo/services';
import { Template } from '@repo/types';

export default function OnboardOrganizationPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<ProvisioningProgress | null>(null);

    const [form, setForm] = useState({
        name: '', brokerageLicense: '', email: '', phone: '',
        address: '', city: '', province: '', country: 'Canada',
        templateId: '', domain: '',
        listingCity: '', propertyType: 'residential', status: 'active', listingLimit: '25',
        metaTitle: '', metaDescription: '',
        sendCredentials: true,
    });

    const update = (fields: Partial<typeof form>) => setForm(prev => ({ ...prev, ...fields }));
    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onboardOrganization({
                organization: {
                    name: form.name, type: 'BROKERAGE', email: form.email,
                    phone: form.phone, address: `${form.address}, ${form.city}, ${form.province}, ${form.country}`,
                    timezone: 'America/Toronto',
                },
                adminUser: { name: form.name, email: form.email },
                templates: { mainWebsiteTemplateId: form.templateId, additionalTemplateIds: [form.templateId] },
                website: { domain: form.domain || `${form.name.toLowerCase().replace(/\s+/g, '-')}.realestate.com`, defaultLanguage: 'English' },
            }, (p) => setProgress(p));
            setTimeout(() => router.push('/organizations'), 1200);
        } catch { setLoading(false); }
    };

    const inputCls = "w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none font-medium text-slate-800 placeholder:text-slate-300 transition-all";
    const labelCls = "text-[10px] font-black uppercase tracking-widest text-slate-400";

    return (
        <div className="min-h-[85vh] flex items-start justify-center pt-8">
            <div className="w-full max-w-5xl bg-white rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[680px]">

                {/* Sidebar */}
                <div className="w-full md:w-72 bg-slate-900 p-10 text-white flex flex-col shrink-0">
                    <div className="mb-10">
                        <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-lg mb-4">🏢</div>
                        <h1 className="text-lg font-black tracking-tight">Brokerage<br /><span className="text-indigo-400">Onboarding</span></h1>
                    </div>
                    <div className="flex-1 space-y-6">
                        {[
                            { s: 1, label: 'Company Info' },
                            { s: 2, label: 'Website Setup' },
                            { s: 3, label: 'Listing Config' },
                            { s: 4, label: 'SEO Settings' },
                            { s: 5, label: 'Review & Submit' },
                        ].map(item => (
                            <div key={item.s} className="flex items-center gap-3 cursor-pointer" onClick={() => step > item.s && setStep(item.s)}>
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition-all ${step === item.s ? 'bg-indigo-600 scale-110 shadow-lg' : step > item.s ? 'bg-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
                                    {step > item.s ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg> : item.s}
                                </div>
                                <span className={`text-sm font-bold ${step === item.s ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => router.push('/organizations')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mt-6">← Back to Organizations</button>
                </div>

                {/* Content */}
                <div className="flex-1 p-10 overflow-y-auto">
                    {/* Step 1: Company Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Company Information</h2><p className="text-slate-500 font-medium mt-1">Basic details for the brokerage organization.</p></div>
                            <div className="grid grid-cols-2 gap-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="col-span-2 space-y-1.5"><label className={labelCls}>Organization Name *</label><input type="text" value={form.name} onChange={e => update({ name: e.target.value })} className={inputCls} placeholder="e.g. Toronto Realty Group" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Brokerage License</label><input type="text" value={form.brokerageLicense} onChange={e => update({ brokerageLicense: e.target.value })} className={inputCls} placeholder="e.g. BRK-2024-0001" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Contact Email *</label><input type="email" value={form.email} onChange={e => update({ email: e.target.value })} className={inputCls} placeholder="contact@company.com" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Contact Phone *</label><input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })} className={inputCls} placeholder="+1 (416) 555-0000" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Primary Address</label><input type="text" value={form.address} onChange={e => update({ address: e.target.value })} className={inputCls} placeholder="123 Main Street" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>City</label><input type="text" value={form.city} onChange={e => update({ city: e.target.value })} className={inputCls} placeholder="Toronto" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Province</label><input type="text" value={form.province} onChange={e => update({ province: e.target.value })} className={inputCls} placeholder="Ontario" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Country</label><select value={form.country} onChange={e => update({ country: e.target.value })} className={inputCls}><option>Canada</option><option>United States</option></select></div>
                                <div className="col-span-2 mt-4 flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                    <input
                                        type="checkbox"
                                        id="sendCreds"
                                        checked={form.sendCredentials}
                                        onChange={e => update({ sendCredentials: e.target.checked })}
                                        className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="sendCreds" className="text-xs font-bold text-slate-700 cursor-pointer">
                                        Send administrative login credentials via email upon activation
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={next} disabled={!form.name || !form.email || !form.phone} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Website Setup */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Website Setup</h2><p className="text-slate-500 font-medium mt-1">Select a design template and configure the domain.</p></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                {PLATFORM_TEMPLATES.map((tpl: Template) => (
                                    <div key={tpl.templateKey} onClick={() => update({ templateId: tpl.templateKey })} className={`group relative rounded-[24px] border-3 transition-all duration-300 overflow-hidden cursor-pointer ${form.templateId === tpl.templateKey ? 'border-indigo-600 shadow-xl ring-2 ring-indigo-600/20' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <img src={tpl.previewImage} alt={tpl.templateName} className="h-32 w-full object-cover" />
                                        <div className="p-3 bg-white"><h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{tpl.templateName}</h4></div>
                                        {form.templateId === tpl.templateKey && <div className="absolute top-2 right-2 h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1.5"><label className={labelCls}>Custom Domain (optional)</label><input type="text" value={form.domain} onChange={e => update({ domain: e.target.value })} className={inputCls} placeholder="www.torontorealty.com" /></div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} disabled={!form.templateId} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-40">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Listing Config */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Default Listing Configuration</h2><p className="text-slate-500 font-medium mt-1">Configure default listing filters for the homepage.</p></div>
                            <div className="grid grid-cols-2 gap-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="space-y-1.5"><label className={labelCls}>City</label><input type="text" value={form.listingCity} onChange={e => update({ listingCity: e.target.value })} className={inputCls} placeholder="Toronto" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Property Type</label><select value={form.propertyType} onChange={e => update({ propertyType: e.target.value })} className={inputCls}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="condo">Condo</option><option value="townhouse">Townhouse</option><option value="land">Land</option></select></div>
                                <div className="space-y-1.5"><label className={labelCls}>Status</label><select value={form.status} onChange={e => update({ status: e.target.value })} className={inputCls}><option value="active">Active</option><option value="sold">Sold</option><option value="pending">Pending</option></select></div>
                                <div className="space-y-1.5"><label className={labelCls}>Listing Limit</label><input type="number" value={form.listingLimit} onChange={e => update({ listingLimit: e.target.value })} className={inputCls} placeholder="25" /></div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: SEO Settings */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">SEO Settings</h2><p className="text-slate-500 font-medium mt-1">Search engine optimization for the brokerage website.</p></div>
                            <div className="space-y-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="space-y-1.5"><label className={labelCls}>Meta Title</label><input type="text" value={form.metaTitle} onChange={e => update({ metaTitle: e.target.value })} className={inputCls} placeholder="Toronto Realty Group | Premium Real Estate" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Meta Description</label><textarea value={form.metaDescription} onChange={e => update({ metaDescription: e.target.value })} className={`${inputCls} h-28 resize-none`} placeholder="Leading brokerage in Toronto specializing in luxury homes and condos..." /></div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Review & Submit</h2><p className="text-slate-500 font-medium mt-1">Verify all details before creating the organization.</p></div>
                            {loading && progress ? (
                                <div className="bg-slate-900 p-10 rounded-[32px] text-white space-y-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-400">{progress.label}</p>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progress.progress}%` }} /></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="p-6 bg-slate-50 rounded-[24px] space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Company</h3>
                                        <p className="font-bold text-slate-900">{form.name}</p>
                                        <p className="text-sm text-slate-500">{form.email}</p>
                                        <p className="text-sm text-slate-500">{form.phone}</p>
                                        {form.city && <p className="text-sm text-slate-500">{form.city}, {form.province}</p>}
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[24px] space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Website</h3>
                                        <p className="font-bold text-slate-900">{PLATFORM_TEMPLATES.find(t => t.templateKey === form.templateId)?.templateName || 'Not selected'}</p>
                                        <p className="text-sm text-slate-500 font-mono">{form.domain || 'Auto-generated'}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[24px] space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Listings</h3>
                                        <p className="text-sm text-slate-500">City: {form.listingCity || 'All'}</p>
                                        <p className="text-sm text-slate-500">Type: {form.propertyType}</p>
                                        <p className="text-sm text-slate-500">Limit: {form.listingLimit}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[24px] space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">SEO</h3>
                                        <p className="font-bold text-slate-900 text-sm">{form.metaTitle || 'Not set'}</p>
                                        <p className="text-sm text-slate-500 line-clamp-2">{form.metaDescription || 'Not set'}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between pt-4">
                                <button onClick={back} disabled={loading} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-30">Back</button>
                                <button onClick={handleSubmit} disabled={loading} className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-300/30 hover:scale-[1.02] transition-all disabled:opacity-50">
                                    {loading ? 'Provisioning...' : 'Create Organization'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
