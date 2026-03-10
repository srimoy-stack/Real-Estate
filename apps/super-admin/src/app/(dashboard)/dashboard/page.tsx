'use client';

import { useEffect, useState } from 'react';
import { MetricCard, Skeleton } from '@repo/ui';
import { getDashboardMetrics, DashboardMetrics } from '@repo/services';
import dynamic from 'next/dynamic';

// Performance Guard: Lazy load heavy data visualization component
const HealthTrends = dynamic(() => import('../../../components/dashboard/HealthTrends'), {
    loading: () => <Skeleton variant="rectangular" className="h-64 rounded-3xl" />
});

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await getDashboardMetrics();
                setMetrics(data);
            } catch (err) {
                setError('Failed to load dashboard metrics');
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="p-8 space-y-8 animate-pulse text-slate-900">
                <div className="h-10 w-64 bg-slate-200 rounded-lg" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
                    ))}
                </div>
                <div className="h-64 bg-white rounded-2xl border border-slate-200" />
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Oops! Something went wrong</h2>
                <p className="text-slate-500 max-w-md">{error || 'Could not load your metrics. Please try again later.'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-bold shadow-lg shadow-indigo-100"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10 bg-white">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">System <span className="text-indigo-600">Overview</span></h1>
                    <p className="mt-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Real-time Ecosystem Health & Performance</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">System Logs</button>
                    <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Export Report</button>
                </div>
            </div>

            {/* Main Metrics */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total Brokerages"
                    value={metrics.totalBrokerages.toLocaleString()}
                    trend={{ value: '+12.4%', type: 'positive' }}
                    color="from-blue-600 to-indigo-700"
                />
                <MetricCard
                    label="Active Agents"
                    value={metrics.totalAgents.toLocaleString()}
                    trend={{ value: '+8.2%', type: 'positive' }}
                    color="from-purple-600 to-pink-700"
                />
                <MetricCard
                    label="Website Cluster"
                    value={metrics.activeWebsites.toLocaleString()}
                    trend={{ value: 'Healthy', type: 'neutral' }}
                    color="from-emerald-600 to-teal-700"
                />
                <MetricCard
                    label="Leads (30d)"
                    value={metrics.leadsTotal30d.toLocaleString()}
                    trend={{ value: '+24.1%', type: 'positive' }}
                    color="from-amber-600 to-orange-700"
                />
            </div>

            <div className="grid gap-10 grid-cols-1 lg:grid-cols-3">
                {/* System Health Panel */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 italic tracking-tight">Service <span className="text-indigo-600">Continuity</span></h3>
                            <div className="px-3 py-1 bg-emerald-50 rounded-full flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl group cursor-default">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DDF Ingestion</span>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">100% UP</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-sm font-bold text-slate-700">CREA Real-time Sync</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latency</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{metrics.apiLatency}ms</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-rose-50/30 border border-rose-100/50 text-center">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Errors</p>
                                    <p className="text-2xl font-black text-rose-600 tracking-tighter">{metrics.errorRate}%</p>
                                </div>
                            </div>

                            <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sync Failures</p>
                                    <p className="text-lg font-black text-slate-900 tracking-tighter">{metrics.feedErrors} Detected</p>
                                </div>
                                <button className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 transition-colors">
                                    <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[40px] border border-slate-100 bg-slate-900 p-8 shadow-2xl shadow-indigo-200/20 text-white">
                        <h3 className="text-xl font-black italic tracking-tight mb-8">Ecosystem <span className="text-indigo-400">Scale</span></h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Active Tenants', value: metrics.activeTenants, total: metrics.totalBrokerages, color: 'bg-emerald-400' },
                                { label: 'Enterprise Layer', value: metrics.subscriptionSummary.enterprise, total: metrics.totalBrokerages, color: 'bg-indigo-400' },
                                { label: 'Cluster Load', value: 34, total: 100, color: 'bg-amber-400' },
                            ].map((tier) => (
                                <div key={tier.label} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>{tier.label}</span>
                                        <span className="text-white">{tier.value} Units</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${tier.color} shadow-lg shadow-${tier.color.split('-')[1]}-500/20`}
                                            style={{ width: `${(tier.value / tier.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                            Resource Allocation Map
                        </button>
                    </div>
                </div>

                {/* Lead Trend Chart Card */}
                <div className="lg:col-span-2 rounded-[50px] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">Platform <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-12 decoration-4">Saturation</span></h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Aggregate Acquisition & Event data across Entire Cluster</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <select className="bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 px-5 py-3 outline-none hover:border-indigo-500 transition-all cursor-pointer shadow-sm">
                                <option>Last 30 Days</option>
                                <option>Last Quarter</option>
                                <option>Year to Date</option>
                            </select>
                        </div>
                    </div>

                    <HealthTrends metrics={metrics} />
                </div>
            </div>
        </div>
    );
}
