'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrgType, getTemplates, checkDomainAvailability } from '@repo/services';
import { StatusBadge } from '@repo/ui';
import { useOnboardingStore } from '@/stores/state/onboardingStore';

/* ─── Components ───────────────────────────────────── */

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { id: 1, name: 'Client Type' },
        { id: 2, name: 'Details' },
        { id: 3, name: 'Website' },
        { id: 4, name: 'Modules' },
        { id: 5, name: 'Provision' },
    ];

    return (
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 p-4 backdrop-blur-xl">
            <div className="flex justify-between">
                {steps.map((step) => (
                    <div key={step.id} className="relative flex flex-1 flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${currentStep > step.id
                            ? 'bg-indigo-600 border-indigo-600'
                            : currentStep === step.id
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                : 'border-white/10 text-slate-600'
                            }`}>
                            {currentStep > step.id ? (
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <span className="text-xs font-bold">{step.id}</span>
                            )}
                        </div>
                        <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${currentStep === step.id ? 'text-indigo-400' : 'text-slate-500'
                            }`}>
                            {step.name}
                        </span>
                        {step.id < steps.length && (
                            <div className="absolute left-[calc(50%+1.5rem)] top-4 h-[2px] w-[calc(100%-3rem)] bg-white/5">
                                <div className={`h-full bg-indigo-600 transition-all duration-500 ${currentStep > step.id ? 'w-full' : 'w-0'}`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─── Wizard Steps ─────────────────────────────────── */

const Step1ClientType = () => {
    const { data, updateData, nextStep } = useOnboardingStore();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Select Client Type</h2>
                <p className="text-slate-400">This will customize the onboarding experience and default configurations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => { updateData({ clientType: OrgType.BROKERAGE }); nextStep(); }}
                    className={`p-8 rounded-3xl border transition-all text-left group ${data.clientType === OrgType.BROKERAGE
                        ? 'bg-indigo-600/10 border-indigo-500 ring-4 ring-indigo-500/10'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                        }`}
                >
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold">Brokerage</h3>
                    <p className="text-slate-400 text-sm mt-2">Full platform with team management, multiple agent sites, and robust DDF processing.</p>
                </button>

                <button
                    onClick={() => { updateData({ clientType: OrgType.AGENT }); nextStep(); }}
                    className={`p-8 rounded-3xl border transition-all text-left group ${data.clientType === OrgType.AGENT
                        ? 'bg-purple-600/10 border-purple-500 ring-4 ring-purple-500/10'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                        }`}
                >
                    <div className="h-12 w-12 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold">Individual Agent</h3>
                    <p className="text-slate-400 text-sm mt-2">Lightweight personal site focused on lead capture and personal branding.</p>
                </button>
            </div>
        </div>
    );
};

const Step2OrgDetails = () => {
    const { data, updateOrgDetails, updateAdminUser, nextStep, prevStep } = useOnboardingStore();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!data.orgDetails.legalName) newErrors.legalName = 'Legal name is required';
        if (!data.orgDetails.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(data.orgDetails.email)) newErrors.email = 'Invalid email format';
        if (!data.orgDetails.phone) newErrors.phone = 'Phone is required';
        if (!data.orgDetails.province) newErrors.province = 'Province is required';

        if (!data.adminUser.firstName) newErrors.adminFirstName = 'Required';
        if (!data.adminUser.lastName) newErrors.adminLastName = 'Required';
        if (!data.adminUser.email) newErrors.adminEmail = 'Required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) nextStep();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px]">1</span>
                        Organization Identity
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Legal Name</label>
                        <input
                            type="text"
                            value={data.orgDetails.legalName}
                            onChange={(e) => updateOrgDetails({ legalName: e.target.value })}
                            className={`w-full bg-slate-800/50 border ${errors.legalName ? 'border-rose-500' : 'border-white/5'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Display Name (Public)</label>
                        <input
                            type="text"
                            value={data.orgDetails.displayName}
                            onChange={(e) => updateOrgDetails({ displayName: e.target.value })}
                            className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                            <input
                                type="tel"
                                value={data.orgDetails.phone}
                                onChange={(e) => updateOrgDetails({ phone: e.target.value })}
                                className={`w-full bg-slate-800/50 border ${errors.phone ? 'border-rose-500' : 'border-white/5'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Province</label>
                            <select
                                value={data.orgDetails.province}
                                onChange={(e) => updateOrgDetails({ province: e.target.value })}
                                className={`w-full bg-slate-800/50 border ${errors.province ? 'border-rose-500' : 'border-white/5'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all`}
                            >
                                <option value="">Select...</option>
                                <option value="ON">Ontario</option>
                                <option value="BC">British Columbia</option>
                                <option value="QC">Quebec</option>
                                <option value="AB">Alberta</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px]">2</span>
                        Main Account Administrator
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                            <input
                                type="text"
                                value={data.adminUser.firstName}
                                onChange={(e) => updateAdminUser({ firstName: e.target.value })}
                                className={`w-full bg-slate-800/50 border ${errors.adminFirstName ? 'border-rose-500' : 'border-white/5'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                            <input
                                type="text"
                                value={data.adminUser.lastName}
                                onChange={(e) => updateAdminUser({ lastName: e.target.value })}
                                className={`w-full bg-slate-800/50 border ${errors.adminLastName ? 'border-rose-500' : 'border-white/5'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Administrator Email</label>
                        <input
                            type="email"
                            value={data.adminUser.email}
                            onChange={(e) => updateAdminUser({ email: e.target.value })}
                            className={`w-full bg-slate-800/50 border ${errors.adminEmail ? 'border-rose-500' : 'border-white/5'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all`}
                        />
                        <p className="text-[10px] text-slate-500 italic">This address will be used for first-time login and activation.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-white/5">
                <button onClick={prevStep} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold">Back</button>
                <button onClick={handleNext} className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-semibold">Continue to Website Setup</button>
            </div>
        </div>
    );
};

const Step3WebsiteSetup = () => {
    const { data, updateWebsiteSetup, nextStep, prevStep } = useOnboardingStore();
    const [templates, setTemplates] = useState<any[]>([]);
    const [checkingDomain, setCheckingDomain] = useState(false);
    const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        getTemplates().then(setTemplates);
    }, []);

    const validateDomain = async (domain: string) => {
        if (!domain) return;
        setCheckingDomain(true);
        const available = await checkDomainAvailability(domain);
        setDomainAvailable(available);
        setCheckingDomain(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Template (Mandatory)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {templates.map((tpl) => (
                        <button
                            key={tpl.id}
                            onClick={() => updateWebsiteSetup({ templateId: tpl.id })}
                            className={`relative overflow-hidden rounded-2xl border transition-all text-left ${data.websiteSetup.templateId === tpl.id
                                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                : 'border-white/5 grayscale hover:grayscale-0'
                                }`}
                        >
                            <div className="aspect-video bg-slate-800 w-full" />
                            <div className="p-3 bg-slate-900">
                                <h4 className="text-xs font-bold">{tpl.name}</h4>
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{tpl.description}</p>
                            </div>
                            {data.websiteSetup.templateId === tpl.id && (
                                <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1 shadow-lg">
                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Primary Domain / Subdomain</label>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="my-brokerage.realestate.com"
                            value={data.websiteSetup.domain}
                            onChange={(e) => { updateWebsiteSetup({ domain: e.target.value }); setDomainAvailable(null); }}
                            onBlur={(e) => validateDomain(e.target.value)}
                            className={`w-full bg-slate-900 border ${domainAvailable === true ? 'border-emerald-500/50' :
                                domainAvailable === false ? 'border-rose-500/50' : 'border-white/10'
                                } rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-mono text-sm`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {checkingDomain && <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                            {domainAvailable === true && <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                            {domainAvailable === false && <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                        </div>
                    </div>
                    {domainAvailable === false && <p className="text-[10px] text-rose-400">This domain is already in use.</p>}
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lead Routing Method</label>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { id: 'round-robin', name: 'Round Robin', desc: 'Distribute equally among agents' },
                            { id: 'direct', name: 'Direct Assignment', desc: 'Based on territory or listing owner' },
                            { id: 'first-response', name: 'Race to Claim', desc: 'First agent to respond gets the lead' }
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => updateWebsiteSetup({ leadRouting: mode.id as any })}
                                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${data.websiteSetup.leadRouting === mode.id
                                    ? 'bg-indigo-600/10 border-indigo-500/50'
                                    : 'bg-slate-900 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div>
                                    <h5 className="text-xs font-bold">{mode.name}</h5>
                                    <p className="text-[10px] text-slate-500">{mode.desc}</p>
                                </div>
                                <div className={`h-4 w-4 rounded-full border-2 ${data.websiteSetup.leadRouting === mode.id ? 'bg-indigo-500 border-indigo-500' : 'border-white/10'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-white/5">
                <button onClick={prevStep} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold">Back</button>
                <button
                    disabled={!data.websiteSetup.templateId || !data.websiteSetup.domain || domainAvailable === false}
                    onClick={nextStep}
                    className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-semibold disabled:opacity-30"
                >
                    Continue to Modules
                </button>
            </div>
        </div>
    );
};

const Step4Modules = () => {
    const { data, updateModules, nextStep, prevStep } = useOnboardingStore();

    const modules = [
        { id: 'listings', name: 'Listings (DDF)', desc: 'Automated CREA DDF property synchronization.', group: 'Core' },
        { id: 'mapSearch', name: 'Map Search', desc: 'Interactive map-based property discovery.', group: 'Core', dependencies: ['listings'] },
        { id: 'leadCRM', name: 'Lead CRM', desc: 'Built-in management for inquiries and showings.', group: 'Growth' },
        { id: 'emailNotifications', name: 'Email Notifications', desc: 'Automated listing alerts for clients.', group: 'Growth', dependencies: ['leadCRM'] },
        { id: 'blog', name: 'Content Blog', desc: 'Publish SEO articles and market insights.', group: 'Content' },
        { id: 'neighborhoodPages', name: 'Neighborhood Guides', desc: 'Rich content pages for specific areas.', group: 'Content' },
        { id: 'analytics', name: 'Performance Analytics', desc: 'Detailed tracking of traffic and conversion.', group: 'Admin' },
        { id: 'teamManagement', name: 'Team Management', desc: 'Roster and permissions for agents.', group: 'Admin' },
        { id: 'sms', name: 'SMS Alerts', desc: 'Immediate mobile notifications for agents.', group: 'Growth', optional: true },
    ];

    const toggleModule = (id: string) => {
        const current = (data.modules as any)[id];
        const updates: any = { [id]: !current };

        // Handle dependencies (simplified)
        if (!current === false) { // Disabling
            modules.filter(m => m.dependencies?.includes(id)).forEach(m => {
                updates[m.id] = false;
            });
        }

        updateModules(updates);
    };

    const groups = ['Core', 'Growth', 'Content', 'Admin'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {groups.map(group => (
                <div key={group} className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-4">
                        {group}
                        <div className="h-px bg-white/5 flex-1" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.filter(m => m.group === group).map(m => {
                            const active = (data.modules as any)[m.id];
                            const disabledByDep = m.dependencies?.some(dep => !(data.modules as any)[dep]);

                            return (
                                <button
                                    key={m.id}
                                    disabled={disabledByDep}
                                    onClick={() => toggleModule(m.id)}
                                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-32 ${active
                                        ? 'bg-indigo-600/10 border-indigo-500/50'
                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                        } ${disabledByDep ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold">{m.name}</h4>
                                            <div className={`h-4 w-8 rounded-full relative transition-colors ${active ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                                <div className={`absolute top-0.5 h-3 w-3 bg-white rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2">{m.desc}</p>
                                    </div>
                                    {disabledByDep && (
                                        <div className="text-[9px] text-amber-500/70 italic mt-auto">Requires {m.dependencies?.join(', ')}</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="flex justify-between pt-6 border-t border-white/5">
                <button onClick={prevStep} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold">Back</button>
                <button onClick={nextStep} className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-semibold">Review & Finish</button>
            </div>
        </div>
    );
};

const Step5Review = () => {
    const { data, provisioning, startProvisioning, reset, setStep, prevStep } = useOnboardingStore();
    const router = useRouter();

    const handleConfirm = () => {
        startProvisioning(() => {
            setTimeout(() => {
                reset();
                router.push('/organizations');
            }, 2000);
        });
    };

    if (provisioning.isProcessing || provisioning.currentStep?.step === 'complete') {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-700">
                <div className="relative mb-8">
                    <div className="h-24 w-24 rounded-full border-4 border-white/5 border-t-indigo-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">
                        {provisioning.currentStep?.progress || 0}%
                    </div>
                </div>
                <h3 className="text-xl font-bold">{provisioning.currentStep?.label || 'Initializing Provisioning...'}</h3>
                <p className="text-slate-500 mt-2 text-sm max-w-md text-center">We are setting up your isolated tenant environment, database partitions, and branding assets.</p>

                <div className="w-full max-w-xl bg-white/5 h-1.5 rounded-full mt-10 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000 ease-out"
                        style={{ width: `${provisioning.currentStep?.progress || 0}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary Cards */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Organization & Admin</h3>
                            <button onClick={() => setStep(2)} className="text-xs text-indigo-400 hover:text-indigo-300">Edit Details</button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase font-black uppercase">Legal Entity</label>
                                <p className="font-semibold">{data.orgDetails.legalName}</p>
                                <StatusBadge label={data.clientType || 'Unknown'} type="info" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase font-black uppercase">Root Admin Account</label>
                                <p className="font-semibold">{data.adminUser.firstName} {data.adminUser.lastName}</p>
                                <p className="text-xs text-slate-400">{data.adminUser.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Website Configuration</h3>
                            <button onClick={() => setStep(3)} className="text-xs text-indigo-400 hover:text-indigo-300">Edit Setup</button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase font-black uppercase">Primary Domain</label>
                                <p className="font-mono text-xs text-indigo-400">{data.websiteSetup.domain}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase font-black uppercase">Template Selection</label>
                                <p className="font-semibold">{data.websiteSetup.templateId}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Modules</h3>
                        <button onClick={() => setStep(4)} className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(data.modules).filter(([_, v]) => v).map(([k]) => (
                            <div key={k} className="flex items-center gap-3 text-xs text-slate-300">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-center space-y-4">
                <h3 className="text-xl font-bold">Ready to Provision?</h3>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">This will trigger the automated deployment pipeline for the new tenant. The process is asynchronous but you will see progress in real-time.</p>
                <div className="flex justify-center gap-4 pt-4">
                    <button onClick={prevStep} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold">Back to Review</button>
                    <button
                        onClick={handleConfirm}
                        className="px-10 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-bold shadow-xl shadow-indigo-500/20"
                    >
                        Provision Website
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Main Page Component ─────────────────────────── */

export default function OnboardingPage() {
    const { step, reset } = useOnboardingStore();
    const router = useRouter();

    const handleCancel = () => {
        if (confirm('Cancel onboarding? All entered data will be lost.')) {
            reset();
            router.push('/organizations');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Provision New Tenant</h1>
                    <p className="text-slate-400 mt-1">Structured 5-step automated onboarding wizard</p>
                </div>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest border border-white/5 rounded-xl hover:bg-rose-500/10"
                >
                    Cancel
                </button>
            </div>

            <StepIndicator currentStep={step} />

            <div className="relative min-h-[400px]">
                {step === 1 && <Step1ClientType />}
                {step === 2 && <Step2OrgDetails />}
                {step === 3 && <Step3WebsiteSetup />}
                {step === 4 && <Step4Modules />}
                {step === 5 && <Step5Review />}
            </div>
        </div>
    );
}
