'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    shortcodeConfigService,
    getOrganizations,
    agentService,
    OrganizationDashboardItem as Organization,
    useNotificationStore
} from '@repo/services';
import { ShortcodeConfig, Agent, ShortcodeFilters } from '@repo/types';

export default function ShortcodesPage() {
    const [configs, setConfigs] = useState<ShortcodeConfig[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<ShortcodeConfig | null>(null);

    // Refactored Form State for MLS Requirements
    const [formData, setFormData] = useState<{
        shortcodeName: string;
        description: string;
        listingType: 'latest' | 'featured' | 'manual' | 'custom';
        assignType: 'organization' | 'agent';
        assignId: string;
        manualIds: string;
        limit: number;
        sort: 'latest' | 'price_asc' | 'price_desc';
        filters: ShortcodeFilters;
    }>({
        shortcodeName: '',
        description: '',
        listingType: 'custom',
        assignType: 'organization',
        assignId: '',
        manualIds: '',
        limit: 12,
        sort: 'latest',
        filters: {
            city: '',
            propertyType: '',
            status: undefined,
            minPrice: 0,
            maxPrice: 0,
            bedrooms: 0,
            bathrooms: 0,
            featured: false
        }
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [allConfigs, orgsRes, allAgents] = await Promise.all([
                shortcodeConfigService.getConfigs({ role: 'super_admin' }),
                getOrganizations({ page: 1, limit: 100 }),
                agentService.getAllAgents()
            ]);
            setConfigs(allConfigs);
            setOrganizations(orgsRes.items);
            setAgents(allAgents);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateShortcode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.assignId) {
            alert('Please select a target for assignment.');
            return;
        }

        setIsSaving(true);
        try {
            let websiteId = '';
            let organizationId: string | null = null;

            if (formData.assignType === 'organization') {
                const org = organizations.find(o => o.id === formData.assignId);
                organizationId = org?.id || null;
                websiteId = `website-org-${formData.assignId}`;
            } else {
                const agent = agents.find(a => a.id === formData.assignId);
                organizationId = agent?.organizationId || null;
                websiteId = `website-agent-${agent?.id}`;
            }

            // Sync features based on listing type
            const finalFilters = { ...formData.filters };
            if (formData.listingType === 'featured') {
                finalFilters.featured = true;
            }

            shortcodeConfigService.createConfig({
                shortcodeName: formData.shortcodeName,
                organizationId,
                websiteId,
                createdByRole: 'super_admin',
                filters: finalFilters,
                limit: formData.limit,
                sort: formData.sort,
                isActive: true
            });

            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Shortcode Published',
                message: `Shortcode "${formData.shortcodeName}" is now active and ready for use.`
            });

            setIsModalOpen(false);
            setFormData({
                shortcodeName: '',
                description: '',
                listingType: 'custom',
                assignType: 'organization',
                assignId: '',
                manualIds: '',
                limit: 12,
                sort: 'latest',
                filters: {
                    city: '',
                    propertyType: '',
                    status: undefined,
                    minPrice: 0,
                    maxPrice: 0,
                    bedrooms: 0,
                    bathrooms: 0,
                    featured: false
                }
            });
            fetchData();
        } catch (error) {
            console.error('Failed to create shortcode', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Permanently remove this shortcode configuration?')) {
            shortcodeConfigService.deleteConfig(id);
            fetchData();
            if (selectedConfig?.id === id) setSelectedConfig(null);
        }
    };

    const getAssignmentName = (config: ShortcodeConfig) => {
        const assignedOrg = organizations.find(o => o.id === config.organizationId);
        const assignedAgent = agents.find(a => `website-agent-${a.id}` === config.websiteId);
        if (assignedOrg) return { name: assignedOrg.name, type: 'Brokerage' };
        if (assignedAgent) return { name: assignedAgent.name, type: 'Agent' };
        return { name: 'External Hub', type: 'System' };
    };

    return (
        <div className="space-y-10 relative">
            {/* Side Detail Panel (Shortcode Briefing) */}
            <div className={`fixed inset-y-0 right-0 w-[500px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedConfig ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedConfig && (
                    <div className="h-full flex flex-col p-10 overflow-y-auto">
                        <div className="flex items-center justify-between mb-12">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">MLS Configuration</span>
                            <button onClick={() => setSelectedConfig(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="mb-12">
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight border-l-4 border-slate-900 pl-6 mb-8 uppercase">
                                {selectedConfig.shortcodeName}
                            </h4>
                            <div className="p-6 bg-slate-100/50 rounded-[28px] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Copy Shortcode Snippet</p>
                                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                                    <code className="text-indigo-600 text-xs font-mono">
                                        [listings config="{selectedConfig.shortcodeName}"]
                                    </code>
                                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[24px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Account</p>
                                    <p className="text-sm font-black text-slate-900 uppercase truncate">{getAssignmentName(selectedConfig).name}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[24px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deployment ID</p>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase truncate">{selectedConfig.websiteId}</p>
                                </div>
                            </div>

                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6">Real Estate Filter Logic</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Market City', value: selectedConfig.filters.city || 'MLS Global' },
                                        { label: 'Property Type', value: selectedConfig.filters.propertyType || 'All Residential' },
                                        { label: 'Display Capacity', value: `${selectedConfig.limit} Cards` },
                                        { label: 'Presentation Order', value: (selectedConfig.sort || 'latest').toUpperCase() },
                                        { label: 'Status Filter', value: selectedConfig.filters.status || 'Active Only' },
                                        { label: 'Pricing (Min)', value: selectedConfig.filters.minPrice ? `$${selectedConfig.filters.minPrice.toLocaleString()}` : 'No Minimum' },
                                    ].map((row, i) => (
                                        <div key={i} className="p-5 bg-white border border-slate-100 rounded-[24px]">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{row.label}</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{row.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={(e) => handleDelete(selectedConfig.id, e as any)} className="w-full py-5 bg-rose-50 text-rose-600 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-600 hover:text-white transition-all">
                                Delete Configuration
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-0.5 w-10 bg-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 leading-none">MLS Listing Engine</span>
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none uppercase">Shortcodes</h1>
                        <p className="text-xl font-medium text-slate-400 mt-4 tracking-tighter">Manage reusable listing components and MLS filter configurations.</p>
                    </div>
                </div>
                <div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl flex items-center gap-4 group"
                    >
                        Create New Shortcode
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                </div>
            </div>

            {/* Config Table */}
            <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto min-w-[1200px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shortcode Name</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned To</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Filter Summary</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-10 py-10 animate-pulse"><div className="h-6 bg-slate-50 rounded-lg w-full" /></td></tr>
                                ))
                            ) : configs.length === 0 ? (
                                <tr><td colSpan={5} className="px-10 py-32 text-center text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">Registry is empty.</td></tr>
                            ) : configs.map((config) => {
                                const assignment = getAssignmentName(config);
                                return (
                                    <tr
                                        key={config.id}
                                        onClick={() => setSelectedConfig(config)}
                                        className="group hover:bg-indigo-50/50 transition-all cursor-pointer"
                                    >
                                        <td className="px-10 py-8">
                                            <p className="text-base font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase font-mono leading-none">
                                                {config.shortcodeName}
                                            </p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{assignment.name}</span>
                                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">{assignment.type} Account</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-wrap gap-2 max-w-xs">
                                                {config.filters.city && <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-600">{config.filters.city}</span>}
                                                <span className="px-2.5 py-1 bg-indigo-50 rounded-lg text-[10px] font-black uppercase text-indigo-600">{config.limit} Listings</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${config.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {config.isActive ? 'Active' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button onClick={(e) => handleDelete(config.id, e as any)} className="p-3 text-slate-300 hover:text-rose-600 transition-all">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REFACTORED MLS SHORTCODE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[50px] border border-slate-200 shadow-[0_30px_100px_rgba(0,0,0,0.1)] w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Configure MLS Shortcode</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-3">Define listing filters and presentation settings</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white hover:shadow-xl rounded-[20px] transition-all group">
                                <svg className="h-6 w-6 text-slate-400 group-hover:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateShortcode} className="p-12 space-y-12 overflow-y-auto flex-1 scrollbar-hide">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Left Section: Global & Assignment */}
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 flex items-center gap-2">
                                            <span className="w-8 h-px bg-indigo-600/30" />
                                            Required Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shortcode Name *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. Featured Luxury"
                                                    value={formData.shortcodeName}
                                                    onChange={(e) => setFormData({ ...formData, shortcodeName: e.target.value })}
                                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Describe the purpose of this configuration..."
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-8 border-t border-slate-50">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 flex items-center gap-2">
                                            <span className="w-8 h-px bg-indigo-600/30" />
                                            Assign Target
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            {['organization', 'agent'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, assignType: type as any, assignId: '' })}
                                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.assignType === type ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {type} Account
                                                </button>
                                            ))}
                                        </div>
                                        <select
                                            required
                                            value={formData.assignId}
                                            onChange={(e) => setFormData({ ...formData, assignId: e.target.value })}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-900 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="">Select Hub Component...</option>
                                            {formData.assignType === 'organization'
                                                ? organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)
                                                : agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)
                                            }
                                        </select>
                                    </div>
                                </div>

                                {/* Right Section: Listing Logic */}
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 flex items-center gap-2">
                                            <span className="w-8 h-px bg-indigo-600/30" />
                                            Listing Selection Protocol
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'latest', label: 'Latest Listings' },
                                                { id: 'featured', label: 'Featured Listings' },
                                                { id: 'manual', label: 'Manual IDs' },
                                                { id: 'custom', label: 'Custom Filters' }
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, listingType: type.id as any })}
                                                    className={`py-4 px-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] transition-all border-2 ${formData.listingType === type.id ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'}`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Conditional Listing Settings */}
                                    <div className="bg-slate-50 rounded-[40px] p-8 space-y-6 border border-slate-100 transition-all">
                                        {formData.listingType === 'manual' ? (
                                            <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MLS Number(s) *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Separate by commas (e.g. 123, 456)"
                                                    value={formData.manualIds}
                                                    onChange={(e) => setFormData({ ...formData, manualIds: e.target.value })}
                                                    className="w-full bg-white border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-300">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target City</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MLS Global"
                                                        value={formData.filters.city}
                                                        onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, city: e.target.value } })}
                                                        className="w-full bg-white border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Type</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Residential"
                                                        value={formData.filters.propertyType as string}
                                                        onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, propertyType: e.target.value } })}
                                                        className="w-full bg-white border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Status</label>
                                                    <select
                                                        value={formData.filters.status as string || ''}
                                                        onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, status: (e.target.value || undefined) as any } })}
                                                        className="w-full bg-white border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                                                    >
                                                        <option value="">All Statuses</option>
                                                        <option value="For Sale">For Sale</option>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Sold">Sold</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2 flex items-center gap-4 pt-6">
                                                    {/* Group Price */}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Price</label>
                                                    <input
                                                        type="number"
                                                        value={formData.filters.minPrice}
                                                        onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, minPrice: parseInt(e.target.value) } })}
                                                        className="w-full bg-white border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Price</label>
                                                    <input
                                                        type="number"
                                                        value={formData.filters.maxPrice}
                                                        onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, maxPrice: parseInt(e.target.value) } })}
                                                        className="w-full bg-white border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beds</label>
                                                    <input
                                                        type="number"
                                                        value={formData.filters.bedrooms}
                                                        onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, bedrooms: parseInt(e.target.value) } })}
                                                        className="w-full bg-white border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baths</label>
                                                    <input
                                                        type="number"
                                                        value={formData.filters.bathrooms}
                                                        onChange={(e) => setFormData({ ...formData, filters: { ...formData.filters, bathrooms: parseInt(e.target.value) } })}
                                                        className="w-full bg-white border-none rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Listing Limit</label>
                                            <input
                                                type="number"
                                                value={formData.limit}
                                                onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Sort</label>
                                            <select
                                                value={formData.sort}
                                                onChange={(e) => setFormData({ ...formData, sort: e.target.value as any })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-900 outline-none cursor-pointer"
                                            >
                                                <option value="latest">Newest First</option>
                                                <option value="price_asc">Price Index (Low)</option>
                                                <option value="price_desc">Price Index (High)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-6 pt-12 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-16 py-5 rounded-[28px] bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-4"
                                >
                                    {isSaving ? 'Processing Content...' : 'Publish MLS Shortcode'}
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
