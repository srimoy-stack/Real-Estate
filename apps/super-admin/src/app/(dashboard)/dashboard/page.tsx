'use client';

import { useEffect, useState, useMemo } from 'react';
import { Skeleton, StatusBadge } from '@repo/ui';
import { getDashboardMetrics, DashboardMetrics } from '@repo/services';
import dynamic from 'next/dynamic';

// Performance Guard: Lazy load heavy data visualization component
const HealthTrends = dynamic(() => import('../../../components/dashboard/HealthTrends'), {
    loading: () => <Skeleton variant="rectangular" className="h-[400px] rounded-[48px]" />
});

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);

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

    const insights = useMemo(() => [
        {
            title: 'Growth Velocity',
            description: 'Brokerage onboarding is 15% faster than previous Q4 averages.',
            impact: 'Positive',
            type: 'growth'
        },
        {
            title: 'Latency Anomaly',
            description: 'API response times spiked by 12ms during DDF sync in Asia-East.',
            impact: 'Urgent',
            type: 'alert'
        },
        {
            title: 'Resource Margin',
            description: 'Compute cluster is operating with 62% overhead capacity.',
            impact: 'Neutral',
            type: 'system'
        }
    ], []);

    if (loading) {
        return (
            <div className="px-8 pb-8 pt-2 space-y-12 animate-pulse bg-slate-50 min-h-screen">
                <div className="flex justify-between items-end">
                    <div className="space-y-4">
                        <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
                        <div className="h-4 w-96 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="flex gap-4">
                        <div className="h-12 w-32 bg-slate-200 rounded-xl" />
                        <div className="h-12 w-32 bg-slate-200 rounded-xl" />
                    </div>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 bg-white rounded-[40px] border border-slate-100 shadow-sm" />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-10">
                    <div className="col-span-1 h-[600px] bg-white rounded-[48px]" />
                    <div className="col-span-2 h-[600px] bg-white rounded-[48px]" />
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-12 text-center space-y-6">
                <div className="w-24 h-24 rounded-[32px] bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Telemetry <span className="text-rose-600">Disrupted</span></h2>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">Platform signals are currently unreachable. Secure protocol handshake failed.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:shadow-rose-100 hover:-translate-y-1 active:scale-95"
                >
                    Initialize Re-Sync
                </button>
            </div>
        );
    }

    return (
        <div className="px-8 pb-8 pt-2 space-y-12 bg-slate-50/50 min-h-screen relative overflow-hidden">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white uppercase tracking-[0.3em] rounded-md shadow-lg shadow-indigo-200">System v4.0.2</div>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Administrative Hub</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">
                        System <span className="text-indigo-600 underline decoration-indigo-600/10 underline-offset-[16px] decoration-8">Overview</span>
                    </h1>
                    <p className="mt-4 text-slate-500 font-medium max-w-xl text-lg">
                        Intelligence-driven diagnostics and live ecosystem orchestration for the entire real estate network.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => document.getElementById('saturation-node')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 overflow-hidden"
                    >
                        <span className="relative z-10">Stream Live Analytics</span>
                        <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                    <button
                        onClick={() => setShowSummary(true)}
                        className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Executive Summary
                    </button>
                </div>
            </header>

            {/* High Impact Analytics Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-[32px] shadow-xl shadow-slate-200/40 group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${insight.impact === 'Urgent' ? 'bg-rose-50 text-rose-600' :
                                insight.impact === 'Positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {insight.type === 'growth' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> :
                                        insight.type === 'alert' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> :
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                                </svg>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${insight.impact === 'Urgent' ? 'bg-rose-100/50 text-rose-600' :
                                insight.impact === 'Positive' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {insight.impact}
                            </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2">{insight.title}</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">{insight.description}</p>
                    </div>
                ))}
            </div>

            {/* Core Health Matrix */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
                {[
                    { label: 'Network Brokerages', value: metrics.totalBrokerages, trend: '+12.4%', sub: 'Global Entities', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                    { label: 'Strategic Agents', value: metrics.totalAgents, trend: '+8.2%', sub: 'Active Personnel', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                    { label: 'Cluster Websites', value: metrics.activeWebsites, trend: 'Optimal', sub: 'Nodes Synchronized', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18' },
                    { label: 'Network Acquisition', value: metrics.leadsTotal30d, trend: '+24.1%', sub: 'Total 30d Leads', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-100 p-8 rounded-[48px] shadow-xl shadow-slate-200/40 group hover:-translate-y-2 transition-all duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className="h-14 w-14 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={stat.icon} />
                                </svg>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.trend === 'Optimal' ? 'text-emerald-500' : 'text-indigo-600'}`}>
                                    {stat.trend}
                                </span>
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Vs Prior Period</p>
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">{stat.value.toLocaleString()}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <main className="grid gap-12 grid-cols-1 xl:grid-cols-3 relative z-10">
                {/* Visual Diagnostics Panel */}
                <div className="xl:col-span-1 space-y-12">
                    <section className="bg-white border border-slate-100 rounded-[56px] p-10 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">System <span className="text-indigo-600">Integrity</span></h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Synchronized Heartbeat</p>
                            </div>
                            <StatusBadge label="Nominal" type="success" />
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <span>Cluster Availability</span>
                                    <span className="text-emerald-600">99.98%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-[99.98%] bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 text-center group-hover:bg-white group-hover:shadow-xl transition-all">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">P95 Latency</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{metrics.apiLatency}<span className="text-lg text-indigo-400 ml-1">ms</span></p>
                                </div>
                                <div className="p-6 rounded-[32px] bg-rose-50/20 border border-rose-100/30 text-center">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Error Payload</p>
                                    <p className="text-3xl font-black text-rose-600 tracking-tighter italic">{metrics.errorRate}<span className="text-lg text-rose-300 ml-1">%</span></p>
                                </div>
                            </div>

                            <div className="p-8 rounded-[40px] bg-slate-900 shadow-2xl shadow-indigo-200/20 text-white relative h-48 flex flex-col justify-end overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-20">
                                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Compute Capacity</h4>
                                <p className="text-2xl font-black italic tracking-tighter">Cluster Tier: <span className="text-indigo-400 underline decoration-indigo-400/20 underline-offset-4">Enterprise</span></p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2">Allocated Resources: 18.2 TB / 500 Cores</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Primary Intelligence Dashboard */}
                <div id="saturation-node" className="xl:col-span-2 rounded-[64px] border border-slate-100 bg-white p-12 shadow-3xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-50/50 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 px-4">
                        <div>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">Network <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-[14px]">Saturation</span></h3>
                            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.25em] mt-3">Aggregate Conversion & Event Dynamics across Cluster Nodes</p>
                        </div>
                        <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                            {['30D', '90D', 'YTD'].map(p => (
                                <button key={p} className={`px-5 py-2.5 text-[10px] font-black rounded-xl transition-all ${p === '30D' ? 'bg-white text-indigo-600 shadow-md border border-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="min-h-[450px] flex flex-col justify-end">
                        <HealthTrends metrics={metrics} />

                        <div className="mt-12 pt-12 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
                            {[
                                { label: 'Conversion Rate', value: '4.2%', trend: '+0.5%' },
                                { label: 'Visitor Volume', value: '1.2M', trend: '+18%' },
                                { label: 'Avg Listing Life', value: '18d', trend: '-2d' },
                                { label: 'Sync Fidelity', value: '100%', trend: 'Stable' }
                            ].map(meta => (
                                <div key={meta.label} className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{meta.label}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-lg font-black text-slate-900 tracking-tighter">{meta.value}</p>
                                        <span className={`text-[8px] font-black ${meta.trend.startsWith('+') ? 'text-emerald-500' : meta.trend.startsWith('-') ? 'text-indigo-500' : 'text-slate-300'}`}>
                                            {meta.trend}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Status Bar */}
            <footer className="relative z-10 py-6 px-10 bg-slate-900 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-3xl shadow-slate-900/10 overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600 opacity-5 pointer-events-none" />
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">All Nodes Operational</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Cluster: <span className="text-white">na-east-primary</span></p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    End-to-End Cryptography Active
                </div>
            </footer>

            {/* Executive Summary Overlay */}
            {showSummary && metrics && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] border border-slate-200 shadow-3xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between relative bg-slate-900 text-white">
                            <div className="absolute top-0 right-0 h-full w-64 bg-indigo-500/10 rounded-bl-[120px] pointer-events-none" />
                            <div className="space-y-1 relative z-10">
                                <h2 className="text-3xl font-black tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Executive <span className="text-indigo-400">Summary</span></h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Strategic Network Intelligence Report</p>
                            </div>
                            <button onClick={() => setShowSummary(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors relative z-10">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-10">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Network Growth Projection</h4>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{metrics.totalBrokerages}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Brokerages</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-emerald-500">+12%</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic text-nowrap">Growth Velocity</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full w-[82%] bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Strategic Metrics</h4>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter italic">{metrics.totalAgents.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Personnel</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-slate-900 tracking-tighter italic">{metrics.leadsTotal30d.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lead Capture</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Operational Health</h4>
                                <div className="space-y-4">
                                    {[
                                        { label: 'API Response Fidelity', value: '99.98%', status: 'Stable' },
                                        { label: 'DDF Synchronization', value: 'Nominal', status: 'Healthy' },
                                        { label: 'Cloud Node Redundancy', value: '4x Active', status: 'Optimal' },
                                        { label: 'Security Handshake', value: 'TLS 1.3', status: 'Active' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[28px] hover:border-indigo-200 transition-all group">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.value}</p>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${item.status === 'Healthy' || item.status === 'Optimal' || item.status === 'Stable' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                        Transmit PDF Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
