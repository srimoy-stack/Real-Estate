'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    PLATFORM_TEMPLATES,
    onboardOrganization,
    OnboardingPayload
} from '@repo/services';
import {
    OrganizationType,
    Template
} from '@repo/types';

// ─── Wizard Components ──────────────────────────────

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // ─── Form State ────────────────────────────────
    const [formData, setFormData] = useState<OnboardingPayload>({
        organization: {
            name: '',
            type: 'BROKERAGE',
            email: '',
            phone: '',
            address: '',
            timezone: 'America/Toronto',
            logo: '',
        },
        adminUser: {
            name: '',
            email: '',
            password: '',
        },
        templates: {
            mainWebsiteTemplateId: '',
            additionalTemplateIds: [],
        },
        website: {
            domain: '',
            defaultLanguage: 'English',
        }
    });

    const updateOrg = (updates: Partial<OnboardingPayload['organization']>) => {
        setFormData(prev => ({
            ...prev,
            organization: { ...prev.organization, ...updates }
        }));
    };

    const updateUser = (updates: Partial<OnboardingPayload['adminUser']>) => {
        setFormData(prev => ({
            ...prev,
            adminUser: { ...prev.adminUser, ...updates }
        }));
    };

    const updateTemplates = (updates: Partial<OnboardingPayload['templates']>) => {
        setFormData(prev => ({
            ...prev,
            templates: { ...prev.templates, ...updates }
        }));
    };

    const updateWebsite = (updates: Partial<OnboardingPayload['website']>) => {
        setFormData(prev => ({
            ...prev,
            website: { ...prev.website, ...updates }
        }));
    };

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onboardOrganization(formData);
            router.push('/organizations');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ─── Step Renderers ─────────────────────────────

    const renderStep1 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Select Client Type</h2>
                <p className="text-slate-500 font-medium">Is this onboarding for a full brokerage or an individual agent?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        id: 'BROKERAGE',
                        title: 'Real Estate Brokerage',
                        desc: 'A complete agency with multiple agents under their umbrella.',
                        icon: '🏢'
                    },
                    {
                        id: 'INDIVIDUAL_AGENT',
                        title: 'Individual Agent',
                        desc: 'A solo real estate professional operating independently.',
                        icon: '👤'
                    }
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => {
                            updateOrg({ type: type.id as OrganizationType });
                            handleNext();
                        }}
                        className={`p-8 rounded-[32px] border-4 text-left transition-all duration-300 group hover:shadow-2xl ${formData.organization.type === type.id
                            ? 'border-indigo-600 bg-indigo-50/50'
                            : 'border-slate-100 bg-white hover:border-indigo-200'
                            }`}
                    >
                        <div className="text-5xl mb-6">{type.icon}</div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{type.title}</h3>
                        <p className="text-slate-500 font-medium mt-2 leading-relaxed">{type.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Organization Details</h2>
                <p className="text-slate-500 font-medium">Basic contact and identification information for the {formData.organization.type.toLowerCase().replace('_', ' ')}.</p>
            </div>
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[32px]">
                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organization Name</label>
                    <input
                        type="text"
                        value={formData.organization.name}
                        onChange={(e) => updateOrg({ name: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                        placeholder="e.g. Toronto Realty Group"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                    <input
                        type="email"
                        value={formData.organization.email}
                        onChange={(e) => updateOrg({ email: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                        placeholder="contact@company.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                    <input
                        type="tel"
                        value={formData.organization.phone}
                        onChange={(e) => updateOrg({ phone: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timezone</label>
                    <select
                        value={formData.organization.timezone}
                        onChange={(e) => updateOrg({ timezone: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold"
                    >
                        <option>America/Toronto</option>
                        <option>America/New_York</option>
                        <option>America/Los_Angeles</option>
                        <option>Europe/London</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-between pt-6">
                <button onClick={handleBack} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                <button
                    onClick={handleNext}
                    disabled={!formData.organization.name || !formData.organization.email}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Create Admin User</h2>
                <p className="text-slate-500 font-medium">This user will be the primary administrator (CLIENT_ADMIN) for the organization.</p>
            </div>
            <div className="space-y-6 bg-slate-50 p-8 rounded-[32px]">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                    <input
                        type="text"
                        value={formData.adminUser.name}
                        onChange={(e) => updateUser({ name: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-lg"
                        placeholder="e.g. John Smith"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Login Email</label>
                    <input
                        type="email"
                        value={formData.adminUser.email}
                        onChange={(e) => updateUser({ email: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-lg"
                        placeholder="admin@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                    <input
                        type="password"
                        value={formData.adminUser.password}
                        onChange={(e) => updateUser({ password: e.target.value })}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium text-lg"
                        placeholder="••••••••"
                    />
                </div>
            </div>
            <div className="flex justify-between pt-6">
                <button onClick={handleBack} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                <button
                    onClick={handleNext}
                    disabled={!formData.adminUser.name || !formData.adminUser.email || !formData.adminUser.password}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all disabled:opacity-50"
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => {
        const isBrokerage = formData.organization.type === 'BROKERAGE';

        const toggleTemplate = (id: string) => {
            const current = formData.templates.additionalTemplateIds;
            if (current.includes(id)) {
                updateTemplates({ additionalTemplateIds: current.filter(t => t !== id) });
            } else {
                updateTemplates({ additionalTemplateIds: [...current, id] });
            }
        };

        const setMainTemplate = (id: string) => {
            updateTemplates({ mainWebsiteTemplateId: id });
            // For individual agents, the main is the only one
            if (!isBrokerage) {
                updateTemplates({ additionalTemplateIds: [id] });
            }
        };

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Assign Design Templates</h2>
                    <p className="text-slate-500 font-medium">
                        {isBrokerage
                            ? 'Select the main website design AND additional designs for future agent websites.'
                            : 'Select the design for the agent website.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {PLATFORM_TEMPLATES.map((tpl: Template) => {
                        const isMain = formData.templates.mainWebsiteTemplateId === tpl.templateKey;
                        const isAdditional = formData.templates.additionalTemplateIds.includes(tpl.templateKey);
                        const isSelected = isMain || isAdditional;

                        return (
                            <div
                                key={tpl.id}
                                className={`group relative rounded-3xl border-4 transition-all duration-300 overflow-hidden cursor-pointer ${isSelected ? 'border-indigo-600 shadow-xl' : 'border-slate-100'
                                    }`}
                                onClick={() => {
                                    if (isBrokerage) {
                                        if (!formData.templates.mainWebsiteTemplateId) {
                                            setMainTemplate(tpl.templateKey);
                                        } else {
                                            toggleTemplate(tpl.templateKey);
                                        }
                                    } else {
                                        setMainTemplate(tpl.templateKey);
                                    }
                                }}
                            >
                                <img src={tpl.previewImage} alt={tpl.templateName} className="h-40 w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                                <div className="p-4 bg-white">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">{tpl.templateName}</h4>
                                    <div className="flex gap-1">
                                        {isMain && <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-lg uppercase">MAIN SITE</span>}
                                        {isAdditional && isBrokerage && !isMain && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-lg uppercase">AGENT READY</span>}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {isBrokerage && formData.templates.mainWebsiteTemplateId && (
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="h-2 w-2 bg-indigo-600 rounded-full animate-pulse" />
                            Main Template Selection
                        </p>
                        <h3 className="text-lg font-black text-slate-900 mt-1">
                            {PLATFORM_TEMPLATES.find(t => t.templateKey === formData.templates.mainWebsiteTemplateId)?.templateName}
                            <button
                                onClick={() => updateTemplates({ mainWebsiteTemplateId: '' })}
                                className="ml-4 text-[9px] text-slate-400 hover:text-rose-500 underline"
                            >
                                Change
                            </button>
                        </h3>
                    </div>
                )}

                <div className="flex justify-between pt-6">
                    <button onClick={handleBack} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                    <button
                        onClick={handleNext}
                        disabled={!formData.templates.mainWebsiteTemplateId}
                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all disabled:opacity-50"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    };

    const renderStep5 = () => {
        const isBrokerage = formData.organization.type === 'BROKERAGE';
        const expectedSiteType = isBrokerage ? 'BROKERAGE_SITE' : 'AGENT_SITE';

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Final Step: Generate Website</h2>
                    <p className="text-slate-500 font-medium">Provisioning the initial website instance for {formData.organization.name}.</p>
                </div>

                <div className="bg-slate-900 p-10 rounded-[40px] shadow-3xl text-white space-y-8 relative overflow-hidden">
                    {/* Visual Flare */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Website Domain</label>
                            <input
                                type="text"
                                value={formData.website.domain}
                                onChange={(e) => updateWebsite({ domain: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-5 text-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. www.torontorealty.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Locale</label>
                                <select
                                    value={formData.website.defaultLanguage}
                                    onChange={(e) => updateWebsite({ defaultLanguage: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none"
                                >
                                    <option>English (US/CA)</option>
                                    <option>French (CA)</option>
                                    <option>Spanish</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Website Type</label>
                                <div className="px-6 py-4 bg-indigo-900/40 border border-indigo-500/30 rounded-2xl text-[10px] font-black tracking-widest flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-indigo-400 rounded-full" />
                                    {expectedSiteType}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-6">
                    <button onClick={handleBack} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Back</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.website.domain}
                        className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50 relative overflow-hidden group"
                    >
                        {loading ? (
                            <span className="flex items-center gap-3">
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                PROVISIONING...
                            </span>
                        ) : (
                            'FINISH ONBOARDING'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-white rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-50 overflow-hidden flex flex-col md:flex-row min-h-[650px]">

                {/* Lateral Progress Tracker */}
                <div className="w-full md:w-80 bg-slate-900 p-12 text-white flex flex-col">
                    <div className="mb-12">
                        <h1 className="text-xl font-black tracking-tight">Onboarding<br /><span className="text-indigo-400">Wizard</span></h1>
                    </div>

                    <div className="flex-1 space-y-8">
                        {[
                            { step: 1, label: 'Client Type' },
                            { step: 2, label: 'Organization' },
                            { step: 3, label: 'Admin User' },
                            { step: 4, label: 'Templates' },
                            { step: 5, label: 'Website' },
                        ].map((s) => (
                            <div key={s.step} className="flex items-center gap-4 group cursor-pointer" onClick={() => step > s.step && setStep(s.step)}>
                                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 ${step === s.step ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-500/20' :
                                    step > s.step ? 'bg-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-slate-800 text-slate-600'
                                    }`}>
                                    {step > s.step ? (
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                                    ) : s.step}
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${step === s.step ? 'text-indigo-400' : 'text-slate-600'}`}>Step 0{s.step}</p>
                                    <p className={`font-bold transition-all ${step === s.step ? 'text-white' : 'text-slate-500'}`}>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black">?</div>
                            <p className="text-[10px] text-slate-500 leading-relaxed">Need help onboarding? Review reaching out to platform support.</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-12 overflow-y-auto">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </div>
            </div>
        </div>
    );
}
