'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatusBadge, BadgeType } from '@repo/ui';
import {
    getOrganizations,
    Organization,
    OrgType,
    OrgStatus,
    DDFStatus,
    SubscriptionPlan,
    updateOrgStatus,
    deleteOrganization,
    createAuditLog,
    AuditEventType
} from '@repo/services';
import { useAuth } from '@repo/auth';
import { useDebounce } from '@repo/hooks';

export default function OrganizationsPage() {
    const { startImpersonation, user: superAdmin } = useAuth();

    // State
    const [items, setItems] = useState<Organization[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [typeFilter, setTypeFilter] = useState<OrgType | ''>('');
    const [statusFilter, setStatusFilter] = useState<OrgStatus | ''>('');
    const [subFilter, setSubFilter] = useState<SubscriptionPlan | ''>('');

    const fetchOrgs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getOrganizations({
                page,
                limit,
                search: debouncedSearch,
                type: typeFilter || undefined,
                status: statusFilter || undefined,
                subscription: subFilter || undefined
            });
            setItems(response.items);
            setTotal(response.total);
        } catch (error) {
            console.error('Failed to fetch organizations', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, typeFilter, statusFilter, subFilter]);

    useEffect(() => {
        fetchOrgs();
    }, [fetchOrgs]);

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleImpersonate = async (org: Organization) => {
        try {
            await startImpersonation(org.id);
            // PRD: Redirect to client-admin
            window.location.href = 'http://localhost:3002/dashboard';
        } catch (error) {
            alert('Impersonation failed');
        }
    };

    const handleToggleStatus = async (org: Organization) => {
        const action = org.status === OrgStatus.ACTIVE ? 'Suspend' : 'Activate';
        if (confirm(`Are you sure you want to ${action.toLowerCase()} ${org.name}?`)) {
            const newStatus = org.status === OrgStatus.ACTIVE ? OrgStatus.SUSPENDED : OrgStatus.ACTIVE;
            try {
                await updateOrgStatus(org.id, newStatus);

                // Audit Log
                await createAuditLog({
                    eventType: newStatus === OrgStatus.SUSPENDED ? AuditEventType.ORG_SUSPENDED : AuditEventType.ORG_ACTIVATED,
                    actorId: superAdmin?.id || 'system-admin',
                    actorName: superAdmin?.name || 'Super Admin',
                    targetId: org.id,
                    targetName: org.name,
                    tenantId: org.id,
                    status: 'SUCCESS',
                    metadata: { previousStatus: org.status, newStatus }
                });

                fetchOrgs(); // Refresh
            } catch (error) {
                alert('Update failed');
            }
        }
    };

    const handleDelete = async (org: Organization) => {
        if (confirm(`DANGER: Are you sure you want to delete ${org.name}? This action is permanent and cannot be undone.`)) {
            try {
                await deleteOrganization(org.id);
                fetchOrgs(); // Refresh
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    // Visual Helpers reflecting PRD Section 4.1.3
    const getStatusBadge = (status: OrgStatus): { label: string; type: BadgeType } => {
        switch (status) {
            case OrgStatus.ACTIVE: return { label: 'Active', type: 'success' }; // Green
            case OrgStatus.SUSPENDED: return { label: 'Suspended', type: 'error' }; // Red
            case OrgStatus.INACTIVE: return { label: 'Inactive', type: 'neutral' }; // Gray
            default: return { label: status, type: 'neutral' };
        }
    };

    const getDDFBadge = (org: Organization): { label: string; type: BadgeType } => {
        // PRD Requirement: Yellow = DDF error
        if (org.ddfStatus === DDFStatus.ERROR) return { label: 'DDF ERROR', type: 'warning' }; // Yellow
        if (org.ddfStatus === DDFStatus.WARNING) return { label: 'WARNING', type: 'warning' };
        return { label: 'HEALTHY', type: 'success' };
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Organization Management</h1>
                    <p className="mt-1 text-slate-400">Manage {total} organizations across the platform</p>
                </div>
                <button
                    onClick={() => window.location.href = '/super-admin/onboarding'}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group"
                >
                    <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Register New Organization
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6 rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="relative group col-span-1 md:col-span-2">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search name/domain..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-all"
                    />
                </div>

                <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value as OrgType); setPage(1); }}
                    className="bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white px-4 py-2 outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                >
                    <option value="">All Types</option>
                    <option value={OrgType.BROKERAGE}>Brokerage</option>
                    <option value={OrgType.AGENT}>Agent</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as OrgStatus); setPage(1); }}
                    className="bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white px-4 py-2 outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value={OrgStatus.ACTIVE}>Active</option>
                    <option value={OrgStatus.SUSPENDED}>Suspended</option>
                </select>

                <select
                    value={subFilter}
                    onChange={(e) => { setSubFilter(e.target.value as SubscriptionPlan); setPage(1); }}
                    className="bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white px-4 py-2 outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                >
                    <option value="">All Plans</option>
                    <option value={SubscriptionPlan.BASIC}>Basic</option>
                    <option value={SubscriptionPlan.PREMIUM}>Premium</option>
                    <option value={SubscriptionPlan.ENTERPRISE}>Enterprise</option>
                </select>
            </div>

            {/* Table Area */}
            <div className="rounded-3xl border border-white/5 bg-slate-900/50 overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Template</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Domain</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">DDF Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Leads (30d)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Subscription</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={9} className="px-6 py-8" />
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-20 text-center text-slate-500">No organizations found.</td>
                                </tr>
                            ) : items.map((org) => {
                                const ddf = getDDFBadge(org);
                                const status = getStatusBadge(org.status);

                                return (
                                    <tr key={org.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-white">{org.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-400">{org.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-300">{org.template}</td>
                                        <td className="px-6 py-4 text-xs text-indigo-400 font-mono tracking-tighter">{org.domain}</td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge label={ddf.label} type={ddf.type} />
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-white">
                                            {org.leads30d.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${org.subscriptionPlan === SubscriptionPlan.ENTERPRISE ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                org.subscriptionPlan === SubscriptionPlan.PREMIUM ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-700/30 text-slate-400 border-slate-700/20'
                                                }`}>
                                                {org.subscriptionPlan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge label={status.label} type={status.type} />
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === org.id ? null : org.id); }}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>

                                            {openMenuId === org.id && (
                                                <div className="absolute right-6 top-12 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 py-1 flex flex-col items-start text-sm overflow-hidden backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-100">
                                                    <button onClick={() => alert('Edit modal coming soon')} className="w-full text-left px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleToggleStatus(org)} className="w-full text-left px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                        {org.status === OrgStatus.ACTIVE ? 'Suspend' : 'Activate'}
                                                    </button>
                                                    <button onClick={() => window.open(`http://${org.domain}`, '_blank')} className="w-full text-left px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        View Website
                                                    </button>
                                                    <div className="h-px bg-white/5 w-full my-1" />
                                                    <button onClick={() => handleImpersonate(org)} className="w-full text-left px-4 py-2 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 font-semibold">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                        </svg>
                                                        Impersonate
                                                    </button>
                                                    <div className="h-px bg-white/5 w-full my-1" />
                                                    <button onClick={() => handleDelete(org)} className="w-full text-left px-4 py-2 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white/5 gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-slate-500">
                            Showing <span className="text-white">{(page - 1) * limit + 1}</span> to <span className="text-white">{Math.min(page * limit, total)}</span> of <span className="text-white">{total}</span>
                        </p>
                        <div className="flex items-center gap-2 ml-4 border-l border-white/10 pl-4">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Page Size</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="bg-slate-800 border border-white/5 rounded-md text-[10px] text-white px-2 py-1 outline-none"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 disabled:opacity-20 transition-all"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                {page}
                            </span>
                            <span className="text-xs text-slate-500 px-1">/</span>
                            <span className="text-xs text-slate-500 px-1">{Math.ceil(total / limit) || 1}</span>
                        </div>
                        <button
                            disabled={page * limit >= total}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 disabled:opacity-20 transition-all"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
