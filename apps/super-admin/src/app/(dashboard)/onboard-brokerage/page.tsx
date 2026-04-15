'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onboardOrganization, PLATFORM_TEMPLATES, ProvisioningProgress } from '@repo/services';
import { Template, OrganizationType } from '@repo/types';

export default function OnboardBrokeragePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<ProvisioningProgress | null>(null);
    const [isProvisioning, setIsProvisioning] = useState(false);

    const [form, setForm] = useState({
        type: '' as OrganizationType | '',
        name: '', brokerageLicense: '', email: '', phone: '',
        address: '', city: '', province: '', country: 'Canada',
        templateId: '', domain: '',
        logo: '',
        modules: {
            listings: true,
            leadCRM: true,
            blog: false,
            analytics: false,
            teamManagement: false,
        },
        listingProvider: {
            providerName: 'CREA DDF',
            apiEndpoint: '',
            apiKey: '',
            authKey: '',
            otherDetails: '',
        },
        listingCity: '', propertyType: 'residential', status: 'active', listingLimit: '25',
        metaTitle: '', metaDescription: '',
        sendCredentials: true,
    });

    const update = (fields: Partial<typeof form>) => setForm(prev => ({ ...prev, ...fields }));
    const updateModule = (key: keyof typeof form.modules) => {
        setForm(prev => ({
            ...prev,
            modules: { ...prev.modules, [key]: !prev.modules[key] }
        }));
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                update({ logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (!form.type) return;
        setLoading(true);
        setIsProvisioning(true); // TASK 1: Intercept submit, show overlay
        try {
            await onboardOrganization({
                organization: {
                    name: form.name,
                    type: form.type as OrganizationType,
                    email: form.email,
                    phone: form.phone,
                    address: `${form.address}, ${form.city}, ${form.province}, ${form.country}`,
                    timezone: 'America/Toronto',
                    logo: form.logo,
                    modules: form.modules,
                },
                adminUser: { name: form.name, email: form.email },
                templates: { mainWebsiteTemplateId: form.templateId, additionalTemplateIds: [form.templateId] },
                website: { domain: form.domain || `${form.name.toLowerCase().replace(/\s+/g, '-')}.realestate.com`, defaultLanguage: 'English' },
            }, (p) => setProgress(p));
            // Final Step (100%) handled by progress state
        } catch {
            setLoading(false);
            setIsProvisioning(false);
        }
    };

    // Auto-redirect after completion
    useEffect(() => {
        if (progress?.progress === 100) {
            const timer = setTimeout(() => {
                router.push('/brokerages');
            }, 1000); // TASK 4: Auto redirect after ~1s
            return () => clearTimeout(timer);
        }
    }, [progress, router]);

    const inputCls = "w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none font-medium text-slate-800 placeholder:text-slate-300 transition-all";
    const labelCls = "text-[10px] font-black uppercase tracking-widest text-slate-400";

    const provisioningSteps = [
        { id: 1, label: "Creating brokerage...", minProgress: 0 },
        { id: 2, label: "Assigning template...", minProgress: 35 },
        { id: 3, label: "Setting up website...", minProgress: 70 },
        { id: 4, label: "Finalizing setup...", minProgress: 95 },
    ];

    return (
        <div className="min-h-[85vh] flex items-start justify-center pt-8 relative">
            {/* Provisioning Overlay */}
            {isProvisioning && (
                <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent)]" />
                    <div className="w-full max-w-lg space-y-12 relative z-10">
                        {/* Header */}
                        <div className="text-center space-y-3">
                            {progress?.progress === 100 ? (
                                <div className="space-y-4 animate-in zoom-in duration-500">
                                    <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">Brokerage Successfully Created</h2>
                                    <p className="text-slate-400 font-medium">Redirecting to management suite...</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-4xl font-black text-white tracking-tight">Provisioning <span className="text-indigo-500">Ecosystem</span></h2>
                                    <p className="text-slate-400 font-medium">Please wait while we initialize your platform nodes.</p>
                                </>
                            )}
                        </div>

                        {/* Progress Steps */}
                        <div className="space-y-4 bg-white/5 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl">
                            {provisioningSteps.map((s) => {
                                const isComplete = (progress?.progress || 0) > s.minProgress + 20 || progress?.progress === 100;
                                const isActive = (progress?.progress || 0) >= s.minProgress && !isComplete;

                                return (
                                    <div key={s.id} className="flex items-center gap-6 group">
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isComplete ? 'bg-emerald-500' : isActive ? 'bg-indigo-600 animate-pulse' : 'bg-white/5 text-white/20'}`}>
                                            {isComplete ? (
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                                            ) : isActive ? (
                                                <div className="h-4 w-4 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : s.id}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-black uppercase tracking-widest transition-colors duration-500 ${isComplete ? 'text-emerald-400' : isActive ? 'text-white' : 'text-white/20'}`}>
                                                {s.label}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-600 animate-progress transition-all duration-500" style={{ width: `${((progress?.progress || 0) - s.minProgress) * 5}%` }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Global Progress Bar */}
                        <div className="space-y-4">
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-700 ease-out"
                                    style={{ width: `${progress?.progress || 0}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>Core Systems Discovery</span>
                                <span className="text-white">{progress?.progress || 0}%</span>
                            </div>
                        </div>

                        {/* Debug Info (Optional, hidden by text-slate-500/0) */}
                        <p className="text-center text-[8px] font-black text-white/5 uppercase tracking-[0.4em]">Node Provisioning Protocol v4.2.0-secure</p>
                    </div>
                </div>
            )}

            <div className={`w-full max-w-5xl bg-white rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[680px] transition-all duration-500 ${isProvisioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

                {/* Sidebar */}
                <div className="w-full md:w-72 bg-slate-900 p-10 text-white flex flex-col shrink-0">
                    <div className="mb-10">
                        <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-lg mb-4">🏢</div>
                        <h1 className="text-lg font-black tracking-tight">Ecosystem<br /><span className="text-indigo-400">Onboarding</span></h1>
                    </div>
                    <div className="flex-1 space-y-6">
                        {[
                            { s: 1, label: 'Client Type' },
                            { s: 2, label: 'Org Details' },
                            { s: 3, label: 'Listing Provider' },
                            { s: 4, label: 'Website Setup' },
                            { s: 5, label: 'Modules' },
                            { s: 6, label: 'Review & Submit' },
                        ].map(item => (
                            <div key={item.s} className="flex items-center gap-3 cursor-pointer" onClick={() => (step > item.s && !loading) && setStep(item.s)}>
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition-all ${step === item.s ? 'bg-indigo-600 scale-110 shadow-lg' : step > item.s ? 'bg-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
                                    {step > item.s ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg> : item.s}
                                </div>
                                <span className={`text-sm font-bold ${step === item.s ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => router.push('/brokerages')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mt-6">← Back to Brokerages</button>
                </div>

                {/* Content */}
                <div className="flex-1 p-10 overflow-y-auto">
                    {/* Step 1: Client Type */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Select Client Type</h2><p className="text-slate-500 font-medium mt-1">Specify whether this brokerage is a large office or an individual agent platform.</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { id: 'BROKERAGE', label: 'Brokerage', desc: 'Multiple agents, office management, and global listings.', icon: '🏢' },
                                    { id: 'INDIVIDUAL_AGENT', label: 'Individual Agent', desc: 'Solo professional site and personal lead management.', icon: '👤' }
                                ].map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => update({ type: type.id as OrganizationType })}
                                        className={`p-8 rounded-[32px] border-4 cursor-pointer transition-all duration-300 flex flex-col items-center text-center gap-4 ${form.type === type.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-100 bg-white shadow-sm'}`}
                                    >
                                        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-slate-100">{type.icon}</div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">{type.label}</h3>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">{type.desc}</p>
                                        </div>
                                        {form.type === type.id && <div className="mt-4 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Selected</div>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={next} disabled={!form.type} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Brokerage Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Brokerage Details</h2><p className="text-slate-500 font-medium mt-1">Core contact and billing information.</p></div>
                            <div className="grid grid-cols-2 gap-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="col-span-2 flex items-center gap-6 mb-4">
                                    <div className="relative group/logo">
                                        <div className="h-20 w-20 bg-white border-2 border-slate-200 rounded-3xl overflow-hidden flex items-center justify-center shadow-sm">
                                            {form.logo ? (
                                                <img src={form.logo} alt="Logo preview" className="h-full w-full object-contain" />
                                            ) : (
                                                <svg className="h-8 w-8 text-slate-300 group-hover/logo:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} /></svg>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Brokerage Logo</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">PNG or SVG, Max 500KB</p>
                                        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2 hover:underline">Upload Image</button>
                                    </div>
                                </div>

                                <div className="col-span-2 space-y-1.5"><label className={labelCls}>Legal Name *</label><input type="text" value={form.name} onChange={e => update({ name: e.target.value })} className={inputCls} placeholder="e.g. Toronto Realty Group" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>License / ID</label><input type="text" value={form.brokerageLicense} onChange={e => update({ brokerageLicense: e.target.value })} className={inputCls} placeholder="e.g. BRK-2024-0001" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Contact Email *</label><input type="email" value={form.email} onChange={e => update({ email: e.target.value })} className={inputCls} placeholder="contact@company.com" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Contact Phone *</label><input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })} className={inputCls} placeholder="+1 (416) 555-0000" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Address</label><input type="text" value={form.address} onChange={e => update({ address: e.target.value })} className={inputCls} placeholder="123 Main Street" /></div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} disabled={!form.name || !form.email} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-40">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Listing Provider */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Listing Provider</h2><p className="text-slate-500 font-medium mt-1">Configure the property data source and API credentials.</p></div>
                            <div className="grid grid-cols-2 gap-5 bg-slate-50/70 p-7 rounded-[28px]">
                                <div className="space-y-1.5"><label className={labelCls}>Provider Name *</label><input type="text" value={form.listingProvider.providerName} onChange={e => update({ listingProvider: { ...form.listingProvider, providerName: e.target.value } })} className={inputCls} placeholder="e.g. CREA DDF, Treb, etc." /></div>
                                <div className="space-y-1.5"><label className={labelCls}>API Endpoint</label><input type="text" value={form.listingProvider.apiEndpoint} onChange={e => update({ listingProvider: { ...form.listingProvider, apiEndpoint: e.target.value } })} className={inputCls} placeholder="https://api.provider.com/v3" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>API Key</label><input type="password" value={form.listingProvider.apiKey} onChange={e => update({ listingProvider: { ...form.listingProvider, apiKey: e.target.value } })} className={inputCls} placeholder="••••••••••••••••" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Auth Key / Token</label><input type="password" value={form.listingProvider.authKey} onChange={e => update({ listingProvider: { ...form.listingProvider, authKey: e.target.value } })} className={inputCls} placeholder="••••••••••••••••" /></div>
                                <div className="col-span-2 space-y-1.5"><label className={labelCls}>Other Implementation Details</label><textarea value={form.listingProvider.otherDetails} onChange={e => update({ listingProvider: { ...form.listingProvider, otherDetails: e.target.value } })} className={`${inputCls} h-24 resize-none`} placeholder="Specific notes for the technical team..." /></div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} disabled={!form.listingProvider.providerName} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-40">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Website Setup */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Website Provisioning</h2><p className="text-slate-500 font-medium mt-1">Select a tenant template and configure the access domain.</p></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                {PLATFORM_TEMPLATES.map((tpl: Template) => (
                                    <div key={tpl.templateKey} onClick={() => update({ templateId: tpl.templateKey })} className={`group relative rounded-[24px] border-3 transition-all duration-300 overflow-hidden cursor-pointer ${form.templateId === tpl.templateKey ? 'border-indigo-600 shadow-xl ring-2 ring-indigo-600/20' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <img src={tpl.previewImage} alt={tpl.templateName} className="h-32 w-full object-cover" />
                                        <div className="p-3 bg-white"><h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{tpl.templateName}</h4></div>
                                        {form.templateId === tpl.templateKey && <div className="absolute top-2 right-2 h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1.5"><label className={labelCls}>Target Domain</label><input type="text" value={form.domain} onChange={e => update({ domain: e.target.value })} className={inputCls} placeholder="e.g. www.torontorealty.com" /></div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} disabled={!form.templateId} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-40">Continue</button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Module Selection */}
                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Module Selection</h2><p className="text-slate-500 font-medium mt-1">Enable specific platform features for this client.</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { key: 'listings', label: 'Listings', icon: '🏠', desc: 'MLS Sync & Property Search' },
                                    { key: 'leadCRM', label: 'Lead CRM', icon: '⚡', desc: 'Manage inbound client requests' },
                                    { key: 'blog', label: 'Real Estate Blog', icon: '📝', desc: 'Content marketing toolkit' },
                                    { key: 'analytics', label: 'Deep Analytics', icon: '📊', desc: 'Conversion tracking & reports' },
                                    { key: 'teamManagement', label: 'Team Management', icon: '👥', desc: 'Agent hierarchies & routing' },
                                ].map((mod) => (
                                    <div
                                        key={mod.key}
                                        onClick={() => updateModule(mod.key as any)}
                                        className={`p-6 rounded-3xl border-2 flex items-center gap-5 cursor-pointer transition-all ${form.modules[mod.key as keyof typeof form.modules] ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="text-2xl shrink-0">{mod.icon}</div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{mod.label}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{mod.desc}</p>
                                        </div>
                                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${form.modules[mod.key as keyof typeof form.modules] ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                                            {form.modules[mod.key as keyof typeof form.modules] && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={next} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all">Review & Finalize</button>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Review & Submit */}
                    {step === 6 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div><h2 className="text-2xl font-black text-slate-900">Review & Submit</h2><p className="text-slate-500 font-medium mt-1">Verify all details before initiating ecosystem provisioning.</p></div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="p-6 bg-slate-50 rounded-[24px] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Company</h3>
                                        <span className="text-[8px] font-black bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 uppercase">{form.type?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {form.logo && <img src={form.logo} alt="Logo" className="h-8 w-8 object-contain rounded-md bg-white border border-slate-200 p-1" />}
                                        <p className="font-bold text-slate-900 tracking-tight">{form.name}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">{form.email} • {form.phone}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[24px] space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Selected Template</h3>
                                    <p className="font-bold text-slate-900 tracking-tight">{PLATFORM_TEMPLATES.find(t => t.templateKey === form.templateId)?.templateName || 'Not selected'}</p>
                                    <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">{form.domain || 'Auto-generated Domain'}</p>
                                </div>
                                <div className="col-span-2 p-6 bg-slate-50 rounded-[24px] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Listing Provider</h3>
                                        <span className="text-[8px] font-black bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 uppercase">{form.listingProvider.providerName}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-xs font-bold text-slate-900 truncate">{form.listingProvider.apiEndpoint ? 'API CONFIGURED' : 'PENDING CONFIG'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credentials</p>
                                            <p className="text-xs font-bold text-slate-900">{form.listingProvider.apiKey ? 'KEYS PROVIDED' : 'NOT SUPPLIED'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 p-6 bg-slate-50 rounded-[24px] space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Enabled Modules</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(form.modules).filter(([, val]) => val).map(([key]) => (
                                            <span key={key} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-700">✓ {key.replace(/([A-Z])/g, ' $1')}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <button onClick={back} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                                <button onClick={handleSubmit} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-300/30 hover:scale-[1.02] transition-all">
                                    Complete Onboarding
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
