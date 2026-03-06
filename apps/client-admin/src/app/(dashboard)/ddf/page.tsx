'use client';

import React, { useState } from 'react';
import { DDFSyncStatus, DDFSyncLog, DDFIntegrationConfig } from '@repo/types';

export default function DDFPage() {
    // State management
    const [config, setConfig] = useState<DDFIntegrationConfig>({
        feedUrl: 'https://data.crea.ca/Feed/DDF/',
        username: 'crea_user_882',
        apiKey: '', // Empty initially, will be shown as masked if "saved"
        syncFrequency: '6h',
        autoSync: true,
        autoPublish: true,
        importPhotos: true,
    });

    const [isSaved, setIsSaved] = useState(true); // Mocking that we have saved state
    const [syncStatus, setSyncStatus] = useState<DDFSyncStatus>('success');
    const [lastSyncAt, setLastSyncAt] = useState('2026-03-05T18:30:00Z');
    const [syncing, setSyncing] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const [syncHistory] = useState<DDFSyncLog[]>([
        { id: '1', timestamp: '2026-03-05T18:30:00Z', status: 'success', addedCount: 12, updatedCount: 84, removedCount: 2, duration: '4.8s', createdAt: '', updatedAt: '' },
        { id: '2', timestamp: '2026-03-05T12:30:00Z', status: 'success', addedCount: 5, updatedCount: 32, removedCount: 0, duration: '3.2s', createdAt: '', updatedAt: '' },
        { id: '3', timestamp: '2026-03-05T06:30:00Z', status: 'failed', addedCount: 0, updatedCount: 0, removedCount: 0, duration: '12.1s', errorReason: 'Socket Timeout: CREA gateway unresponsive', createdAt: '', updatedAt: '' },
        { id: '4', timestamp: '2026-03-05T00:30:00Z', status: 'success', addedCount: 28, updatedCount: 142, removedCount: 8, duration: '7.4s', createdAt: '', updatedAt: '' },
    ]);

    const handleManualSync = () => {
        setSyncing(true);
        setSyncStatus('syncing');

        // Simulating sync process
        setTimeout(() => {
            setSyncing(false);
            setSyncStatus('success');
            setLastSyncAt(new Date().toISOString());
            // In real app, we would update history here
        }, 3000);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!config.apiKey && !isSaved) {
            setErrorMsg('API key is required for initial setup.');
            setSaveStatus('error');
            return;
        }

        setSaveStatus('saving');
        setErrorMsg('');

        setTimeout(() => {
            setSaveStatus('success');
            setIsSaved(true);
            // Mask the key in state after save to ensure it's not held in memory unnecessarily
            setConfig(prev => ({ ...prev, apiKey: '' }));
            setTimeout(() => setSaveStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-emerald-500 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Integrations</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900">
                        DDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Sync Engine</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Securely pipeline MLS® listings from the CREA Data Distribution Facility directly into your brokerage ecosystem.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Pipeline Sync</p>
                        <p className="text-sm font-bold text-slate-900">{new Date(lastSyncAt).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={handleManualSync}
                        disabled={syncing}
                        className={`group px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl ${syncing
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-emerald-500/10'
                            }`}
                    >
                        {syncing ? (
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        {syncing ? 'Syncing...' : 'Force Sync'}
                    </button>
                </div>
            </div>

            {/* Health Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-2 h-full ${syncStatus === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Connection Health</p>
                    <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full ${syncStatus === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <h4 className="text-3xl font-black text-slate-900 capitalize">{syncStatus === 'success' ? 'Encrypted & Active' : 'Interrupted'}</h4>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-3">Verified connection to CREA Gateway</p>
                </div>

                <div className="p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Active Pipeline</p>
                    <h4 className="text-4xl font-black text-slate-900">1,842 <span className="text-lg text-emerald-500">+14%</span></h4>
                    <p className="text-sm text-slate-500 font-medium mt-3">Live listings synchronized in last 24h</p>
                </div>

                <div className="p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Data Reliability</p>
                    <h4 className="text-4xl font-black text-slate-900">99.9<span className="text-lg text-slate-400">%</span></h4>
                    <p className="text-sm text-slate-500 font-medium mt-3">Success rate over last 1,000 requests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Configuration Panel */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="p-10 rounded-[48px] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                        <div className="relative space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black italic">Sensitive <span className="text-emerald-400">Credentials</span></h3>
                                <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.9L10 9.155l7.834-4.256A2 2 0 0016 4H4a2 2 0 00-1.834.9zM1.834 6.144L10 10.58l8.166-4.436A2 2 0 0119 8v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8c0-.704.365-1.322.917-1.683z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">TLS 1.3 Encryption</span>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DDF Gateway URL</span>
                                        <input
                                            type="text"
                                            value={config.feedUrl}
                                            onChange={e => setConfig({ ...config, feedUrl: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:bg-white/10 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</span>
                                        <input
                                            type="text"
                                            value={config.username}
                                            onChange={e => setConfig({ ...config, username: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:bg-white/10 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </label>
                                </div>

                                <label className="block space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Secret Key</span>
                                        {isSaved && !config.apiKey && (
                                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">● Encrypted & Stored</span>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={isSaved && !config.apiKey && !showApiKey ? '••••••••••••••••••••••••' : config.apiKey}
                                            onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                                            disabled={isSaved && !showApiKey}
                                            placeholder={isSaved ? '' : "Enter your DDF secret key"}
                                            className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono text-sm focus:bg-white/10 focus:border-emerald-500 outline-none transition-all ${isSaved && !showApiKey ? 'cursor-not-allowed opacity-60' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isSaved && !showApiKey) setIsSaved(false);
                                                setShowApiKey(!showApiKey);
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all"
                                        >
                                            {showApiKey ? (
                                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium">To protect your security, keys are never displayed in plain-text after saving.</p>
                                </label>

                                <div className="flex items-center justify-between pt-6">
                                    <div className="flex items-center gap-4">
                                        {saveStatus === 'success' && (
                                            <span className="text-emerald-400 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                                Storage Secured
                                            </span>
                                        )}
                                        {saveStatus === 'error' && (
                                            <span className="text-red-400 text-sm font-bold animate-in shake">{errorMsg}</span>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saveStatus === 'saving'}
                                        className="px-10 py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-50"
                                    >
                                        {saveStatus === 'saving' ? 'Validating...' : 'Secure Connection'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm space-y-6">
                            <h4 className="text-lg font-black text-slate-900">Automation Settings</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-black text-slate-800">Auto-Sync Pipeline</p>
                                        <p className="text-xs text-slate-500">Run sync based on frequency</p>
                                    </div>
                                    <button
                                        onClick={() => setConfig({ ...config, autoSync: !config.autoSync })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${config.autoSync ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.autoSync ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-black text-slate-800">Instant Publishing</p>
                                        <p className="text-xs text-slate-500">New listings go live immediately</p>
                                    </div>
                                    <button
                                        onClick={() => setConfig({ ...config, autoPublish: !config.autoPublish })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${config.autoPublish ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.autoPublish ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm space-y-6">
                            <h4 className="text-lg font-black text-slate-900">Cadence Control</h4>
                            <label className="block space-y-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Frequency</span>
                                <select
                                    value={config.syncFrequency}
                                    onChange={e => setConfig(prev => ({ ...prev, syncFrequency: e.target.value as any }))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all cursor-pointer appearance-none"
                                >
                                    <option value="1h">Extreme (Every 1 Hour)</option>
                                    <option value="3h">Aggressive (Every 3 Hours)</option>
                                    <option value="6h">Standard (Every 6 Hours)</option>
                                    <option value="12h">Relaxed (Every 12 Hours)</option>
                                    <option value="24h">Daily (Every 24 Hours)</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Status Logs Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-8 rounded-[48px] bg-white border border-slate-200 shadow-sm relative h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 italic">Sync <span className="text-emerald-500">History</span></h3>
                            <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Export Logs</button>
                        </div>

                        <div className="space-y-6">
                            {syncHistory.map((log) => (
                                <div key={log.id} className="group relative pl-8 pb-8 border-l border-slate-100 last:pb-0">
                                    <div className={`absolute left-[-5px] top-0 h-[9px] w-[9px] rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'} ring-4 ring-white transition-transform group-hover:scale-125`} />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-400">{new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                {log.status}
                                            </span>
                                        </div>

                                        {log.status === 'success' ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-slate-50 rounded-xl p-3">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">New</p>
                                                    <p className="text-sm font-black text-emerald-600">+{log.addedCount}</p>
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-3">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Upd</p>
                                                    <p className="text-sm font-black text-slate-800">{log.updatedCount}</p>
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-3">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Del</p>
                                                    <p className="text-sm font-black text-red-500">-{log.removedCount}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                                                <div className="flex items-start gap-2">
                                                    <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-xs text-red-600 font-bold leading-relaxed">{log.errorReason}</p>
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-400 font-medium">Processing completed in {log.duration}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
