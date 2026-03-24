'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus, Agent } from '@repo/types';
import { leadService, agentService, useNotificationStore } from '@repo/services';

// ─── Constants ───────────────────────────────────────
const STATUS_OPTIONS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Closed'];

const STATUS_THEMES: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
    New: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    Contacted: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    Qualified: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Closed: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
};

// ─── Components ──────────────────────────────────────
const LeadStatusBadge = ({ status }: { status: LeadStatus }) => {
    const theme = STATUS_THEMES[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent transition-all ${theme.bg} ${theme.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-pulse`} />
            {status}
        </span>
    );
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [noteInput, setNoteInput] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [agentFilter, setAgentFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [leadsData, agentsData] = await Promise.all([
                    leadService.getLeads(),
                    agentService.getAgents()
                ]);
                setLeads(leadsData);
                setAgents(agentsData);
            } catch (error) {
                console.error('Failed to load CRM data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = !searchTerm ||
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone.includes(searchTerm);

            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
            const matchesAgent = agentFilter === 'all' || lead.agentId === agentFilter;

            let matchesDate = true;
            if (dateRange !== 'all') {
                const now = new Date();
                const leadDate = new Date(lead.createdAt);

                if (dateRange === 'today') {
                    matchesDate = leadDate.toDateString() === now.toDateString();
                } else if (dateRange === '7d') {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(now.getDate() - 7);
                    matchesDate = leadDate >= sevenDaysAgo;
                } else if (dateRange === '30d') {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    matchesDate = leadDate >= thirtyDaysAgo;
                }
            }

            return matchesSearch && matchesStatus && matchesAgent && matchesDate;
        });
    }, [leads, searchTerm, statusFilter, agentFilter, dateRange]);

    const handleUpdateStatus = async (leadId: string, status: LeadStatus) => {
        try {
            const updated = await leadService.updateLeadStatus(leadId, status);
            setLeads(prev => prev.map(l => l.id === leadId ? updated : l));
            if (selectedLead?.id === leadId) setSelectedLead(updated);
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Status Updated',
                message: `Lead marked as ${status}.`
            });
        } catch (error) {
            console.error('Update status failed:', error);
        }
    };

    const handleAssignAgent = async (leadId: string, agentId: string) => {
        try {
            const updated = await leadService.assignLead(leadId, agentId);
            setLeads(prev => prev.map(l => l.id === leadId ? updated : l));
            if (selectedLead?.id === leadId) setSelectedLead(updated);

            const agentName = agents.find(a => a.id === agentId)?.name || 'an agent';
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Lead Assigned',
                message: `Re-assigned to ${agentName}.`
            });
        } catch (error) {
            console.error('Assignment failed:', error);
        }
    };

    const handleAddNote = async () => {
        if (!selectedLead || !noteInput.trim()) return;
        try {
            const updated = await leadService.addLeadNote(selectedLead.id, noteInput, 'Admin');
            setLeads(prev => prev.map(l => l.id === selectedLead.id ? updated : l));
            setSelectedLead(updated);
            setNoteInput('');
        } catch (error) {
            console.error('Note addition failed:', error);
        }
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Brokerage CRM</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Pulse <span className="text-indigo-600 italic">Leads</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500">Oversee your incoming inquiries and optimize agent response times.</p>
                </div>

                <div className="flex gap-3">
                    <div className="px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inbound Leads</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">{leads.length}</p>
                    </div>
                    <div className="px-6 py-4 bg-emerald-500 border border-emerald-400 rounded-3xl shadow-xl shadow-emerald-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">New Today</p>
                        <p className="text-2xl font-black text-white leading-none">
                            {leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                    <div className="px-6 py-4 bg-indigo-600 border border-indigo-500 rounded-3xl shadow-xl shadow-indigo-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Contacted</p>
                        <p className="text-2xl font-black text-white leading-none">
                            {leads.filter(l => l.status === 'Contacted').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search leads by name, email, phone..."
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Status</label>
                        <select
                            className="block w-40 px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-100"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Assignee</label>
                        <select
                            className="block w-48 px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-100"
                            value={agentFilter}
                            onChange={(e) => setAgentFilter(e.target.value)}
                        >
                            <option value="all">All Agents</option>
                            <option value="unassigned">Unassigned</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Timeframe</label>
                        <select
                            className="block w-40 px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-100"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="all">Anytime</option>
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>

                    <button
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); setAgentFilter('all'); setDateRange('all'); }}
                        className="mt-5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Dashboard Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Name / Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Source</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned Agent</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Captured</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-[20px] mx-auto flex items-center justify-center">
                                                <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-black text-slate-900 tracking-tight italic">No leads found</p>
                                            <p className="text-sm font-medium text-slate-400">Broaden your filters to see more results.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className="group hover:bg-slate-50 transition-all cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-[14px] bg-slate-900 flex items-center justify-center font-black text-white group-hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200">
                                                    {lead.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{lead.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[11px] font-bold text-slate-400">{lead.email}</p>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                        <p className="text-[11px] font-bold text-slate-400">{lead.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                                                    {lead.source.replace('_', ' ')}
                                                </span>
                                                {lead.mlsNumber && (
                                                    <p className="text-[11px] font-bold text-slate-900">MLS® {lead.mlsNumber}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {lead.assignedTo ? (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center text-[9px] font-black text-white shadow-sm">
                                                            {lead.assignedTo[0]}
                                                        </div>
                                                        <span className="text-xs font-black text-slate-900">{lead.assignedTo}</span>
                                                    </div>
                                                    {lead.isAutoAssigned && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-50 text-[8px] font-black uppercase tracking-tighter text-indigo-600 border border-indigo-100">
                                                            Auto Assigned
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <LeadStatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="text-xs font-black text-slate-900">
                                                {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                {new Date(lead.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Detail Panel */}
            {selectedLead && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setSelectedLead(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
                        {/* Panel Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-slate-200">
                                    {selectedLead.name[0]}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedLead.name}</h2>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="flex items-center gap-2">
                                            <LeadStatusBadge status={selectedLead.status} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Captured {new Date(selectedLead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {selectedLead.assignedTo && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${selectedLead.isAutoAssigned ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {selectedLead.isAutoAssigned ? 'Auto Assigned' : 'Manual Assignment'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-700">to {selectedLead.assignedTo}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-12">
                            {/* Detailed Info Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inquiry Origin</p>
                                    <p className="text-sm font-bold text-slate-900 capitalize">{selectedLead.source.replace('_', ' ')}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</p>
                                    <p className="text-sm font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-4">{selectedLead.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Direct Phone</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedLead.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Property Link</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedLead.mlsNumber ? `MLS® ${selectedLead.mlsNumber}` : 'General Inquiry'}</p>
                                </div>
                            </div>

                            {/* Message Block */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Original Inquiry Message</h4>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner relative">
                                    <svg className="absolute -left-2 -top-2 w-10 h-10 text-indigo-100 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C11.1216 16 12.017 16.8954 12.017 18V21C12.017 22.1046 11.1216 23 10.017 23H7.017C5.91243 23 5.017 22.1046 5.017 21ZM16.017 3H19.017C21.2261 3 23.017 4.79086 23.017 7V13.5C23.017 14.3284 22.3454 15 21.517 15H17.517C16.6886 15 16.017 14.3284 16.017 13.5V11C16.017 10.1716 16.6886 9.5 17.517 9.5H20.017V7C20.017 6.44772 19.5693 6 19.017 6H16.017C15.4647 6 15.017 5.55228 15.017 5C15.017 4.44772 15.4647 4 16.017 4V3ZM7.017 3H10.017C12.2261 3 14.017 4.79086 14.017 7V13.5C14.017 14.3284 13.3454 15 12.517 15H8.517C7.68857 15 7.017 14.3284 7.017 13.5V11C7.017 10.1716 7.68857 9.5 8.517 9.5H11.017V7C11.017 6.44772 10.5693 6 10.017 6H7.017C6.46472 6 6.017 5.55228 6.017 5C6.017 4.44772 6.46472 4 7.017 4V3Z" /></svg>
                                    <p className="text-lg font-bold text-slate-700 leading-relaxed italic z-10 relative leading-snug">
                                        "{selectedLead.message}"
                                    </p>
                                </div>
                            </div>

                            {/* Response Actions */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Update Lead Phase</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_OPTIONS.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleUpdateStatus(selectedLead.id, s)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedLead.status === s
                                                    ? 'bg-slate-900 text-white shadow-lg'
                                                    : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-400'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Agent Assignment</h4>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none hover:border-indigo-200 transition-colors"
                                        value={selectedLead.agentId || ''}
                                        onChange={(e) => handleAssignAgent(selectedLead.id, e.target.value)}
                                    >
                                        <option value="">Unassigned</option>
                                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Internal Notes Timeline */}
                            <div className="space-y-6 pt-4 border-t border-slate-50">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                                    CRM Activity Timeline
                                    <div className="flex-1 h-px bg-slate-50" />
                                </h4>

                                <div className="space-y-6">
                                    {selectedLead.notes.map((note, idx) => (
                                        <div key={note.id} className="relative flex gap-4">
                                            {idx !== selectedLead.notes.length - 1 && (
                                                <div className="absolute left-3 top-8 bottom-0 w-px bg-slate-100" />
                                            )}
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 z-10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{note.text}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{note.author}</span>
                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedLead.notes.length === 0 && (
                                        <p className="text-xs font-bold text-slate-300 italic text-center py-4">No activity logged yet.</p>
                                    )}
                                </div>

                                <div className="relative mt-4">
                                    <textarea
                                        className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none shadow-inner"
                                        placeholder="Type a note or activity log..."
                                        rows={3}
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                    />
                                    <button
                                        onClick={handleAddNote}
                                        className="absolute right-3 bottom-3 w-10 h-10 bg-indigo-600 text-white rounded-[18px] flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Panel Footer Actions */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                            <a
                                href={`mailto:${selectedLead.email}`}
                                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-100 shadow-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send Email
                            </a>
                            <a
                                href={`tel:${selectedLead.phone}`}
                                className="flex-1 py-4 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Quick Call
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
