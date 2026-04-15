'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { StatusBadge, BadgeType } from '@repo/ui';
import {
    getOrganizations,
    OrganizationDashboardItem as Organization,
    OrgStatus,
    DDFStatus,
    SubscriptionPlan,
    updateOrgStatus,
    deleteOrganization,
    createAuditLog,
    AuditEventType,
    OrgType,
    assignTemplateToTenant
} from '@repo/services';
import { OrganizationType } from '@repo/types';

import { useAuth } from '@repo/auth';
import { useDebounce } from '@repo/hooks';
import { useRouter } from 'next/navigation';
import { TemplatePreviewPopup } from '@/components/TemplatePreviewPopup';

export default function BrokeragesPage() {
    const { user: superAdmin, hasHydrated } = useAuth();
    const router = useRouter();

    // State
    const [items, setItems] = useState<Organization[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [saving, setSaving] = useState(false);
    const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [typeFilter] = useState<OrganizationType | ''>(OrgType.BROKERAGE);
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
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.actions-menu-container')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleImpersonate = async (org: Organization) => {
        try {
            // TASK 1: Trigger Impersonation - Store in localStorage for consistency
            localStorage.setItem('isImpersonating', 'true');
            localStorage.setItem('impersonatedOrgId', org.id);
            localStorage.setItem('impersonatedOrgName', org.name);

            // Redirect to client-admin dashboard with URL params to bridge port gap
            window.location.href = `http://localhost:3002/dashboard?impersonating=true&orgId=${org.id}&orgName=${encodeURIComponent(org.name)}`;
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
                    organizationId: org.id,
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

    // Removed handleUpdate as it was using old updateOrganization service

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

    if (!hasHydrated) return null; // Prevent hydration mismatch errors

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingOrg) return;

        setSaving(true);
        try {
            // In a real app we'd call an API here
            // For now, update local state
            setItems(prev => prev.map(item => item.id === editingOrg.id ? editingOrg : item));

            // Audit Log
            await createAuditLog({
                eventType: AuditEventType.SYSTEM_CONFIG_CHANGE,
                actorId: superAdmin?.id || 'system-admin',
                actorName: superAdmin?.name || 'Super Admin',
                targetId: editingOrg.id,
                targetName: editingOrg.name,
                organizationId: editingOrg.id,
                status: 'SUCCESS',
                metadata: { action: 'EDIT_CONFIG', ...editingOrg }
            });

            setEditingOrg(null);
        } catch (error) {
            alert('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const templateNames: Record<string, string> = {
        'modern-realty': 'Modern Realty',
        'luxury-estate': 'Luxury Estate',
        'corporate-brokerage': 'Corporate',
        'agent-portfolio': 'Portfolio',
        'minimal-realty': 'Minimal',
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 bg-white min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Brokerage Management</h1>
                    <p className="mt-1 text-slate-500 font-medium">Manage {total} onboarded brokerages</p>
                </div>
                <button
                    onClick={() => router.push('/onboard-brokerage')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group"
                >
                    <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Register New Brokerage
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6 rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/40">
                <div className="relative group col-span-1 md:col-span-2">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search name/domain..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Type filter removed as per request to only show organization data */}

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as OrgStatus); setPage(1); }}
                    className="bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 px-4 py-2 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value={OrgStatus.ACTIVE}>Active</option>
                    <option value={OrgStatus.SUSPENDED}>Suspended</option>
                </select>

                <select
                    value={subFilter}
                    onChange={(e) => { setSubFilter(e.target.value as SubscriptionPlan); setPage(1); }}
                    className="bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 px-4 py-2 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                    <option value="">All Plans</option>
                    <option value={SubscriptionPlan.BASIC}>Basic</option>
                    <option value={SubscriptionPlan.PREMIUM}>Premium</option>
                    <option value={SubscriptionPlan.ENTERPRISE}>Enterprise</option>
                </select>
            </div>

            {/* Table Area - Removed overflow-hidden to prevent clipping actions menu */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Template</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Domain</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">DDF Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Provider</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Leads (30d)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Subscription</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={9} className="px-6 py-8" />
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-20 text-center text-slate-500">No brokerages found.</td>
                                </tr>
                            ) : items.map((org) => {
                                const ddf = getDDFBadge(org);
                                const status = getStatusBadge(org.status);

                                return (
                                    <tr key={org.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{org.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-500">{org.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600">
                                            {templateNames[org.template] || org.template}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-indigo-600 font-mono tracking-tighter">{org.domain}</td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge label={ddf.label} type={ddf.type} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 group/prov">
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{(org as any).listingProvider?.providerName || 'DDF'}</span>
                                                <button 
                                                    onClick={() => setEditingOrg(org)}
                                                    className="opacity-0 group-hover/prov:opacity-100 p-1 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded transition-all"
                                                    title="Edit Source Config"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3V17.5l13.732-13.732z" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-slate-900">
                                            {org.leads30d.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${org.subscriptionPlan === SubscriptionPlan.ENTERPRISE ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                                org.subscriptionPlan === SubscriptionPlan.PREMIUM ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                                }`}>
                                                {org.subscriptionPlan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge label={status.label} type={status.type} />
                                        </td>
                                        <td className="px-6 py-4 text-right relative actions-menu-container">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => router.push(`/website-builder?websiteId=${org.id}&templateId=${org.template}`)}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5"
                                                    title="Open Website Builder"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    Build
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === org.id ? null : org.id);
                                                    }}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {openMenuId === org.id && (
                                                <div className="absolute right-6 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1 flex flex-col items-start text-sm overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    <button onClick={() => setEditingOrg(org)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit / Configuration
                                                    </button>
                                                    <button onClick={() => handleToggleStatus(org)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                        {org.status === OrgStatus.ACTIVE ? 'Suspend' : 'Activate'}
                                                    </button>
                                                    <button onClick={() => window.open(`http://${org.domain}`, '_blank')} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        View Live Site
                                                    </button>
                                                    <button onClick={() => router.push(`/brokerages/${org.id}/website`)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        Manage Website
                                                    </button>
                                                    <button onClick={() => router.push(`/website-builder?websiteId=${org.id}&templateId=${org.template}`)} className="w-full text-left px-4 py-2 hover:bg-violet-50 text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-2 font-semibold">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Website Builder
                                                    </button>
                                                    <button onClick={() => router.push(`/brokerages/${org.id}/shortcodes`)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                        Configure Listings
                                                    </button>
                                                    <button onClick={() => router.push(`/preview/brokerage/${org.id}`)} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Preview Website
                                                    </button>
                                                    <button onClick={() => handleImpersonate(org)} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2 font-semibold">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                        </svg>
                                                        Access Admin
                                                    </button>
                                                    <div className="h-px bg-slate-100 w-full my-1" />
                                                    <button onClick={() => handleDelete(org)} className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-2">
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
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 bg-white border-t border-slate-50 gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-xs text-slate-500">
                            Showing <span className="text-slate-900 font-bold">{(page - 1) * limit + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(page * limit, total)}</span> of <span className="text-slate-900 font-bold">{total}</span>
                        </p>
                        <div className="flex items-center gap-2 ml-4 border-l border-slate-200 pl-4">
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Page Size</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="bg-white border border-slate-200 rounded-md text-[10px] text-slate-900 px-2 py-1 outline-none font-bold"
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
                            className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-400 disabled:opacity-20 transition-all shadow-sm"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-slate-900 px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                                {page}
                            </span>
                            <span className="text-xs text-slate-400 px-1 font-bold">/</span>
                            <span className="text-xs text-slate-400 px-1 font-bold">{Math.ceil(total / limit) || 1}</span>
                        </div>
                        <button
                            disabled={page * limit >= total}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-400 disabled:opacity-20 transition-all shadow-sm"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingOrg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Edit <span className="text-indigo-600">Brokerage</span></h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {editingOrg.id}</p>
                            </div>
                            <button onClick={() => setEditingOrg(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Display Name</label>
                                    <input
                                        type="text"
                                        value={editingOrg.name}
                                        onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Domain</label>
                                    <input
                                        type="text"
                                        value={editingOrg.domain}
                                        onChange={(e) => setEditingOrg({ ...editingOrg, domain: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subscription Plan</label>
                                    <select
                                        value={editingOrg.subscriptionPlan}
                                        onChange={(e) => setEditingOrg({ ...editingOrg, subscriptionPlan: e.target.value as SubscriptionPlan })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value={SubscriptionPlan.BASIC}>Basic Plan</option>
                                        <option value={SubscriptionPlan.PREMIUM}>Premium Plan</option>
                                        <option value={SubscriptionPlan.ENTERPRISE}>Enterprise Plan</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Template</label>
                                    <select
                                        value={editingOrg.template}
                                        onChange={(e) => setEditingOrg({ ...editingOrg, template: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="modern-realty">Modern Realty</option>
                                        <option value="luxury-estate">Luxury Estate</option>
                                        <option value="corporate-brokerage">Corporate Brokerage</option>
                                        <option value="agent-portfolio">Agent Portfolio</option>
                                        <option value="minimal-realty">Minimal Realty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
                                    Listing Provider Config
                                    <div className="h-px bg-slate-100 flex-1" />
                                </label>
                                <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Provider Name</label>
                                        <input
                                            type="text"
                                            value={(editingOrg as any).listingProvider?.providerName || ''}
                                            onChange={(e) => setEditingOrg({ ...editingOrg, listingProvider: { ...((editingOrg as any).listingProvider || {}), providerName: e.target.value } } as any)}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all font-black uppercase"
                                            placeholder="CREA DDF"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">API Key</label>
                                        <input
                                            type="password"
                                            value={(editingOrg as any).listingProvider?.apiKey || ''}
                                            onChange={(e) => setEditingOrg({ ...editingOrg, listingProvider: { ...((editingOrg as any).listingProvider || {}), apiKey: e.target.value } } as any)}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all"
                                            placeholder="••••••••••••••••"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Endpoint URL</label>
                                        <input
                                            type="text"
                                            value={(editingOrg as any).listingProvider?.apiEndpoint || ''}
                                            onChange={(e) => setEditingOrg({ ...editingOrg, listingProvider: { ...((editingOrg as any).listingProvider || {}), apiEndpoint: e.target.value } } as any)}
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all font-mono"
                                            placeholder="https://api.provider.com/v3"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
                                    Allowed Templates
                                    <div className="h-px bg-slate-100 flex-1" />
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'modern-realty', name: 'Modern Realty' },
                                        { id: 'luxury-estate', name: 'Luxury Estate' },
                                        { id: 'corporate-brokerage', name: 'Corporate' },
                                        { id: 'agent-portfolio', name: 'Portfolio' },
                                        { id: 'minimal-realty', name: 'Minimal' },
                                    ].map((tpl) => {
                                        const isAllowed = editingOrg.allowedTemplates?.includes(tpl.id);
                                        return (
                                            <div key={tpl.id} className="relative group/tpl">
                                                <button
                                                    type="button"
                                                    disabled={saving}
                                                    onClick={async () => {
                                                        const isNowAllowed = !isAllowed;

                                                        // Call explicit assignment service as requested
                                                        if (isNowAllowed) {
                                                            await assignTemplateToTenant(
                                                                editingOrg.id,
                                                                tpl.id,
                                                                superAdmin?.id || 'super-admin'
                                                            );
                                                        }

                                                        const current = editingOrg.allowedTemplates || [];
                                                        const next = isNowAllowed
                                                            ? [...current, tpl.id]
                                                            : current.filter(id => id !== tpl.id);

                                                        setEditingOrg({ ...editingOrg, allowedTemplates: next });
                                                    }}
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${isAllowed
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm'
                                                        : 'bg-white border-slate-200 text-slate-400 grayscale'
                                                        }`}
                                                >
                                                    {isAllowed ? '✓ Assigned' : `Assign ${tpl.name}`}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewTemplateId(tpl.id)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm opacity-0 group-hover/tpl:opacity-100 transition-opacity"
                                                    title="Preview Template"
                                                >
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
                                    Enabled Modules
                                    <div className="h-px bg-slate-100 flex-1" />
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {editingOrg.modules && Object.entries(editingOrg.modules).map(([key, enabled]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setEditingOrg({
                                                ...editingOrg,
                                                modules: { ...editingOrg.modules!, [key]: !enabled }
                                            })}
                                            className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${enabled
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-400 grayscale'
                                                }`}
                                        >
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingOrg(null)}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    {saving && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Template Preview Popup */}
            {previewTemplateId && (
                <TemplatePreviewPopup
                    templateKey={previewTemplateId}
                    onClose={() => setPreviewTemplateId(null)}
                />
            )}
        </div>
    );
}
