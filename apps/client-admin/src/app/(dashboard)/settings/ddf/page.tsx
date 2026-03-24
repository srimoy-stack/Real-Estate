'use client';

import React, { useState, useEffect } from 'react';
import { ddfService, useNotificationStore } from '@repo/services';
import { DDFIntegrationConfig, DDFStatusOverview } from '@repo/types';

export default function DDFSettingsPage() {
    const [config, setConfig] = useState<DDFIntegrationConfig | null>(null);
    const [status, setStatus] = useState<DDFStatusOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
                setUsername(cfg.username || '');
                // Password stays masked or empty for security by default
            } catch (err) {
                console.error('Failed to load DDF data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSaveCredentials = async () => {
        setSaving(true);
        try {
            const updated = await ddfService.connectDDF({
                username,
                apiKey: password || undefined // Only update if typed
            });
            setConfig(updated);
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Credentials Saved',
                message: 'Your DDF connection settings have been updated and encrypted.'
            });
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const result = await ddfService.testConnection({
                username,
                apiKey: password || (config?.apiKey || ''),
                feedUrl: config?.feedUrl || 'https://data.crea.ca/DDF/Sync'
            });
            setTestResult(result);

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
            setTestResult({ success: false, message: 'Unable to communicate with the DDF Gateway.' });
        } finally {
            setTesting(false);
        }
    };

    const handleRunSync = async () => {
        setSyncing(true);
        try {
            const result = await ddfService.syncListings();
            const stat = await ddfService.getSyncStatus();
            setStatus(stat);

            if (result.success) {
                useNotificationStore.getState().addNotification({
                    type: 'success',
                    title: 'Sync Successful',
                    message: `Retrieved ${result.added} new listings and updated ${result.updated}.`
                });
            } else {
                useNotificationStore.getState().addNotification({
                    type: 'error',
                    title: 'Sync Interrupted',
                    message: result.error || 'The synchronization process encountered an error.'
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
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Pipeline Settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-10 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">MLS Data Distribution</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                        Verified <span className="text-slate-400 italic font-medium">Data Feed</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-xl">
                        Manage your property feed credentials and monitor the synchronization of listings to your local database.
                    </p>
                </div>

                {/* Connection Status Badge */}
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className={`h-3 w-3 rounded-full shadow-lg ${testing ? 'bg-yellow-400 animate-pulse' :
                        (testResult?.success || !testResult) ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                    <div className="flex flex-col text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Gate Health</p>
                        <p className="text-xs font-black text-slate-900 leading-none uppercase tracking-tighter">
                            {testing ? 'Testing...' : (testResult?.success !== false ? 'Connected to Data Feed' : 'Connection Failed')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Credentials Card */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden group border-t-4 border-t-indigo-500/10">
                        <div className="p-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                                        Pipeline Credentials
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium">Authorized access for OData Sync v2.0</p>
                                </div>
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Feed Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-100 transition-all outline-none"
                                            placeholder="Enter Data Feed Username"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Feed Password / API Key</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-100 transition-all outline-none"
                                            placeholder="••••••••••••••••"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic mt-1 ml-1 px-1">Note: Keys are encrypted and hidden after saving for security.</p>
                                </div>
                            </div>

                            {/* Connection Message */}
                            {testResult && (
                                <div className={`p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2 duration-300 ${testResult.success ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'
                                    }`}>
                                    <div className={`mt-0.5 rounded-full p-1 ${testResult.success ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={testResult.success ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${testResult.success ? 'text-emerald-700' : 'text-rose-700'
                                            }`}>
                                            {testResult.success ? 'Connection Validated' : 'Connection Failure'}
                                        </p>
                                        <p className={`text-xs font-medium ${testResult.success ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                            {testResult.message}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testing || saving}
                                    className="flex-1 py-4 bg-white border-2 border-slate-100 rounded-[20px] text-[11px] font-black uppercase tracking-widest text-slate-800 transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {testing ? (
                                        <><div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /> Verifying...</>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Test Connection
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleSaveCredentials}
                                    disabled={saving || testing}
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all hover:bg-indigo-500 shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                            Save Credentials
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Status Cards */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Sync Status Card */}
                    <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000" />

                        <div className="relative space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic">Sync <span className="text-indigo-400 text-2xl font-black">Visibility</span></h3>
                                {syncing && (
                                    <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center gap-2">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Syncing Engine</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Successful Sync</p>
                                    <p className="text-3xl font-black text-white">
                                        {status?.lastSyncAt ? new Date(status.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                        <span className="text-xs text-slate-500 font-bold ml-2 italic">— {new Date(status?.lastSyncAt || '').toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                    </p>
                                </div>

                                <div className="space-y-1 pt-4 border-t border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Listings Synchronized</p>
                                    <p className="text-5xl font-black text-white tracking-tighter">
                                        {status?.totalListingsCount?.toLocaleString() || '0'}
                                        <span className="text-sm font-bold text-emerald-400 ml-4">+{status?.lastSyncAdded || 0} New</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleRunSync}
                                disabled={syncing}
                                className={`w-full py-5 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${syncing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-indigo-50 active:scale-[0.98]'
                                    }`}
                            >
                                {syncing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
                                        Pipeline Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Run Sync Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Pro-Tip Card */}
                    <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-xl shadow-sm shrink-0">
                            💡
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Data Engine Tips</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Use the <strong className="text-slate-900 font-bold">"Test Connection"</strong> button to verify your credentials without triggering a sync. For high-volume boards, use a 6-hour interval for stability.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
