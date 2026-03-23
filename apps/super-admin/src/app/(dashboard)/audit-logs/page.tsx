'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge } from '@repo/ui';
import { AuditLog, AuditEventType } from '@repo/services';
import { useDebounce } from '@repo/hooks';

// Enhanced Mock Data covering all AuditEventType values
const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 'aud-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        eventType: AuditEventType.SECURITY_VIOLATION,
        actorId: 'system',
        actorName: 'Network Guardian',
        targetId: 'ip-182.16.0.4',
        targetName: 'Suspicious Access Attempt',
        status: 'FAILURE',
        ipAddress: '182.16.0.4',
        metadata: {
            reason: 'Brute force detected on Super Admin login',
            attempts: 45,
            location: 'Unknown Region',
            severity: 'CRITICAL',
            risk_score: 98
        }
    },
    {
        id: 'aud-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        eventType: AuditEventType.IMPERSONATION_START,
        actorId: 'sa-1',
        actorName: 'Alex Rivers',
        targetId: 'org-42',
        targetName: 'Prestige Realty',
        organizationId: 't-42',
        status: 'SUCCESS',
        ipAddress: '192.168.1.1',
        metadata: {
            originalEmail: 'alex@platform.com',
            impersonatedEmail: 'admin@prestigerealty.com',
            duration_limit: '60m'
        }
    },
    {
        id: 'aud-003',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        eventType: AuditEventType.ORG_SUSPENDED,
        actorId: 'sa-1',
        actorName: 'Alex Rivers',
        targetId: 'org-12',
        targetName: 'Sunset Estates',
        organizationId: 't-12',
        status: 'SUCCESS',
        metadata: {
            reason: 'Overdue payment',
            arrears: '$1,200',
            grace_period_expired: true,
            billing_cycle: 'Monthly'
        }
    },
    {
        id: 'aud-004',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        eventType: AuditEventType.DDF_CONFIG_UPDATED,
        actorId: 'ba-5',
        actorName: 'Sarah Jenkins',
        targetId: 'ddf-5',
        targetName: 'CREA Integration',
        organizationId: 't-42',
        status: 'FAILURE',
        metadata: {
            error: 'Invalid API Key provided',
            field: 'apiKey',
            traceId: 'tr-9982x',
            integration_version: 'v2.4'
        }
    },
    {
        id: 'aud-005',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        eventType: AuditEventType.SYSTEM_CONFIG_CHANGE,
        actorId: 'sa-2',
        actorName: 'Jordan Smith',
        targetId: 'sys-env',
        targetName: 'Production Environment',
        status: 'SUCCESS',
        metadata: {
            setting: 'max_upload_size',
            old_value: '10MB',
            new_value: '25MB',
            restart_required: false
        }
    },
    {
        id: 'aud-006',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        eventType: AuditEventType.WEBSITE_SYNC,
        actorId: 'cron-sync',
        actorName: 'System Scheduler',
        targetId: 'site-premium-1',
        targetName: 'Premium Realty Main',
        organizationId: 't-42',
        status: 'SUCCESS',
        metadata: {
            records_synced: 1450,
            duration_ms: 4502,
            source: 'RETS',
            compression_ratio: '1.4x'
        }
    },
    {
        id: 'aud-007',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        eventType: AuditEventType.ROLE_CHANGED,
        actorId: 'sa-1',
        actorName: 'Alex Rivers',
        targetId: 'u-501',
        targetName: 'Mike Ross',
        organizationId: 't-42',
        status: 'SUCCESS',
        metadata: {
            from: 'AGENT',
            to: 'BROKER_ADMIN',
            granted_by_request: 'REQ-4421'
        }
    }
];

