'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { leadService } from '@repo/services';
import { Lead, LeadStatus } from '@repo/types';

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | ''>('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await leadService.getLeads();
                setLeads(data);
            } catch (error) {
                console.error('Failed to fetch leads:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => leads.filter(l => {
        if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.email.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterStatus && l.status !== filterStatus) return false;
        return true;
    }), [leads, search, filterStatus]);

    const handleUpdateStatus = async (id: string, status: LeadStatus) => {
        try {
            const updated = await leadService.updateLeadStatus(id, status);
            setLeads(prev => prev.map(l => l.id === id ? updated : l));
            if (selectedLead?.id === id) setSelectedLead(updated);
            setOpenMenuId(null);
        } catch (error) {
            alert('Failed to update lead status');
        }
    };

    const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Closed'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Contacted': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Qualified': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Closed': return 'bg-slate-50 text-slate-400 border-slate-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="space-y-10 relative">
            {/* Lead Briefing Panel */}
            <div className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedLead ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedLead && (
                    <div className="h-full flex flex-col p-10 overflow-y-auto">
                        <div className="flex items-center justify-between mb-12">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">Lead Intelligence</span>
                            <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="mb-12">
                            <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight border-l-4 border-slate-900 pl-6 mb-2 uppercase">
                                {selectedLead.name}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-7">Captured from: <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-4 uppercase">{selectedLead.source.replace(/_/g, ' ')}</span></p>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedLead.status)}`}>
                                        {selectedLead.status}
                                    </span>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inquiry Time</p>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 underline decoration-indigo-100 underline-offset-8 decoration-2">Contact Protocol</h5>
                                {[
                                    { label: 'Signal Endpoint', value: selectedLead.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                                    { label: 'Secure Line', value: selectedLead.phone, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
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

                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 underline decoration-indigo-100 underline-offset-8 decoration-2">Inquiry Message</h5>
                                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 min-h-[120px]">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                        "{selectedLead.message}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-0.5 w-10 bg-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 leading-none">Intelligence Throughput</span>
                    </div>
                    <div>
                        <h1 className="text-6xl font-black tracking-tight text-slate-900 leading-none uppercase">Leads</h1>
                        <p className="text-xl font-medium text-slate-400 mt-4 tracking-tighter">Monitoring captured intent across all ecosystem deployments.</p>
                    </div>
                </div>
            </div>

            {/* Statistics Briefing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Capture', value: leads.length, color: 'indigo' },
                    { label: 'Critical Response', value: leads.filter(l => l.status === 'New').length, color: 'rose' },
                    { label: 'Active Pipeline', value: leads.filter(l => l.status === 'Contacted').length, color: 'amber' },
                    { label: 'Converted Yield', value: leads.filter(l => l.status === 'Qualified' || l.status === 'Closed').length, color: 'emerald' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 text-${stat.color}-500 opacity-60`}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Suite */}
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
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as any)}
                        className="pl-5 pr-10 py-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-[20px] outline-none hover:bg-slate-100 transition-all border-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                    >
                        <option value="">Status Profile: ALL</option>
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Table Core */}
            <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capture Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Routing Status</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source Origin</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capture Time</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-10 py-10 animate-pulse"><div className="h-6 bg-slate-50 rounded-lg w-full" /></td></tr>
                                ))
                            ) : filtered.map(lead => (
                                <tr
                                    key={lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    className="group hover:bg-indigo-50/50 transition-all cursor-pointer"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 transition-colors">
                                                {lead.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-none">{lead.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lead.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(lead.status)}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${lead.status === 'New' ? 'bg-blue-500 animate-pulse' :
                                                lead.status === 'Contacted' ? 'bg-amber-500' :
                                                    lead.status === 'Qualified' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {lead.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{lead.source.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 uppercase">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 tracking-tighter">Time Stamp</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === lead.id ? null : lead.id);
                                            }}
                                            className="p-3 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 group-hover:shadow-sm border border-transparent hover:border-slate-100"
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>

                                        {openMenuId === lead.id && (
                                            <div className="absolute right-10 top-20 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 flex flex-col items-start overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <p className="px-5 py-2 text-[8px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 w-full mb-1">Status Patch</p>
                                                <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(lead.id, 'Contacted' as any); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Mark Contacted
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(lead.id, 'Qualified' as any); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mark Qualified
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(lead.id, 'Closed' as any); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Mark Closed
                                                </button>
                                                <div className="h-px bg-slate-50 w-full my-1" />
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setOpenMenuId(null); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Intelligence
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
                    <div className="py-32 flex flex-col items-center justify-center space-y-6 text-center text-slate-300">
                        <div className="w-20 h-20 rounded-[30px] bg-slate-50 flex items-center justify-center">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-xs leading-loose">No active lead signals match the current protocol filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


