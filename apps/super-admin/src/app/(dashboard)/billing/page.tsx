'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizations, SubscriptionPlan, OrganizationDashboardItem } from '@repo/services';

export default function BillingPage() {
    const router = useRouter();
    const [orgs, setOrgs] = useState<OrganizationDashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPlan, setFilterPlan] = useState<SubscriptionPlan | ''>('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await getOrganizations({ page: 1, limit: 100 });
                setOrgs(data.items);
            } catch (error) {
                console.error('Failed to fetch billing data:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => orgs.filter(o => {
        if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.domain.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPlan && o.subscriptionPlan !== filterPlan) return false;
        return true;
    }), [orgs, search, filterPlan]);

    const getPlanBadge = (plan: SubscriptionPlan) => {
        switch (plan) {
            case SubscriptionPlan.ENTERPRISE: return 'bg-purple-50 text-purple-600 border-purple-100';
            case SubscriptionPlan.PREMIUM: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case SubscriptionPlan.BASIC: return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    const getPlanValue = (plan: SubscriptionPlan) => {
        switch (plan) {
            case SubscriptionPlan.ENTERPRISE: return '$2,499.00';
            case SubscriptionPlan.PREMIUM: return '$499.00';
            case SubscriptionPlan.BASIC: return '$149.00';
            default: return '$0.00';
        }
    };

    return (
        <div className="space-y-10">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-0.5 w-10 bg-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 leading-none">Revenue Control Protocol</span>
                    </div>
                    <div>
                        <h1 className="text-6xl font-black tracking-tight text-slate-900 leading-none uppercase">Billing</h1>
                        <p className="text-xl font-medium text-slate-400 mt-4 tracking-tighter">Monitoring ecosystem revenue and subscription tier statuses.</p>
                    </div>
                </div>
            </div>

            {/* Revenue Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'MRR Contribution', value: `$${(filtered.reduce((acc, o) => {
                            const val = o.subscriptionPlan === SubscriptionPlan.ENTERPRISE ? 2499 : o.subscriptionPlan === SubscriptionPlan.PREMIUM ? 499 : 149;
                            return acc + val;
                        }, 0)).toLocaleString()}.00`, color: 'indigo'
                    },
                    { label: 'Enterprise Nodes', value: filtered.filter(o => o.subscriptionPlan === SubscriptionPlan.ENTERPRISE).length, color: 'purple' },
                    { label: 'Yield Stability', value: '99.9%', color: 'emerald' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:border-indigo-100 transition-all">
                        <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-3 text-${stat.color}-500/80`}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Hub */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[280px] relative group">
                    <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="IDENTIFY NODE BY NAME OR DOMAIN..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={filterPlan}
                        onChange={e => setFilterPlan(e.target.value as any)}
                        className="pl-5 pr-10 py-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-[20px] outline-none hover:bg-slate-100 transition-all border-none focus:ring-2 focus:ring-indigo-100 appearance-none cursor-pointer"
                    >
                        <option value="">Tier: ALL CHANNELS</option>
                        {Object.values(SubscriptionPlan).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Billing Table Core */}
            <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subscription Protocol</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Account Status</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Yield (Monthly)</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-10 py-10 animate-pulse"><div className="h-6 bg-slate-50 rounded-lg w-full" /></td></tr>
                                ))
                            ) : filtered.map(org => (
                                <tr
                                    key={org.id}
                                    className="group hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 transition-colors uppercase shadow-sm">
                                                {org.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase group-hover:text-indigo-600 transition-colors leading-none tracking-tight">{org.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 tracking-tighter italic">{org.domain}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getPlanBadge(org.subscriptionPlan)}`}>
                                            {org.subscriptionPlan}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${org.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>{org.status}</span>
                                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5 tracking-tighter">Signal Profile</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right font-mono text-xs font-black text-slate-900">
                                        {getPlanValue(org.subscriptionPlan)}
                                    </td>
                                    <td className="px-10 py-8 text-right relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === org.id ? null : org.id);
                                            }}
                                            className="p-3 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 group-hover:shadow-sm border border-transparent hover:border-slate-100"
                                        >
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>

                                        {openMenuId === org.id && (
                                            <div className="absolute right-10 top-20 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 flex flex-col items-start overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <button onClick={(e) => { e.stopPropagation(); router.push(`/organizations/${org.id}/website`); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                    View Account
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-3 font-semibold">
                                                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                    Modify Access Profile
                                                </button>
                                                <div className="h-px bg-slate-50 w-full my-1" />
                                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} className="w-full text-left px-5 py-2.5 hover:bg-rose-50 text-rose-500 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Terminate Pipeline
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
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-xs leading-loose italic">No financial signal profiles match the current protocol filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
