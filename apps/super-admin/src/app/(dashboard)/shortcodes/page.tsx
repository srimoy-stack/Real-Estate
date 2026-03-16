'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    shortcodeConfigService,
    getOrganizations,
    agentService,
    OrganizationDashboardItem as Organization
} from '@repo/services';
import { ShortcodeConfig, Agent, ShortcodeFilters } from '@repo/types';
import { StatusBadge } from '@repo/ui';
import { useNotificationStore } from '@repo/services';

export default function ShortcodesPage() {
    const [configs, setConfigs] = useState<ShortcodeConfig[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        shortcodeName: '',
        assignType: 'organization' as 'organization' | 'agent',
        assignId: '',
        limit: 10,
        sort: 'latest' as 'latest' | 'price_asc' | 'price_desc',
        filters: {
            city: '',
            propertyType: '',
            minPrice: 0,
            maxPrice: 0,
            bedrooms: 0,
            bathrooms: 0,
            featured: false
        } as ShortcodeFilters
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
            alert('Please select who to assign this shortcode to.');
            return;
        }

        setIsSaving(true);
        try {
            // Find websiteId based on assignment
            let websiteId = '';
            let organizationId: string | null = null;

            if (formData.assignType === 'organization') {
                const org = organizations.find(o => o.id === formData.assignId);
                organizationId = org?.id || null;
                // In this mock setup, websiteId is often derived or mapped. 
                // We'll use a mock website ID pattern
                websiteId = `website-org-${formData.assignId}`;
            } else {
                const agent = agents.find(a => a.id === formData.assignId);
                organizationId = agent?.organizationId || null;
                websiteId = `website-agent-${formData.assignId}`;
            }

            shortcodeConfigService.createConfig({
                shortcodeName: formData.shortcodeName,
                organizationId,
                websiteId,
                createdByRole: 'super_admin',
                filters: formData.filters,
                limit: formData.limit,
                sort: formData.sort,
                isActive: true
            });

            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Shortcode Created',
                message: `Shortcode "${formData.shortcodeName}" has been successfully created.`
            });

            setIsModalOpen(false);
            // Reset form
            setFormData({
                shortcodeName: '',
                assignType: 'organization',
                assignId: '',
                limit: 10,
                sort: 'latest',
                filters: {
                    city: '',
                    propertyType: '',
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
            alert('Failed to create shortcode');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this shortcode?')) {
            shortcodeConfigService.deleteConfig(id);
            fetchData();
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 bg-white min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Shortcode Management</h1>
                    <p className="mt-1 text-slate-500 font-medium">Manage and assign listing shortcodes across all tenants</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group"
                >
                    <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Shortcode
                </button>
            </div>

            {/* Table Area */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Shortcode Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned To</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Target Website</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Filters Summary</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8" />
                                    </tr>
                                ))
                            ) : configs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">No shortcodes found. Create one to get started.</td>
                                </tr>
                            ) : configs.map((config) => {
                                const assignedOrg = organizations.find(o => o.id === config.organizationId);
                                const assignedAgent = agents.find(a => `website-agent-${a.id}` === config.websiteId);

                                return (
                                    <tr key={config.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            <code className="bg-slate-100 px-2 py-1 rounded text-indigo-600">[listings config="{config.shortcodeName}"]</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            {assignedOrg ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-700">{assignedOrg.name}</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500">Brokerage</span>
                                                </div>
                                            ) : assignedAgent ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-700">{assignedAgent.name}</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-violet-500">Agent</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">Unknown Target</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                            {config.websiteId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {config.filters.city && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">City: {config.filters.city}</span>}
                                                {config.filters.propertyType && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">Type: {config.filters.propertyType}</span>}
                                                {config.filters.minPrice ? <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">${config.filters.minPrice}+</span> : null}
                                                <span className="px-1.5 py-0.5 bg-indigo-50 rounded text-[10px] text-indigo-600 font-bold">Limit: {config.limit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge label={config.isActive ? 'Active' : 'Inactive'} type={config.isActive ? 'success' : 'neutral'} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(config.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Create <span className="text-indigo-600">Shortcode</span></h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure global listing filters for assignment</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateShortcode} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                {/* Left Side: Assignment */}
                                <div className="space-y-6">
                                    <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Target Assignment</h3>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment Type</label>
                                            <div className="flex gap-2">
                                                {['organization', 'agent'].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, assignType: type as any, assignId: '' });
                                                        }}
                                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${formData.assignType === type
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                            : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                Select {formData.assignType === 'organization' ? 'Brokerage' : 'Agent'}
                                            </label>
                                            <select
                                                required
                                                value={formData.assignId}
                                                onChange={(e) => setFormData({ ...formData, assignId: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                            >
                                                <option value="">Select Target...</option>
                                                {formData.assignType === 'organization'
                                                    ? organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)
                                                    : agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)
                                                }
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shortcode Reference Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. featured_luxury"
                                                value={formData.shortcodeName}
                                                onChange={(e) => setFormData({ ...formData, shortcodeName: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                            />
                                            <p className="text-[10px] text-slate-400 font-medium italic">This name will be used in the markdown: [listings config="..."]</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Result Limit</label>
                                                <input
                                                    type="number"
                                                    value={formData.limit}
                                                    onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Default Sort</label>
                                                <select
                                                    value={formData.sort}
                                                    onChange={(e) => setFormData({ ...formData, sort: e.target.value as any })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                                >
                                                    <option value="latest">Newest First</option>
                                                    <option value="price_asc">Price (Low to High)</option>
                                                    <option value="price_desc">Price (High to Low)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Filters */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Search Filters</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target City</label>
                                            <input
                                                type="text"
                                                placeholder="All Cities"
                                                value={formData.filters.city}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, city: e.target.value }
                                                })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Property Type</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Detached"
                                                value={formData.filters.propertyType as string}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, propertyType: e.target.value }
                                                })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Min Price ($)</label>
                                            <input
                                                type="number"
                                                value={formData.filters.minPrice}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, minPrice: parseInt(e.target.value) }
                                                })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Max Price ($)</label>
                                            <input
                                                type="number"
                                                value={formData.filters.maxPrice}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, maxPrice: parseInt(e.target.value) }
                                                })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Min Bedrooms</label>
                                            <input
                                                type="number"
                                                value={formData.filters.bedrooms}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, bedrooms: parseInt(e.target.value) }
                                                })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Min Bathrooms</label>
                                            <input
                                                type="number"
                                                value={formData.filters.bathrooms}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, bathrooms: parseInt(e.target.value) }
                                                })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            checked={formData.filters.featured}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                filters: { ...formData.filters, featured: e.target.checked }
                                            })}
                                            className="h-5 w-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                        />
                                        <label htmlFor="featured" className="text-xs font-black text-indigo-900 uppercase tracking-widest cursor-pointer">
                                            Only Show "Featured" Listings
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-10 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {isSaving ? 'Creating...' : 'Register Global Shortcode'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
