'use client';

import React, { useState, useEffect } from 'react';
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
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await agentService.getAllAgents();
            setAgents(data);
            setLoading(false);
        })();
    }, []);

    const filtered = agents.filter(a => {
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.email.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCity && a.city !== filterCity) return false;
        if (filterTemplate && a.templateId !== filterTemplate) return false;
        if (filterStatus && a.websiteStatus !== filterStatus) return false;
        return true;
    });

    const handleDelete = async (agent: Agent) => {
        if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return;
        await agentService.deleteAgent(agent.id);
        setAgents(prev => prev.filter(a => a.id !== agent.id));
    };

    const cities = [...new Set(agents.map(a => a.city).filter(Boolean))];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="h-1.5 w-12 bg-violet-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-violet-600">Agent Management</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        Agents <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Directory</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage all onboarded agents across the platform.</p>
                </div>
                <button onClick={() => router.push('/onboard-agent')} className="px-7 py-3.5 bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-200 flex items-center gap-2 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Onboard Agent
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex-1 min-w-[200px]">
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-violet-400 transition-all placeholder:text-slate-400" />
                </div>
                <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-violet-400 cursor-pointer">
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterTemplate} onChange={e => setFilterTemplate(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-violet-400 cursor-pointer">
                    <option value="">All Templates</option>
                    {PLATFORM_TEMPLATES.map((t: Template) => <option key={t.templateKey} value={t.templateKey}>{t.templateName}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-violet-400 cursor-pointer">
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING">Pending</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Agents', value: agents.length, color: 'bg-violet-50 text-violet-600' },
                    { label: 'Active Websites', value: agents.filter(a => a.websiteStatus === 'ACTIVE').length, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Draft', value: agents.filter(a => a.websiteStatus === 'DRAFT').length, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Independent', value: agents.filter(a => !a.organizationId).length, color: 'bg-sky-50 text-sky-600' },
                ].map(stat => (
                    <div key={stat.label} className="p-5 bg-white rounded-[20px] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                        <p className={`text-3xl font-black mt-1 ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="h-10 w-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>
            ) : (
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {['Agent Name', 'Brokerage', 'Template', 'Status', 'Actions'].map(h => (
                                    <th key={h} className={`text-left text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 py-4 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(agent => (
                                <tr key={agent.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {agent.profilePhoto ? (
                                                <img src={agent.profilePhoto} alt="" className="h-9 w-9 rounded-xl object-cover" />
                                            ) : (
                                                <div className="h-9 w-9 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 font-black text-xs">{agent.name.charAt(0)}</div>
                                            )}
                                            <span className="font-bold text-slate-900 text-sm">{agent.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{agent.organizationId || <span className="text-violet-500 font-semibold text-[10px] font-black uppercase tracking-widest">Independent</span>}</td>
                                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{templateNames[agent.templateId || ''] || '—'}</span></td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${agent.websiteStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : agent.websiteStatus === 'DRAFT' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${agent.websiteStatus === 'ACTIVE' ? 'bg-emerald-500' : agent.websiteStatus === 'DRAFT' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                            {agent.websiteStatus || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 relative text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/website-builder?agentId=${agent.id}&templateId=${agent.templateId}`)}
                                                className="px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all flex items-center gap-1.5"
                                                title="Open Website Builder"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Build
                                            </button>
                                            <button onClick={() => setOpenMenuId(openMenuId === agent.id ? null : agent.id)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
                                            </button>
                                        </div>
                                        {openMenuId === agent.id && (
                                            <div className="absolute right-6 top-12 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1 flex flex-col text-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                <button onClick={() => { setOpenMenuId(null); router.push(`/agents/${agent.id}`); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-600 flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    View / Configure
                                                </button>
                                                <button onClick={() => { setOpenMenuId(null); router.push(`/website-builder?agentId=${agent.id}&templateId=${agent.templateId}`); }} className="w-full text-left px-4 py-2.5 hover:bg-violet-50 text-violet-600 font-semibold flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    Website Builder
                                                </button>
                                                <button onClick={() => { setOpenMenuId(null); router.push(`/preview/agent/${agent.id}`); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-600 flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    Preview Website
                                                </button>
                                                <button onClick={() => { setOpenMenuId(null); router.push(`/agents/${agent.id}/shortcodes`); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-600 flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                    Configure Listings
                                                </button>
                                                <div className="h-px bg-slate-100 my-1" />
                                                <button onClick={() => { setOpenMenuId(null); handleDelete(agent); }} className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={8} className="text-center py-16 text-slate-400"><p className="font-black text-xs uppercase tracking-widest">No agents found</p><p className="text-sm mt-2">Try adjusting your filters or onboard a new agent.</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )
            }
        </div >
    );
}
