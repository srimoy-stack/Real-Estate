'use client';

import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, RoutingMethod, LeadRoutingConfig, Agent } from '@repo/types';
import { leadService, agentService, useNotificationStore } from '@repo/services';

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [tab, setTab] = useState<LeadStatus | 'all'>('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [noteInput, setNoteInput] = useState('');
    const [routingConfig, setRoutingConfig] = useState<LeadRoutingConfig>({
        method: 'round_robin',
        active: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leadsData, agentsData] = await Promise.all([
                    leadService.getLeads(),
                    agentService.getAgentsByOrganization('org-1') // Mock org
                ]);
                setLeads(leadsData);
                setAgents(agentsData);
            } catch (error) {
                console.error('Failed to fetch CRM data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statusColors: Record<LeadStatus, string> = {
        'New': 'bg-blue-500/10 text-blue-500',
        'Contacted': 'bg-amber-500/10 text-amber-500',
        'Qualified': 'bg-purple-500/10 text-purple-500',
        'Closed': 'bg-emerald-500/10 text-emerald-500',
    };

    const statusLabels: Record<LeadStatus, string> = {
        'New': 'Fresh Lead',
        'Contacted': 'Active Discovery',
        'Qualified': 'High Intent',
        'Closed': 'Deal Closed',
    };

    const filtered = tab === 'all' ? leads : leads.filter(l => l.status === tab);

    const handleAddNote = async () => {
        if (!noteInput || !selectedLead) return;
        try {
            const updated = await leadService.addLeadNote(selectedLead.id, noteInput, 'Admin User');
            setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
            setSelectedLead(updated);
            setNoteInput('');
        } catch (err) {
            console.error('Failed to add note', err);
        }
    };

    const handleStatusUpdate = async (status: LeadStatus) => {
        if (!selectedLead) return;
        try {
            const updated = await leadService.updateLeadStatus(selectedLead.id, status);
            setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
            setSelectedLead(updated);
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleAssignAgent = async (agentId: string) => {
        if (!selectedLead) return;
        try {
            const updated = await leadService.assignLead(selectedLead.id, agentId);
            setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
            setSelectedLead(updated);
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Lead Re-assigned',
                message: `Lead has been assigned to ${agents.find(a => a.id === agentId)?.name}.`
            });
        } catch (err) {
            console.error('Failed to assign agent', err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-purple-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-purple-600">Client Relations</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900">
                        Lead <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Command Center</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Orchestrate lead acquisition, routing, and conversions with industrial-grade efficiency.
                    </p>
                </div>
            </div>

            {/* Routing Logic UI */}
            <div className="p-8 rounded-[40px] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h3 className="text-lg font-black italic">Lead Routing <span className="text-purple-400">Intelligence</span></h3>
                        <p className="text-sm text-slate-400 font-medium">Currently distributing via <span className="text-white font-bold">{routingConfig.method.replace(/_/g, ' ')}</span></p>
                    </div>

                    <div className="flex bg-white/5 p-1.5 rounded-2xl gap-2">
                        {[
                            { id: 'round_robin', label: 'Round Robin' },
                            { id: 'auto_assign_listing_agent', label: 'Listing Agent First' },
                            { id: 'manual', label: 'Manual Control' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setRoutingConfig({ ...routingConfig, method: method.id as RoutingMethod })}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${routingConfig.method === method.id
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {method.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inbox Section */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                        {['all', 'New', 'Contacted', 'Qualified', 'Closed'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setTab(s as any)}
                                className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all shrink-0 ${tab === s
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {s.replace('_', ' ')} <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded-md text-[9px]">{s === 'all' ? leads.length : leads.filter(l => l.status === s).length}</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative group min-w-[300px]">
                        <input
                            type="text"
                            placeholder="Search leads by name or email..."
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:border-purple-500 outline-none transition-all shadow-sm group-hover:shadow-md"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 bg-white rounded-[32px] animate-pulse border border-slate-100" />
                        ))
                    ) : filtered.map((lead) => (
                        <div
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className="group p-6 rounded-[32px] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-[20px] bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center font-black text-purple-600">
                                    {lead.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-900 text-lg leading-none">{lead.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[11px] font-bold text-slate-400">{lead.email}</p>
                                        <span className="h-1 w-1 bg-slate-200 rounded-full" />
                                        <p className="text-[11px] font-black text-purple-600 truncate max-w-[150px]">{lead.mlsNumber || lead.source}</p>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-500 truncate max-w-[300px] italic">"{lead.message}"</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:items-end gap-2 shrink-0">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl ${statusColors[lead.status]}`}>
                                    {statusLabels[lead.status] || lead.status}
                                </span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Received {new Date(lead.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                    {!loading && filtered.length === 0 && (
                        <div className="p-20 text-center space-y-4">
                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No leads found in this segment</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lead Detail Drawer (Overlay) */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
                    <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500">
                        {/* Drawer Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                                    {selectedLead.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{selectedLead.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">Ref: {selectedLead.mlsNumber || 'General Inquiry'}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Message Preview */}
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic font-medium text-slate-600 text-sm leading-relaxed">
                                "{selectedLead.message}"
                            </div>

                            {/* Actions & Status */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Pipeline Position</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.keys(statusLabels).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusUpdate(s as LeadStatus)}
                                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border ${selectedLead.status === s
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-slate-900 truncate mt-1">{selectedLead.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedLead.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inquiry Source</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedLead.source}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Agent</p>
                                    <div className="mt-1 relative group">
                                        <select
                                            className="text-sm font-bold text-purple-600 bg-transparent outline-none cursor-pointer border-b border-dashed border-purple-200 pb-1 w-full"
                                            value={selectedLead.agentId || ''}
                                            onChange={(e) => handleAssignAgent(e.target.value)}
                                        >
                                            <option value="">Unassigned</option>
                                            {agents.map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Conversation & Notes */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal Notes</p>
                                    <span className="text-[9px] font-bold text-slate-400">Activity Feed</span>
                                </div>

                                <div className="space-y-4">
                                    {selectedLead.notes.map((note) => (
                                        <div key={note.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{note.text}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">{note.author}</span>
                                                <span className="text-[9px] text-slate-400 font-bold">{new Date(note.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedLead.notes.length === 0 && (
                                        <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                                            <p className="text-xs text-slate-400 font-bold italic">No internal notes yet</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4">
                                    <textarea
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                        placeholder="Add a private note for the team..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 text-sm font-medium focus:bg-white focus:border-purple-500 outline-none transition-all h-32 resize-none"
                                    />
                                    <button
                                        onClick={handleAddNote}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        Append Internal Note
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                            <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                                Archive Lead
                            </button>
                            <a
                                href={`mailto:${selectedLead.email}`}
                                className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 text-center"
                            >
                                Contact Lead
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