export default function AuditLogsPage() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | 'all'>('all');

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Derived logs with all filters working perfectly
    const filteredLogs = useMemo(() => {
        let results = [...MOCK_AUDIT_LOGS];

        // 1. Time Filtering
        const now = new Date();
        if (timeFilter === '24h') {
            const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            results = results.filter(l => new Date(l.timestamp) >= dayAgo);
        } else if (timeFilter === '7d') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            results = results.filter(l => new Date(l.timestamp) >= weekAgo);
        }

        // 2. Type Filtering
        if (typeFilter !== 'ALL') {
            results = results.filter(l => l.eventType === typeFilter);
        }

        // 3. Status Filtering
        if (statusFilter !== 'ALL') {
            results = results.filter(l => l.status === statusFilter);
        }

        // 4. Advanced Search
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            results = results.filter(l =>
                l.actorName.toLowerCase().includes(q) ||
                l.targetName?.toLowerCase().includes(q) ||
                l.eventType.toLowerCase().includes(q) ||
                l.ipAddress?.includes(q) ||
                l.id.toLowerCase().includes(q)
            );
        }

        return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [debouncedSearch, typeFilter, statusFilter, timeFilter]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const getEventTypeStyles = (type: AuditEventType) => {
        switch (type) {
            case AuditEventType.SECURITY_VIOLATION:
                return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            case AuditEventType.IMPERSONATION_START:
            case AuditEventType.IMPERSONATION_STOP:
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case AuditEventType.ORG_CREATED:
            case AuditEventType.ORG_ACTIVATED:
            case AuditEventType.WEBSITE_SYNC:
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case AuditEventType.ORG_SUSPENDED:
                return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            case AuditEventType.DDF_CONFIG_UPDATED:
            case AuditEventType.MODULE_CONFIG_CHANGED:
            case AuditEventType.SYSTEM_CONFIG_CHANGE:
                return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };



    const analytics = useMemo(() => ({
        failureRate: (MOCK_AUDIT_LOGS.filter(l => l.status === 'FAILURE').length / MOCK_AUDIT_LOGS.length * 100).toFixed(1),
        securityAlerts: MOCK_AUDIT_LOGS.filter(l => l.eventType === AuditEventType.SECURITY_VIOLATION).length,
        activeActors: new Set(MOCK_AUDIT_LOGS.map(l => l.actorId)).size,
        systemHealth: 98.4
    }), []);

    return (
        <div className="px-8 pb-8 pt-2 space-y-12 bg-slate-50 min-h-screen relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Governance Module</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                        Audit <span className="text-indigo-600 underline decoration-indigo-600/10 underline-offset-[16px] decoration-8">Streams</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl text-lg">
                        Industrial-grade ledger of all administrative events across the cluster.
                    </p>
                </div>

                {/* Macro Intelligence Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/60 backdrop-blur-xl border border-white p-3 rounded-[32px] shadow-2xl shadow-slate-200/50">
                    {[
                        { label: 'Security Alerts', value: analytics.securityAlerts, color: 'text-rose-600', sub: 'Critical Events' },
                        { label: 'Failure Rate', value: `${analytics.failureRate}%`, color: 'text-amber-600', sub: 'Non-Success' },
                        { label: 'Network Score', value: `${analytics.systemHealth}%`, color: 'text-emerald-600', sub: 'Integrity Level' },
                        { label: 'Audit Velocity', value: 'High', color: 'text-indigo-600', sub: 'Event Density' }
                    ].map((idx) => (
                        <div key={idx.label} className="px-6 py-3 border-r border-slate-100 last:border-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xl font-black tracking-tighter ${idx.color}`}>{idx.value}</span>
                            </div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{idx.label}</p>
                        </div>
                    ))}
                </div>
            </header>

            {/* Premium Control Center */}
            <div className="grid grid-cols-1 xl:grid-cols-6 gap-4 p-4 rounded-[40px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 relative z-10">
                <div className="xl:col-span-2 relative group flex items-center">
                    <svg className="absolute left-6 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search Actor, Target, Cluster Node or IP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[28px] text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold"
                    />
                </div>

                <div className="xl:col-span-1 relative">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[28px] text-[10px] font-black text-slate-900 px-6 py-4 outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer uppercase tracking-widest appearance-none"
                    >
                        <option value="ALL">All Event Segments</option>
                        {Object.values(AuditEventType).map(type => (
                            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                <div className="xl:col-span-1 relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[28px] text-[10px] font-black text-slate-900 px-6 py-4 outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer uppercase tracking-widest appearance-none"
                    >
                        <option value="ALL">Execution Results</option>
                        <option value="SUCCESS">Success Only</option>
                        <option value="FAILURE">Anomaly / Fail</option>
                        <option value="WARNING">Warnings Only</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                <div className="xl:col-span-2 bg-slate-50 border border-slate-100 rounded-[28px] p-1.5 flex gap-1">
                    {[
                        { label: '24h', value: '24h' },
                        { label: '7 Days', value: '7d' },
                        { label: 'All History', value: 'all' }
                    ].map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => setTimeFilter(btn.value as any)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${timeFilter === btn.value as any
                                ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stream Table */}
            <div className="rounded-[48px] border border-slate-200 bg-white overflow-hidden shadow-2xl shadow-slate-200/50 relative z-10">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Sequence</th>
                                <th className="px-8 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Initiator Profile</th>
                                <th className="px-8 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Stream Event</th>
                                <th className="px-8 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Scope / Node</th>
                                <th className="px-8 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Status</th>
                                <th className="px-8 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Analysis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i}><td colSpan={6} className="px-8 py-10 animate-pulse bg-slate-50/10" /></tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-40 text-center">
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="h-20 w-20 mx-auto rounded-3xl bg-slate-50 flex items-center justify-center">
                                                <svg className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6" /></svg>
                                            </div>
                                            <p className="text-slate-400 font-bold text-sm">No synchronized records found for the active filter set.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id}
                                    onClick={() => setSelectedLog(log)}
                                    className="group hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    <td className="px-8 py-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-mono text-indigo-400 font-black tracking-widest">#{log.id.toUpperCase()}</p>
                                            <p className="text-xs font-bold text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-[20px] bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                                                <span className="text-xs font-black">{log.actorName[0]}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 leading-none">{log.actorName}</span>
                                                <span className="text-[10px] font-mono text-slate-400 mt-2 uppercase">{log.actorId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className={`px-4 py-2 rounded-2xl border text-[9px] font-black uppercase tracking-[0.1em] ${getEventTypeStyles(log.eventType)} shadow-sm`}>
                                            {log.eventType.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-700">{log.targetName || 'Global Grid'}</span>
                                            <span className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-tighter">{log.organizationId || 'Core Platform'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-center">
                                        <StatusBadge label={log.status === 'FAILURE' ? 'Error' : 'Verified'} type={log.status === 'FAILURE' ? 'error' : 'success'} />
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAIL DRAWER */}
            {selectedLog && (
                <>
                    <div
                        className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500"
                        onClick={() => setSelectedLog(null)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-[70] shadow-2xl animate-in slide-in-from-right duration-700 overflow-hidden flex flex-col">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white relative">
                            <div className="absolute top-0 right-0 h-full w-40 bg-indigo-50/20 rounded-bl-[100px] pointer-events-none" />
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Sequence <span className="text-indigo-600">Report</span></h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Advanced Telemetry Audit #{selectedLog.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="h-12 w-12 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors relative z-10"
                            >
                                <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-16">
                            {/* Forensic Attributes */}
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <span className="h-1 w-6 bg-indigo-500 rounded-full" /> Forensic Baseline
                                </h4>
                                <div className="grid grid-cols-2 gap-px bg-slate-200 rounded-[32px] overflow-hidden border border-slate-200 shadow-xl">
                                    {[
                                        { l: 'Temporal Origin', v: new Date(selectedLog.timestamp).toLocaleString() },
                                        { l: 'Network Protocol', v: 'HTTPS / TLS 1.3' },
                                        { l: 'Source Node', v: selectedLog.ipAddress || 'Internal Cluster' },
                                        { l: 'System Integrity', v: 'Validated (HMAC-SHA256)' }
                                    ].map(i => (
                                        <div key={i.l} className="bg-white p-8 space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{i.l}</p>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{i.v}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Deep Actor Mapping */}
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <span className="h-1 w-6 bg-emerald-500 rounded-full" /> Logical Mapping
                                </h4>
                                <div className="space-y-4">
                                    <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 flex items-center gap-6 shadow-inner">
                                        <div className="h-16 w-16 rounded-[24px] bg-white border border-slate-200 flex items-center justify-center shadow-xl">
                                            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Actor</p>
                                            <p className="text-lg font-black text-slate-900">{selectedLog.actorName}</p>
                                            <p className="text-xs font-mono text-indigo-400 font-bold uppercase">{selectedLog.actorId}</p>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 flex items-center gap-6 shadow-inner">
                                        <div className="h-16 w-16 rounded-[24px] bg-white border border-slate-200 flex items-center justify-center shadow-xl">
                                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Resource</p>
                                            <p className="text-lg font-black text-slate-900">{selectedLog.targetName || 'Global Context'}</p>
                                            <p className="text-xs font-mono text-emerald-500 font-bold uppercase">{selectedLog.targetId}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Telemetry Object */}
                            {selectedLog.metadata && (
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                            <span className="h-1 w-6 bg-violet-500 rounded-full" /> Telemetry Payload
                                        </h4>
                                        <div className="px-3 py-1 bg-violet-50 rounded-lg text-[8px] font-black text-violet-600 uppercase tracking-widest">
                                            Impact Score: {selectedLog.metadata.risk_score || 42}/100
                                        </div>
                                    </div>
                                    <div className="bg-slate-950 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <svg className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                        </div>
                                        <pre className="text-sm font-mono text-indigo-300 leading-relaxed whitespace-pre-wrap">
                                            {JSON.stringify(selectedLog.metadata, null, 4)}
                                        </pre>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Analysis Footer */}
                        <div className="p-10 border-t border-slate-100 bg-slate-50/50">
                            <button onClick={() => setSelectedLog(null)} className="w-full py-5 rounded-[24px] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.25em] shadow-3xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95">
                                Archive analysis view
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

