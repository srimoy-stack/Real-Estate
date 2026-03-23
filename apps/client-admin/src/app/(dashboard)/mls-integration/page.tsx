'use client';

import React, { useState, useEffect } from 'react';
import { ddfService, useNotificationStore } from '@repo/services';
import { DDFIntegrationConfig, DDFStatusOverview } from '@repo/types';

// ─── Constants ───────────────────────────────────────
const SYNC_FREQUENCIES = [
    { label: 'Every 30 minutes', value: '30m' },
    { label: 'Every 1 hour', value: '1h' },
    { label: 'Every 6 hours', value: '6h' },
    { label: 'Every 12 hours', value: '12h' },
    { label: 'Daily', value: '24h' },
];

export default function MLSIntegrationPage() {
    const [config, setConfig] = useState<DDFIntegrationConfig | null>(null);
    const [status, setStatus] = useState<DDFStatusOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('••••••••••••••••'); // Initial masked view
    const [feedUrl, setFeedUrl] = useState('');
    const [board, setBoard] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [cfg, stat] = await Promise.all([
                    ddfService.getConfig(),
                    ddfService.getSyncStatus()
                ]);
                setConfig(cfg);
                setStatus(stat);

                // Set form defaults
                setUsername(cfg.username);
                setFeedUrl(cfg.feedUrl);
                setBoard(cfg.filterByBoard || '');
            } catch (err) {
                console.error('Failed to load DDF data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSaveConfig = async () => {
        if (!config) return;
        setSaving(true);
        try {
            const updated = await ddfService.connectDDF({
                username,
                feedUrl,
                filterByBoard: board
            });
            setConfig(updated);
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Configuration Saved',
                message: 'MLS/DDF connection settings updated.'
            });
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        try {
            // We pass null to test with existing/saved config optionally or current form state
            const result = await ddfService.testConnection({ username, apiKey: password, feedUrl });
            if (result.success) {
                useNotificationStore.getState().addNotification({
                    type: 'success',
                    title: 'Connection Success',
                    message: result.message
                });
            } else {
                useNotificationStore.getState().addNotification({
                    type: 'error',
                    title: 'Connection Failed',
                    message: result.message
                });
            }
        } catch (err) {
            console.error('Test failed:', err);
        } finally {
            setTesting(false);
        }
    };

    const handleSyncNow = async () => {
        setSyncing(true);
        try {
            const result = await ddfService.syncListings();
            const stat = await ddfService.getSyncStatus();
            setStatus(stat);

            if (result.success) {
                useNotificationStore.getState().addNotification({
                    type: 'success',
                    title: 'Sync Complete',
                    message: `Added ${result.added} new properties, updated ${result.updated}.`
                });
            } else {
                useNotificationStore.getState().addNotification({
                    type: 'error',
                    title: 'Sync Failed',
                    message: result.error || 'Unknown error during sync.'
                });
            }
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Waking engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Data Layer</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        MLS <span className="text-indigo-600 italic">Integration</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500">Configure your CREA DDF® feed and monitor automatic property synchronization.</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${status?.currentStatus === 'idle' || status?.currentStatus === 'success' ? 'bg-emerald-500' :
                                status?.currentStatus === 'syncing' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Engine Status</p>
                            <p className="text-sm font-black text-slate-900 capitalize leading-none">
                                {status?.currentStatus === 'idle' ? 'Ready' : status?.currentStatus}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Configuration Form */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Connection Credentials</h3>
                                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Endpoint</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">DDF Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                        placeholder="e.g. CREA_SYNC_USER"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">DDF Password / API Key</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                        placeholder="••••••••••••••••"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Standard Feed URL (OData/Sync)</label>
                                    <input
                                        type="text"
                                        value={feedUrl}
                                        onChange={(e) => setFeedUrl(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                        placeholder="https://data.crea.ca/..."
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 ml-1">Board / Region Filter</label>
                                    <select
                                        value={board}
                                        onChange={(e) => setBoard(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 transition-all outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="">All Boards</option>
                                        <option value="TRREB">Toronto Regional Real Estate Board (TRREB)</option>
                                        <option value="REBGV">Real Estate Board of Greater Vancouver (REBGV)</option>
                                        <option value="CREB">Calgary Real Estate Board (CREB)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testing || saving}
                                    className="flex-1 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {testing ? (
                                        <><div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /> Validating...</>
                                    ) : 'Test Connection'}
                                </button>
                                <button
                                    onClick={handleSaveConfig}
                                    disabled={saving || testing}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-indigo-600 shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? 'Connecting...' : 'Save & Connect'}
                                </button>
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50 border-t border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Sync Controls</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-10">
                                <div className="flex items-center gap-4">
                                    <div
                                        onClick={() => setConfig(prev => prev ? { ...prev, autoSync: !prev.autoSync } : null)}
                                        className={`w-14 h-8 rounded-full transition-all cursor-pointer relative ${config?.autoSync ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${config?.autoSync ? 'left-7' : 'left-1'}`} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">Auto Sync Pipeline</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div
                                        onClick={() => setConfig(prev => prev ? { ...prev, autoPublish: !prev.autoPublish } : null)}
                                        className={`w-14 h-8 rounded-full transition-all cursor-pointer relative ${config?.autoPublish ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${config?.autoPublish ? 'left-7' : 'left-1'}`} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">Auto Publish Intake</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Status & Metrics */}
                <div className="lg:col-span-5 space-y-10">
                    {/* Status Card */}
                    <div className={`rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group transition-all duration-500 ${status?.lastSyncError ? 'bg-rose-600 shadow-rose-200' : 'bg-indigo-600 shadow-indigo-200'
                        }`}>
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">
                                    {status?.lastSyncError ? '⚠️' : '📡'}
                                </div>
                                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${status?.lastSyncError ? 'bg-white text-rose-600' : 'bg-emerald-500 text-white animate-pulse'
                                    }`}>
                                    {status?.lastSyncError ? 'Gateway Error' : 'Connected'}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                                    {status?.lastSyncError ? 'Synchronization Halted' : 'Last Successful Sync'}
                                </h3>
                                <p className="text-3xl font-black italic">
                                    {status?.lastSyncAt ? new Date(status.lastSyncAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'Not yet synced'}
                                </p>
                                {status?.lastSyncError && (
                                    <p className="text-xs font-bold text-rose-100 mt-2 bg-black/10 p-3 rounded-xl border border-white/10">
                                        {status.lastSyncError}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-10 pt-4 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Listings Synced</p>
                                    <p className="text-2xl font-black">{status?.totalListingsCount || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">New Listings Added</p>
                                    <p className="text-2xl font-black">+{status?.lastSyncAdded || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Listings Updated</p>
                                    <p className="text-2xl font-black">{status?.lastSyncUpdated || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Listings Removed</p>
                                    <p className="text-2xl font-black text-rose-300">-{status?.lastSyncRemoved || 0}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSyncNow}
                                disabled={syncing}
                                className={`w-full py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${status?.lastSyncError ? 'bg-white text-rose-600' : 'bg-white text-indigo-600'
                                    }`}
                            >
                                {syncing ? (
                                    <><div className={`w-4 h-4 border-2 border-slate-100 rounded-full animate-spin ${status?.lastSyncError ? 'border-t-rose-600' : 'border-t-indigo-600'}`} /> Processing Feed...</>
                                ) : status?.lastSyncError ? 'Retry Sync Pipeline' : 'Run Manual Sync'}
                            </button>
                        </div>
                    </div>

                    {/* Sync Frequency Settings */}
                    <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-2xl shadow-slate-200/30 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Frequency Interval</h3>
                        </div>
                        <div className="space-y-4">
                            {SYNC_FREQUENCIES.map((freq) => (
                                <div
                                    key={freq.value}
                                    onClick={() => setConfig(prev => prev ? { ...prev, syncFrequency: freq.value as any } : null)}
                                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${config?.syncFrequency === freq.value
                                        ? 'border-indigo-600 bg-indigo-50/50'
                                        : 'border-slate-50 bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <span className={`text-sm font-bold transition-colors ${config?.syncFrequency === freq.value ? 'text-indigo-700' : 'text-slate-500'}`}>
                                        {freq.label}
                                    </span>
                                    {config?.syncFrequency === freq.value && (
                                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Intervals under 6 hours may impact performance during high-traffic periods.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
