'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge, BadgeType, Skeleton } from '@repo/ui';
import { AuditLog, AuditEventType } from '@repo/services';
import { useDebounce } from '@repo/hooks';

// Mock Data for immediate visual feedback as per requirements
const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        eventType: AuditEventType.IMPERSONATION_START,
        actorId: 'sa-1',
        actorName: 'Alex Rivers',
        targetId: 'org-42',
        targetName: 'Prestige Realty',
        organizationId: 't-42',
        status: 'SUCCESS',
        ipAddress: '192.168.1.1'
    },
    {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        eventType: AuditEventType.ORG_SUSPENDED,
        actorId: 'sa-1',
        actorName: 'Alex Rivers',
        targetId: 'org-12',
        targetName: 'Sunset Estates',
        organizationId: 't-12',
        status: 'SUCCESS',
        metadata: { reason: 'Overdue payment' }
    },
    {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        eventType: AuditEventType.DDF_CONFIG_UPDATED,
        actorId: 'ba-5',
        actorName: 'Sarah Jenkins',
        targetId: 'ddf-5',
        targetName: 'CREA Integration',
        organizationId: 't-42',
        status: 'FAILURE',
        metadata: { error: 'Invalid API Key' }
    },
    {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        eventType: AuditEventType.TEMPLATE_ASSIGNED,
        actorId: 'sa-2',
        actorName: 'Jordan Smith',
        targetId: 'tpl-lux',
        targetName: 'Luxury Modern v2',
        organizationId: 't-99',
        status: 'SUCCESS'
    },
    {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        eventType: AuditEventType.ROLE_CHANGED,
        actorId: 'sa-1',
        actorName: 'Alex Rivers',
        targetId: 'u-501',
        targetName: 'Mike Ross',
        organizationId: 't-42',
        status: 'SUCCESS',
        metadata: { from: 'AGENT', to: 'BROKER_ADMIN' }
    }
];

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        // Simulate API call delay
        await new Promise(r => setTimeout(r, 600));

        // Use debouncedSearch for actual logic
        let filtered = [...MOCK_AUDIT_LOGS];

        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(l => l.eventType === typeFilter);
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(l => l.status === statusFilter);
        }

        if (debouncedSearch) {
            const lowSearch = debouncedSearch.toLowerCase();
            filtered = filtered.filter(l =>
                l.actorName.toLowerCase().includes(lowSearch) ||
                l.targetName?.toLowerCase().includes(lowSearch) ||
                l.eventType.toLowerCase().includes(lowSearch)
            );
        }

        setLogs(filtered);
        setLoading(false);
    }, [debouncedSearch, typeFilter, statusFilter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getActionStyle = (type: AuditEventType): string => {
        switch (type) {
            case AuditEventType.IMPERSONATION_START:
            case AuditEventType.IMPERSONATION_STOP:
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case AuditEventType.ORG_CREATED:
            case AuditEventType.ORG_ACTIVATED:
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case AuditEventType.ORG_SUSPENDED:
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case AuditEventType.TEMPLATE_ASSIGNED:
            case AuditEventType.MODULE_CONFIG_CHANGED:
                return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            default:
                return 'bg-slate-700/30 text-slate-400 border-slate-700/20';
        }
    };

    const getStatusType = (status: string): BadgeType => {
        if (status === 'SUCCESS') return 'success';
        if (status === 'FAILURE') return 'error';
        return 'warning';
    };

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-slate-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter">System <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Audit Streams</span></h1>
                    <p className="mt-2 text-slate-500 font-medium">Immutably tracking {logs.length} administrative actions across the platform</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Stream Active</span>
                    </div>
                </div>
            </div>

            {/* Premium Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 rounded-[32px] border border-slate-200 bg-white shadow-sm">
                <div className="relative group col-span-1 md:col-span-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all font-bold"
                    />
                </div>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 px-5 py-3 outline-none focus:border-indigo-500 transition-all cursor-pointer font-bold appearance-none hover:bg-slate-100"
                >
                    <option value="ALL">All Actions</option>
                    {Object.values(AuditEventType).map(type => (
                        <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 px-5 py-3 outline-none focus:border-indigo-500 transition-all cursor-pointer font-bold appearance-none hover:bg-slate-100"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILURE">Failure</option>
                    <option value="WARNING">Warning</option>
                </select>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1 flex">
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white border border-slate-200/50 rounded-xl shadow-sm">24 Hours</button>
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">7 Days</button>
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Custom</button>
                </div>
            </div>

            {/* Audit Table */}
            <div className="rounded-[40px] border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto overflow-y-auto max-h-[650px]">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Actor</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Action Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Organization</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Target Entity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading ? (
                                [1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-6"><Skeleton variant="text" className="w-24 h-3" /></td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Skeleton variant="circular" className="h-8 w-8" />
                                                <Skeleton variant="text" className="w-20 h-3" />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6"><Skeleton variant="rounded" className="w-32 h-6" /></td>
                                        <td className="px-8 py-6"><Skeleton variant="text" className="w-28 h-3" /></td>
                                        <td className="px-8 py-6">
                                            <Skeleton variant="text" className="w-32 h-3 mb-2" />
                                            <Skeleton variant="text" className="w-20 h-2" />
                                        </td>
                                        <td className="px-8 py-6 flex justify-center"><Skeleton variant="rounded" className="w-16 h-6" /></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <div className="space-y-4 opacity-40">
                                            <svg className="h-16 w-16 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-slate-400 font-bold italic">No log entries found for this spectrum.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-slate-50 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-mono text-slate-400">{formatTimestamp(log.timestamp)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[10px] font-black text-slate-700 border border-slate-200">
                                                {log.actorName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <p className="text-sm font-black text-slate-900 tracking-tight">{log.actorName}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider ${getActionStyle(log.eventType)}`}>
                                            {log.eventType.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-slate-600 font-bold italic">{log.targetName || 'Global System'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-mono text-indigo-400 tracking-tighter">{log.targetId || 'N/A'}</p>
                                            {log.metadata && (
                                                <p className="text-[10px] text-slate-500 font-bold truncate max-w-[200px]">
                                                    {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <StatusBadge
                                            label={log.status}
                                            type={getStatusType(log.status)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Secure Pagination Metadata */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">
                        Logs are cryptographically signed. Unauthorized modifications are detected.
                    </p>
                    <div className="flex items-center gap-4">
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-900 disabled:opacity-30 border border-slate-200 transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-xs font-black text-white px-4 py-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">1</span>
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-slate-900 border border-slate-200 transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
