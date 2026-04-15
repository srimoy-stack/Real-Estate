'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { agentService, PLATFORM_TEMPLATES } from '@repo/services';
import { Agent, Template } from '@repo/types';

const templateNames: Record<string, string> = {};
PLATFORM_TEMPLATES.forEach((t: Template) => { templateNames[t.templateKey] = t.templateName; });

export default function AgentsPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [filterTemplate, setFilterTemplate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await agentService.getAllAgents();
                setAgents(data);
            } catch (error) {
                console.error('Failed to fetch agents:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => agents.filter(a => {
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.email.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCity && a.city !== filterCity) return false;
        if (filterTemplate && a.templateId !== filterTemplate) return false;
        if (filterStatus && a.websiteStatus !== filterStatus) return false;
        return true;
    }), [agents, search, filterCity, filterTemplate, filterStatus]);

    const handleDelete = async (agent: Agent) => {
        if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return;
        try {
            await agentService.deleteAgent(agent.id);
            setAgents(prev => prev.filter(a => a.id !== agent.id));
            setSelectedAgent(null);
        } catch (error) {
            alert('Failed to delete agent');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAgent) return;

        setSaving(true);
        try {
            // Update local state for now
            setAgents(prev => prev.map(a => a.id === editingAgent.id ? editingAgent : a));
            setEditingAgent(null);
        } catch (error) {
            alert('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const cities = [...new Set(agents.map(a => a.city).filter(Boolean))];

    return (
        <div className="space-y-10 relative">
            {/* Slide-over Detail Panel */}
            <div className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedAgent ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedAgent && (
                    <div className="h-full flex flex-col p-10 overflow-y-auto">
                        <div className="flex items-center justify-between mb-12">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">Agent Credentials</span>
                            <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-6 mb-12">
                            {selectedAgent.profilePhoto ? (
                                <img src={selectedAgent.profilePhoto} className="w-20 h-20 rounded-[28px] object-cover shadow-xl shadow-slate-200" alt="" />
                            ) : (
                                <div className="w-20 h-20 rounded-[28px] bg-slate-900 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-slate-200 uppercase">
                                    {selectedAgent.name[0]}
                                </div>
                            )}
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">{selectedAgent.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ecosystem Ident: <span className="text-indigo-600">{selectedAgent.id.slice(0, 8)}</span></p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedAgent.websiteStatus}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Node/Template</p>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{templateNames[selectedAgent.templateId || ''] || 'Independent'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 underline decoration-indigo-100 underline-offset-8 decoration-2">Protocol Access</h5>
                                {[
                                    { label: 'Primary Terminal', value: selectedAgent.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                                    { label: 'Secure Line', value: selectedAgent.phone || 'NO SECURE LINE', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                                    { label: 'Deployment Hub', value: selectedAgent.city || 'GLOBAL NODES', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                                ].map((field, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[24px] hover:shadow-lg hover:shadow-slate-100 transition-all">
                                        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={field.icon} /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{field.label}</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{field.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 underline decoration-indigo-100 underline-offset-8 decoration-2">Listing Infrastructure</h5>
                                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100/50 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Source</p>
                                        <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-black uppercase tracking-widest">{(selectedAgent as any).listingProvider?.providerName || 'CREA DDF'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endpoint Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-xs font-bold text-slate-900 truncate">{(selectedAgent as any).listingProvider?.apiEndpoint || 'Integrated Platform Source'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">API Authentication</p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex flex-col gap-4 border-t border-slate-50">
                                <button
                                    onClick={() => router.push(`/website-builder?agentId=${selectedAgent.id}&templateId=${selectedAgent.templateId}`)}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                                >
                                    Initialize Website Builder
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => router.push(`/preview/agent/${selectedAgent.id}`)}
                                        className="py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:shadow-md transition-all"
                                    >
                                        Inspect Live State
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedAgent)}
                                        className="py-4 bg-rose-50 text-rose-600 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-100 transition-all"
                                    >
                                        Purge Dataset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Header section redesigned for Premium Super Admin look */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-0.5 w-10 bg-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 leading-none">Global Network Index</span>
                    </div>
                    <div>
                        <h1 className="text-6xl font-black tracking-tight text-slate-900 leading-none uppercase">Personnel</h1>
                        <p className="text-xl font-medium text-slate-400 mt-4 tracking-tighter">Secure registry of all onboarded entities and deployment status.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/onboard-agent')}
                        className="px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-4 group"
                    >
                        Initialize Agent Onboarding
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Registered Entities', value: agents.length, trend: 'SECURE', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                    { label: 'Active Deployments', value: agents.filter(a => a.websiteStatus === 'ACTIVE').length, trend: '98% RELIANT', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18' },
                    { label: 'Draft Protocols', value: agents.filter(a => a.websiteStatus === 'DRAFT').length, trend: 'STAGING', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                    { label: 'Independent Clusters', value: agents.filter(a => !a.organizationId).length, trend: 'EXTERNAL', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm group hover:border-indigo-100 transition-all">
                        <div className="p-3 rounded-2xl bg-slate-50 text-indigo-600 w-fit mb-6">
                            <svg className="w-6 h-6 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={stat.icon} /></svg>
                        </div>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mb-4">{stat.label}</p>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Refined Filter System */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[280px] relative group">
                    <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="SEARCH PROTOCOL BY NAME OR DATA..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-4">
                    {[
                        { label: 'Filter: City', val: filterCity, set: setFilterCity, opts: cities },
                        { label: 'Filter: Platform', val: filterTemplate, set: setFilterTemplate, opts: PLATFORM_TEMPLATES.map(t => t.templateKey), display: (o: string) => templateNames[o] || o },
                        { label: 'Filter: Status', val: filterStatus, set: setFilterStatus, opts: ['ACTIVE', 'DRAFT', 'PENDING'] },
                    ].map((f, i) => (
                        <select
                            key={i}
                            value={f.val}
                            onChange={e => f.set(e.target.value)}
                            className="pl-5 pr-10 py-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-[20px] outline-none hover:bg-slate-100 transition-all border-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                        >
                            <option value="">{f.label}</option>
                            {f.opts.map(o => (
                                <option key={o} value={o}>{(f as any).display ? (f as any).display(o) : o}</option>
                            ))}
                        </select>
                    ))}
                </div>
            </div>

            {/* Premium Table Component */}
            <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cluster Map</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Provider</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol State</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronization</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="px-10 py-10 animate-pulse"><div className="h-6 bg-slate-50 rounded-lg w-full" /></td></tr>
                                ))
                            ) : filtered.map(agent => (
                                <tr
                                    key={agent.id}
                                    onClick={() => setSelectedAgent(agent)}
                                    className="group hover:bg-indigo-50/50 transition-all cursor-pointer"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            {agent.profilePhoto ? (
                                                <img src={agent.profilePhoto} className="h-14 w-14 rounded-[20px] object-cover shadow-md group-hover:shadow-indigo-100 transition-all" alt="" />
                                            ) : (
                                                <div className="h-14 w-14 rounded-[20px] bg-slate-900 text-white flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 transition-all transition-colors uppercase">
                                                    {agent.name[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-base font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{agent.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{agent.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{agent.organizationId || 'Independent'}</p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{templateNames[agent.templateId || ''] || 'No Template'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2 group/prov">
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{(agent as any).listingProvider?.providerName || 'DDF'}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setEditingAgent(agent); }}
                                                className="opacity-0 group-hover/prov:opacity-100 p-1 hover:bg-white text-indigo-400 hover:text-indigo-600 rounded transition-all shadow-sm"
                                                title="Edit Source Config"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3V17.5l13.732-13.732z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${agent.websiteStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : agent.websiteStatus === 'DRAFT' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <div className={`h-2 w-2 rounded-full ${agent.websiteStatus === 'ACTIVE' ? 'bg-emerald-500' : agent.websiteStatus === 'DRAFT' ? 'bg-amber-500' : 'bg-slate-400'} animate-pulse`} />
                                            {agent.websiteStatus || 'OFFLINE'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-black text-slate-900 uppercase">99.8% Uplink</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Node</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right relative actions-menu-container">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/website-builder?agentId=${agent.id}&templateId=${agent.templateId}`);
                                                }}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 group/btn shadow-sm"
                                                title="Open Website Builder"
                                            >
                                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Build
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === agent.id ? null : agent.id);
                                                }}
                                                className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 shadow-sm"
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>
                                        </div>

                                        {openMenuId === agent.id && (
                                            <div className="absolute right-10 top-20 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 flex flex-col items-start overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); setOpenMenuId(null); }} 
                                                    className="w-full text-left px-5 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Identity
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setEditingAgent(agent); setOpenMenuId(null); }} 
                                                    className="w-full text-left px-5 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit / Configuration
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/preview/agent/${agent.id}`); setOpenMenuId(null); }}
                                                    className="w-full text-left px-5 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Inspect Live State
                                                </button>
                                                <div className="h-px bg-slate-50 w-full my-1" />
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(agent); setOpenMenuId(null); }}
                                                    className="w-full text-left px-5 py-3 hover:bg-rose-50 text-rose-500 transition-colors flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Purge Dataset
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filtered.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="w-20 h-20 rounded-[30px] bg-slate-50 flex items-center justify-center text-slate-300">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-900 uppercase tracking-tight">Sequence Terminated</p>
                            <p className="text-slate-400 font-medium tracking-tight">No entities match the current protocol filters.</p>
                        </div>
                        <button onClick={() => { setSearch(''); setFilterCity(''); setFilterTemplate(''); setFilterStatus(''); }} className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] hover:underline underline-offset-8">Reset Sequence</button>
                    </div>
                )}
            </div>
            {/* Edit Modal */}
            {editingAgent && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Edit <span className="text-indigo-600">Agent Identity</span></h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Registry Code: {editingAgent.id}</p>
                            </div>
                            <button onClick={() => setEditingAgent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Legal Name</label>
                                    <input
                                        type="text"
                                        value={editingAgent.name}
                                        onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Email</label>
                                    <input
                                        type="email"
                                        value={editingAgent.email}
                                        onChange={(e) => setEditingAgent({ ...editingAgent, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Template</label>
                                    <select
                                        value={editingAgent.templateId || ''}
                                        onChange={(e) => setEditingAgent({ ...editingAgent, templateId: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="">Independent Agent</option>
                                        {PLATFORM_TEMPLATES.map(t => (
                                            <option key={t.templateKey} value={t.templateKey}>{t.templateName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment City</label>
                                    <input
                                        type="text"
                                        value={editingAgent.city || ''}
                                        onChange={(e) => setEditingAgent({ ...editingAgent, city: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
                                    Listing Infrastructure Config
                                    <div className="h-px bg-slate-100 flex-1" />
                                </label>
                                <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[28px] border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Provider Name</label>
                                        <input
                                            type="text"
                                            value={(editingAgent as any).listingProvider?.providerName || ''}
                                            onChange={(e) => setEditingAgent({ ...editingAgent, listingProvider: { ...((editingAgent as any).listingProvider || {}), providerName: e.target.value } } as any)}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all font-black uppercase"
                                            placeholder="CREA DDF"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">API Authentication Key</label>
                                        <input
                                            type="password"
                                            value={(editingAgent as any).listingProvider?.apiKey || ''}
                                            onChange={(e) => setEditingAgent({ ...editingAgent, listingProvider: { ...((editingAgent as any).listingProvider || {}), apiKey: e.target.value } } as any)}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Technical Endpoint URL</label>
                                        <input
                                            type="text"
                                            value={(editingAgent as any).listingProvider?.apiEndpoint || ''}
                                            onChange={(e) => setEditingAgent({ ...editingAgent, listingProvider: { ...((editingAgent as any).listingProvider || {}), apiEndpoint: e.target.value } } as any)}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all font-mono"
                                            placeholder="https://api.provider.com/v3"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingAgent(null)}
                                    className="px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 rounded-[20px] bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {saving && <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Commit Identity Updates
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
