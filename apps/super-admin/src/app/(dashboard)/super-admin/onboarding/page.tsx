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
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex justify-between">
                {steps.map((step) => (
                    <div key={step.id} className="relative flex flex-1 flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${currentStep > step.id
                            ? 'bg-indigo-600 border-indigo-600'
                            : currentStep === step.id
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                : 'border-slate-100 bg-slate-50 text-slate-300'
                            }`}>
                            {currentStep > step.id ? (
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <span className="text-xs font-bold">{step.id}</span>
                            )}
                        </div>
                        <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${currentStep === step.id ? 'text-indigo-600' : 'text-slate-400'
                            }`}>
                            {step.name}
                        </span>
                        {step.id < steps.length && (
                            <div className="absolute left-[calc(50%+1.5rem)] top-4 h-[2px] w-[calc(100%-3rem)] bg-slate-100">
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
                <h2 className="text-2xl font-bold text-slate-900">Select Client Type</h2>
                <p className="text-slate-500">This will customize the onboarding experience and default configurations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => { updateData({ clientType: OrgType.BROKERAGE }); nextStep(); }}
                    className={`p-8 rounded-3xl border transition-all text-left group ${data.clientType === OrgType.BROKERAGE
                        ? 'bg-indigo-50 border-indigo-500 ring-4 ring-indigo-500/10'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                        }`}
                >
                    <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Brokerage</h3>
                    <p className="text-slate-500 text-sm mt-2">Full platform with team management, multiple agent sites, and robust DDF processing.</p>
                </button>

                <button
                    onClick={() => { updateData({ clientType: OrgType.AGENT }); nextStep(); }}
                    className={`p-8 rounded-3xl border transition-all text-left group ${data.clientType === OrgType.AGENT
                        ? 'bg-purple-50 border-purple-500 ring-4 ring-purple-500/10'
                        : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-lg'
                        }`}
                >
                    <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Individual Agent</h3>
                    <p className="text-slate-500 text-sm mt-2">Lightweight personal site focused on lead capture and personal branding.</p>
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
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">1</span>
                        Organization Identity
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legal Name</label>
                        <input
                            type="text"
                            value={data.orgDetails.legalName}
                            onChange={(e) => updateOrgDetails({ legalName: e.target.value })}
                            className={`w-full bg-slate-50 border ${errors.legalName ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all text-slate-900 font-medium`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Display Name (Public)</label>
                        <input
                            type="text"
                            value={data.orgDetails.displayName}
                            onChange={(e) => updateOrgDetails({ displayName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all text-slate-900 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                            <input
                                type="tel"
                                value={data.orgDetails.phone}
                                onChange={(e) => updateOrgDetails({ phone: e.target.value })}
                                className={`w-full bg-slate-50 border ${errors.phone ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all text-slate-900 font-medium`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Province</label>
                            <select
                                value={data.orgDetails.province}
                                onChange={(e) => updateOrgDetails({ province: e.target.value })}
                                className={`w-full bg-slate-50 border ${errors.province ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all text-slate-900 font-medium cursor-pointer`}
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
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">2</span>
                        Main Account Administrator
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                            <input
                                type="text"
                                value={data.adminUser.firstName}
                                onChange={(e) => updateAdminUser({ firstName: e.target.value })}
                                className={`w-full bg-slate-50 border ${errors.adminFirstName ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all text-slate-900 font-medium`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                            <input
                                type="text"
                                value={data.adminUser.lastName}
                                onChange={(e) => updateAdminUser({ lastName: e.target.value })}
                                className={`w-full bg-slate-50 border ${errors.adminLastName ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all text-slate-900 font-medium`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administrator Email</label>
                        <input
                            type="email"
                            value={data.adminUser.email}
                            onChange={(e) => updateAdminUser({ email: e.target.value })}
                            className={`w-full bg-slate-50 border ${errors.adminEmail ? 'border-rose-500' : 'border-slate-200'} rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all text-slate-900 font-medium`}
                        />
                        <p className="text-[10px] text-slate-400">This address will be used for first-time login and activation.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={prevStep} className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-sm font-bold text-slate-600">Back</button>
                <button onClick={handleNext} className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-bold text-white shadow-lg shadow-indigo-100">Continue to Website Setup</button>
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Selected Template (Mandatory)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {templates.map((tpl) => (
                        <button
                            key={tpl.id}
                            onClick={() => updateWebsiteSetup({ templateId: tpl.id })}
                            className={`relative overflow-hidden rounded-2xl border transition-all text-left ${data.websiteSetup.templateId === tpl.id
                                ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-50'
                                : 'border-slate-200 grayscale hover:grayscale-0 hover:border-indigo-200'
                                }`}
                        >
                            <div className="aspect-video bg-slate-100 w-full" />
                            <div className="p-3 bg-white">
                                <h4 className="text-xs font-black text-slate-900">{tpl.name}</h4>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm">
                <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Domain / Subdomain</label>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="my-brokerage.realestate.com"
                            value={data.websiteSetup.domain}
                            onChange={(e) => { updateWebsiteSetup({ domain: e.target.value }); setDomainAvailable(null); }}
                            onBlur={(e) => validateDomain(e.target.value)}
                            className={`w-full bg-white border ${domainAvailable === true ? 'border-emerald-500' :
                                domainAvailable === false ? 'border-rose-500' : 'border-slate-200'
                                } rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-mono text-sm text-slate-900`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {checkingDomain && <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                            {domainAvailable === true && <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                            {domainAvailable === false && <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                        </div>
                    </div>
                    {domainAvailable === false && <p className="text-[10px] text-rose-600 font-bold">This domain is already in use.</p>}
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Lead Routing Method</label>
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
                                    ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div>
                                    <h5 className="text-xs font-black text-slate-900">{mode.name}</h5>
                                    <p className="text-[10px] text-slate-500 font-medium">{mode.desc}</p>
                                </div>
                                <div className={`h-4 w-4 rounded-full border-2 ${data.websiteSetup.leadRouting === mode.id ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={prevStep} className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-sm font-bold text-slate-600">Back</button>
                <button
                    disabled={!data.websiteSetup.templateId || !data.websiteSetup.domain || domainAvailable === false}
                    onClick={nextStep}
                    className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-bold text-white shadow-lg shadow-indigo-100 disabled:opacity-30"
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
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
                        {group}
                        <div className="h-px bg-slate-100 flex-1" />
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
                                        ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                                        : 'bg-white border-slate-200 hover:border-indigo-200'
                                        } ${disabledByDep ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-black text-slate-900">{m.name}</h4>
                                            <div className={`h-4 w-8 rounded-full relative transition-colors ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-0.5 h-3 w-3 bg-white rounded-full transition-all shadow-sm ${active ? 'left-4.5' : 'left-0.5'}`} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2 font-medium">{m.desc}</p>
                                    </div>
                                    {disabledByDep && (
                                        <div className="text-[9px] text-amber-600 font-bold mt-auto">Requires {m.dependencies?.join(', ')}</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="flex justify-between pt-6 border-t border-slate-100">
                <button onClick={prevStep} className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-sm font-bold text-slate-600">Back</button>
                <button onClick={nextStep} className="px-8 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-sm font-bold text-white shadow-lg shadow-indigo-100">Review & Finish</button>
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

    if (provisioning.isProcessing || provisioning.currentStep?.status === 'complete') {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-700">
                <div className="relative mb-8">
                    <div className="h-24 w-24 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-slate-900">
                        {provisioning.currentStep?.progress || 0}%
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{provisioning.currentStep?.label || 'Initializing Provisioning...'}</h3>
                <p className="text-slate-500 mt-2 text-sm max-w-md text-center">We are setting up your isolated tenant environment, database partitions, and branding assets.</p>

                <div className="w-full max-w-xl bg-slate-100 h-1.5 rounded-full mt-10 overflow-hidden shadow-inner">
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
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Organization & Admin</h3>
                            <button onClick={() => setStep(2)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit Details</button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">Legal Entity</label>
                                <p className="font-bold text-slate-900">{data.orgDetails.legalName}</p>
                                <StatusBadge label={data.clientType || 'Unknown'} type="info" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">Root Admin Account</label>
                                <p className="font-bold text-slate-900">{data.adminUser.firstName} {data.adminUser.lastName}</p>
                                <p className="text-xs text-slate-500 font-medium">{data.adminUser.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Website Configuration</h3>
                            <button onClick={() => setStep(3)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit Setup</button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">Primary Domain</label>
                                <p className="font-mono text-xs text-indigo-600 font-bold">{data.websiteSetup.domain}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">Template Selection</label>
                                <p className="font-bold text-slate-900">{data.websiteSetup.templateId}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Modules</h3>
                        <button onClick={() => setStep(4)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit</button>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(data.modules).filter(([_, v]) => v).map(([k]) => (
                            <div key={k} className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100 text-center space-y-4 shadow-inner">
                <h3 className="text-xl font-black text-slate-900">Ready to Provision?</h3>
                <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">This will trigger the automated deployment pipeline for the new tenant. The process is asynchronous but you will see progress in real-time.</p>
                <div className="flex justify-center gap-4 pt-4">
                    <button onClick={prevStep} className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm font-bold shadow-sm">Back to Review</button>
                    <button
                        onClick={handleConfirm}
                        className="px-10 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all text-sm font-black text-white shadow-xl shadow-indigo-100"
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
        <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-slate-50">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Provision <span className="text-indigo-600">New Tenant</span></h1>
                    <p className="text-slate-500 mt-1 font-medium">Structured 5-step automated onboarding wizard</p>
                </div>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-xs font-black text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-[0.2em] border border-slate-200 rounded-xl bg-white hover:bg-rose-50 shadow-sm"
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
