'use client';

import { useEffect, useState, useMemo } from 'react';
import { Skeleton, StatusBadge } from '@repo/ui';
import { getDashboardMetrics, DashboardMetrics } from '@repo/services';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Performance Guard: Lazy load heavy data visualization component
const HealthTrends = dynamic(() => import('../../../components/dashboard/HealthTrends'), {
    loading: () => <Skeleton variant="rectangular" className="h-[400px] rounded-[32px]" />
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

    const [selectedEntity, setSelectedEntity] = useState<any>(null);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);

    if (loading) {
        return (
            <div className="space-y-10 animate-pulse">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 bg-white rounded-[24px] border border-slate-100 shadow-sm" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 h-[500px] bg-white rounded-[32px] border border-slate-100" />
                    <div className="h-[500px] bg-white rounded-[32px] border border-slate-100" />
                </div>
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 text-center space-y-6">
                <div className="w-24 h-24 rounded-[32px] bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Telemetry <span className="text-rose-600">Disrupted</span></h2>
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
        <div className="space-y-10 relative">
            {/* Side Detail Panel (Slide-over for Entity) */}
            <div className={`fixed inset-y-0 right-0 w-[450px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedEntity ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedEntity && (
                    <div className="h-full flex flex-col p-10 overflow-y-auto">
                        <div className="flex items-center justify-between mb-12">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">Node Metadata</span>
                            <button onClick={() => setSelectedEntity(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-200">
                                {selectedEntity.name[0]}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">{selectedEntity.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ecosystem Ident: <span className="text-indigo-600">{selectedEntity.status} Tier</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-12">
                            <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Personnel</p>
                                <p className="text-2xl font-black text-slate-900">{selectedEntity.agents}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Node Map</p>
                                <p className="text-2xl font-black text-slate-900">v{selectedEntity.nodes}.2.0</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 underline decoration-indigo-100 underline-offset-8 decoration-2">Deep Diagnostics</h5>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Real-time Latency', value: '18.4ms', status: 'Optimal' },
                                        { label: 'DDF Propagation', value: '100%', status: 'Stable' },
                                        { label: 'Growth Velocity', value: selectedEntity.growth, status: 'Positive' },
                                        { label: 'Last Handshake', value: 'Today, 2:42 PM', status: 'Recent' },
                                    ].map((meta, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] hover:shadow-lg hover:shadow-slate-100 transition-all">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{meta.label}</p>
                                                <p className="text-sm font-black text-slate-900">{meta.value}</p>
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-indigo-500 py-1 px-2.5 bg-indigo-50 rounded-lg">{meta.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <Link href="/organizations" className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
                                    Full Management Suite
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                                <button className="mt-4 w-full py-5 text-rose-600 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-50 rounded-[24px] transition-all">Emergency Node Decouple</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Side Detail Panel (Slide-over for Log) */}
            <div className={`fixed inset-y-0 right-0 w-[450px] bg-slate-900 text-white shadow-[-10px_0_40px_rgba(0,0,0,0.4)] z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedLog ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedLog && (
                    <div className="h-full flex flex-col p-10 overflow-y-auto">
                        <div className="flex items-center justify-between mb-12">
                            <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">Security Event Log</span>
                            <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="mb-12">
                            <h4 className="text-3xl font-black tracking-tighter leading-tight border-l-4 border-indigo-500 pl-6">{selectedLog.event}</h4>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4 pl-6">Timestamp: {selectedLog.time}</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Internal Status', value: selectedLog.status, desc: 'Protocol execution result' },
                                { label: 'Node Detail', value: selectedLog.detail, desc: 'Observed node performance' },
                                { label: 'Regional Fidelity', value: '100.0%', desc: 'Consistency across clusters' },
                                { label: 'Payload Integrity', value: 'Verified', desc: 'SHA-256 Checksum confirmed' },
                            ].map((row, i) => (
                                <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{row.label}</p>
                                    <p className="text-lg font-black text-white uppercase tracking-tight">{row.value}</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-2">{row.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-10">
                            <button className="w-full py-5 border-2 border-white/10 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl">Acknowledge Alert</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Side Detail Panel (Slide-over for Agent) */}
            <div className={`fixed inset-y-0 right-0 w-[450px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-[110] transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedAgent ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedAgent && (
                    <div className="h-full flex flex-col p-10 overflow-y-auto">
                        <div className="flex items-center justify-between mb-12">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">Agent Identity</span>
                            <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-200 uppercase">
                                {selectedAgent.name[0]}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">{selectedAgent.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: <span className="text-emerald-600">{selectedAgent.status}</span></p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Hub</p>
                                <p className="text-sm font-black text-slate-900">{selectedAgent.brokerage}</p>
                            </div>

                            <div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-6 underline decoration-indigo-100 underline-offset-8 decoration-2">Performance Metrics</h5>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Uplink Quality', value: 'High Fidelity', status: 'Stable' },
                                        { label: 'Platform Load', value: '14.2%', status: 'Nominal' },
                                        { label: 'Sync Frequency', value: 'Real-time', status: 'Active' },
                                    ].map((meta, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] hover:shadow-lg hover:shadow-slate-100 transition-all">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{meta.label}</p>
                                                <p className="text-sm font-black text-slate-900">{meta.value}</p>
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-indigo-500 py-1 px-2.5 bg-indigo-50 rounded-lg">{meta.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link href="/agents" className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                                Full Agent Registry
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Interactive Metrics Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Global Entities', value: metrics.totalBrokerages, trend: '+12.4%', sub: 'Ecosystem Nodes', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, href: '/organizations' },
                    { label: 'Active Personnel', value: metrics.totalAgents, trend: '+8.2%', sub: 'Authorized Entities', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, href: '/agents' },
                    { label: 'Active Protocols', value: metrics.activeWebsites, trend: 'OPTIMAL', sub: 'Shortcode Sync', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" /></svg>, href: '/shortcodes' },
                    { label: 'Total Leads', value: metrics.leadsTotal30d, trend: '+24.1%', sub: '30D Throughput', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, href: '/leads' },
                    { label: 'Active Billing', value: Object.values(metrics.subscriptionSummary).reduce((a, b) => a + b, 0), trend: 'SECURE', sub: 'Revenue Channels', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, href: '/billing' },
                ].map((stat, idx) => (
                    <Link key={idx} href={stat.href} className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm flex flex-col items-start gap-4 transition-all hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-2 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />

                        <div className="p-4 rounded-[22px] bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            {stat.icon}
                        </div>

                        <div className="space-y-1 z-10">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors uppercase leading-none">{stat.value.toLocaleString()}</span>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pt-1">{stat.label}</div>

                            <div className="flex items-center gap-2 pt-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.trend.includes('+') ? 'text-indigo-600' : 'text-emerald-500'}`}>
                                    {stat.trend}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{stat.sub}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity translate-x-3 group-hover:translate-x-0 duration-300">
                            View details
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </Link>
                ))}
            </div>


            {/* Internal Access Protocol (Quick Shortcuts) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Organizations', href: '/organizations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'indigo' },
                    { label: 'Shortcodes', href: '/shortcodes', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: 'emerald' },
                    { label: 'System Logs', href: '/audit-logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'slate' },
                    { label: 'Node Config', href: '/access-control', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'amber' },
                    { label: 'Security', href: '/access-control', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'rose' },
                    { label: 'Billing/API', href: '/subscriptions', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
                ].map((item, idx) => (
                    <Link key={idx} href={item.href} className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 active:scale-95 group">
                        <div className={`p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all`}>
                            <svg className="w-5 h-5 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                            </svg>
                        </div>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Network Saturation Chart */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Network Saturation</h3>
                            <p className="text-xs font-bold text-slate-400/80 uppercase tracking-wider">Aggregate Conversion & Event Dynamics</p>
                        </div>
                        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl border border-slate-100">
                            {['30D', '90D', 'YTD'].map(p => (
                                <button key={p} className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all ${p === '30D' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[400px] flex flex-col justify-end relative z-10">
                        <HealthTrends metrics={metrics} />

                        {/* Custom X-Axis from Image */}
                        <div className="flex justify-between mt-8 px-2 border-t border-slate-50 pt-6">
                            {['1 Feb', '5 Feb', '10 Feb', '15 Feb', '20 Feb', '25 Feb', '1 Mar'].map((date) => (
                                <div key={date} className="flex flex-col items-center gap-1">
                                    <div className="h-1.5 w-px bg-slate-200" />
                                    <span className="text-[10px] font-black text-slate-400/80 uppercase text-center w-8">{date.split(' ')[0]}<br />{date.split(' ')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Integrity (Radial Chart) */}
                <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm flex flex-col h-full">
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Integrity</h3>
                        <p className="text-xs font-bold text-slate-400/80 uppercase tracking-wider mt-1">Synchronized Heartbeat</p>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2 block">NOMINAL</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative py-8">
                        {/* Radial Progress Chart */}
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                <circle
                                    className="text-slate-100"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                                <circle
                                    className="text-indigo-600"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 40}
                                    strokeDashoffset={2 * Math.PI * 40 * (1 - 0.9998)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">99.98%</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-tight">Cluster<br />Availability</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">P95 Latency</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{metrics.apiLatency} ms</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Error Payload</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{metrics.errorRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Intelligence Rows */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Protocol Audit Trail */}
                <div className="xl:col-span-1 bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Protocol Audit Trail</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Ecosystem Events</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
                        {[
                            { time: '14:22:04', event: 'Region: EU-West-1 Handshake', status: 'Success', detail: 'Latency: 42ms' },
                            { time: '14:18:12', event: 'Global SEO Re-Indexing', status: 'Active', detail: '4.2k Nodes' },
                            { time: '13:55:40', event: 'New Entity: "Legacy Heights"', status: 'Linked', detail: 'Primary Cluster' },
                            { time: '13:42:12', event: 'SSL Rotation: internal.api.v4', status: 'Neutral', detail: 'Auto-Renew' },
                            { time: '13:10:05', event: 'Traffic Surge: West Coast', status: 'Urgent', detail: '+420% Load' },
                            { time: '12:55:30', event: 'DDF Data Stream Sync', status: 'Success', detail: '100% Fidelity' },
                            { time: '12:30:12', event: 'Agent Migration: Node 7', status: 'Success', detail: '12 Personnel' },
                        ].map((log, idx) => (
                            <div key={idx}
                                onClick={() => setSelectedLog(log)}
                                className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all"
                            >
                                <div className="text-[10px] font-black text-slate-300 group-hover:text-indigo-600 transition-colors uppercase pt-1">{log.time}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{log.event}</p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : log.status === 'Urgent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>{log.status}</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1">{log.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-6 w-full py-4 border-2 border-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">Export Protocol Logs</button>
                </div>

                {/* Entity Intelligence Table */}
                <div className="xl:col-span-2 bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Entity Intelligence</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">High-Performing Managed Organizations</p>
                        </div>
                        <StatusBadge label="Top 50 Tracking" type="success" />
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brokerage Entity</th>
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Personnel</th>
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nodes</th>
                                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">30D Velocity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { name: 'Skyline Global Realty', agents: 142, nodes: 4, growth: '+22.4%', status: 'Enterprise' },
                                    { name: 'Summit Property Group', agents: 89, nodes: 2, growth: '+15.2%', status: 'Premium' },
                                    { name: 'Coastal Living Co.', agents: 56, nodes: 1, growth: '+8.1%', status: 'Standard' },
                                    { name: 'Metropolis Estates', agents: 210, nodes: 7, growth: '+42.8%', status: 'Enterprise' },
                                    { name: 'Heritage Realtors', agents: 34, nodes: 1, growth: '-2.4%', status: 'Standard' },
                                ].map((entity, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => setSelectedEntity(entity)}
                                        className="group hover:bg-indigo-50/50 transition-all cursor-pointer"
                                    >
                                        <td className="py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs group-hover:bg-indigo-600 transition-colors">
                                                    {entity.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{entity.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{entity.status}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700">{entity.agents}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">verified</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-center">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">NODE {entity.nodes}</span>
                                        </td>
                                        <td className="py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-sm font-black ${entity.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{entity.growth}</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">vs q4</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Global Agent Registry */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight text-indigo-600">Global Agent Registry</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Individual Personnel Distribution index</p>
                    </div>
                    <Link href="/agents" className="px-6 py-3 bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        Entire Network Index
                    </Link>
                </div>

                <div className="flex-1 overflow-x-auto min-w-[800px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Identity</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Hub</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deployment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { id: 'a1', name: 'Jonathan Sterling', brokerage: 'Sterling Luxury Group', status: 'Active', tier: 'Enterprise' },
                                { id: 'a2', name: 'Maria Rodriguez', brokerage: 'Metro Realty Hub', status: 'Syncing', tier: 'Prime' },
                                { id: 'a3', name: 'David Chen', brokerage: 'Quantum Properties', status: 'Active', tier: 'Standard' },
                                { id: 'a4', name: 'Sarah Jenkins', brokerage: 'Independent', status: 'Warning', tier: 'Legacy' },
                            ].map((agent, i) => (
                                <tr
                                    key={i}
                                    onClick={() => setSelectedAgent(agent)}
                                    className="group hover:bg-indigo-50/50 transition-all cursor-pointer"
                                >
                                    <td className="py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase group-hover:bg-indigo-600 transition-colors">
                                                {agent.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{agent.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: PRT-{agent.id}00</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{agent.brokerage}</p>
                                    </td>
                                    <td className="py-6 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${agent.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : agent.status === 'Syncing' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td className="py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{agent.tier} Deployment</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Verified Node</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sub-Footer Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${insight.impact === 'Urgent' ? 'bg-rose-50 text-rose-600' :
                                insight.impact === 'Positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {insight.type === 'growth' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> :
                                        insight.type === 'alert' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> :
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">{insight.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{insight.description}</p>
                            </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${insight.impact === 'Urgent' ? 'bg-rose-50 text-rose-500' :
                            insight.impact === 'Positive' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                            }`}>
                            {insight.impact}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer Status Bar matching layout */}
            <footer className="py-6 px-10 bg-slate-900 rounded-[24px] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-slate-900/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">All Cluster Nodes Operational</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Region: <span className="text-white">na-east-primary</span></p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 relative z-10">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure Protocol Active
                </div>
            </footer>
        </div >
    );
}
