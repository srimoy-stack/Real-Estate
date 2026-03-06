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
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-10 w-64 bg-slate-800 rounded-lg" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-slate-900/50 rounded-2xl border border-white/5" />
                    ))}
                </div>
                <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5" />
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
                <h2 className="text-xl font-bold text-white">Oops! Something went wrong</h2>
                <p className="text-slate-400 max-w-md">{error || 'Could not load your metrics. Please try again later.'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
                <p className="mt-2 text-slate-400">Monitoring real-time performance and ecosystem health</p>
            </div>

            {/* Main Metrics */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    label="Total Brokerages"
                    value={metrics.totalBrokerages.toLocaleString()}
                    trend={{ value: '+12%', type: 'positive' }}
                    color="from-blue-500 to-indigo-600"
                />
                <MetricCard
                    label="Total Agents"
                    value={metrics.totalAgents.toLocaleString()}
                    trend={{ value: '+8%', type: 'positive' }}
                    color="from-purple-500 to-pink-600"
                />
                <MetricCard
                    label="Active Websites"
                    value={metrics.activeWebsites.toLocaleString()}
                    trend={{ value: 'Stable', type: 'neutral' }}
                    color="from-emerald-500 to-teal-600"
                />
                <MetricCard
                    label="Leads (30d)"
                    value={metrics.leadsTotal30d.toLocaleString()}
                    trend={{ value: '+24%', type: 'positive' }}
                    color="from-amber-500 to-orange-600"
                />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* System Health Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-semibold text-white mb-6">Service Continuity</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2.5 w-2.5 rounded-full ${metrics.ddfConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                    <span className="text-sm font-medium text-slate-200">DDF Ingestion Engine</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-md ${metrics.ddfHealth === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                                    metrics.ddfHealth === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                    {metrics.ddfHealth.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                    <span className="text-sm font-medium text-slate-200">Sync Errors Detected</span>
                                </div>
                                <span className="text-xs font-bold text-rose-400">
                                    {metrics.feedErrors} Errors
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">API Latency</p>
                                    <p className="text-lg font-bold text-white tracking-tighter">{metrics.apiLatency}ms</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Error Rate</p>
                                    <p className="text-lg font-bold text-rose-400 tracking-tighter">{metrics.errorRate}%</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                <div className="flex items-center gap-3">
                                    <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Failed Background Jobs</span>
                                </div>
                                <span className="text-sm font-black text-white px-2.5 py-1 bg-rose-500 rounded-lg shadow-lg shadow-rose-500/20">{metrics.failedJobs}</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                <p className="text-xs text-indigo-400 font-medium flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                    Auto-Healing Active
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1 italic">Last sync pulse: 2 minutes ago</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-semibold text-white mb-4 italic tracking-tight">Ecosystem <span className="text-indigo-500">Scale</span></h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Active Tenants', value: metrics.activeTenants, total: metrics.totalBrokerages, color: 'bg-emerald-500' },
                                { label: 'Enterprise Custom', value: metrics.subscriptionSummary.enterprise, total: metrics.totalBrokerages, color: 'bg-indigo-500' },
                                { label: 'Revenue Growth', value: 24, total: 100, color: 'bg-rose-500', isPercent: true },
                            ].map((tier) => (
                                <div key={tier.label} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">{tier.label}</span>
                                        <span className="text-white">{tier.value}{tier.isPercent ? '%' : ''}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${tier.color}`}
                                            style={{ width: `${(tier.value / tier.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Placeholder for Lead Trend Chart */}
                <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white tracking-tight italic">Platform <span className="text-indigo-500 underline decoration-indigo-500/20 underline-offset-8">Saturation</span></h3>
                            <p className="text-sm text-slate-500 font-medium">Acquisition & event data across entire cluster</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Real-time</span>
                            </div>
                            <select className="bg-slate-800/50 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white px-3 py-2 outline-none hover:bg-slate-800 transition-all cursor-pointer">
                                <option>Last 30 Days</option>
                                <option>Last Quarter</option>
                            </select>
                        </div>
                    </div>

                    <HealthTrends metrics={metrics} />
                </div>
            </div>
        </div>
    );
}
