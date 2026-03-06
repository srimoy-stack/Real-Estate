'use client';

import React, { useState } from 'react';

interface GeneralSettings {
    timezone: string;
    locale: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    enableNotifications: boolean;
    emailOnNewLead: boolean;
    emailOnDDFError: boolean;
    maintenanceMode: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<GeneralSettings>({
        timezone: 'America/Toronto',
        locale: 'en-CA',
        contactEmail: 'info@prestigerealty.com',
        contactPhone: '416-555-0000',
        address: '100 King St W, Toronto, ON M5X 1A1',
        enableNotifications: true,
        emailOnNewLead: true,
        emailOnDDFError: true,
        maintenanceMode: false,
    });
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'danger'>('general');

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="h-1 w-8 bg-indigo-600 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Configuration</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                    Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Settings</span>
                </h1>
                <p className="text-lg text-slate-600 font-medium max-w-2xl">
                    Manage your organization&apos;s general settings, notifications, and security.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5">
                {[
                    { key: 'general', label: 'General' },
                    { key: 'notifications', label: 'Notifications' },
                    { key: 'danger', label: 'Danger Zone' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key as any)}
                        className={`px-6 py-3 text-sm font-bold rounded-t-xl border-b-2 transition-all ${activeTab === t.key
                            ? t.key === 'danger'
                                ? 'text-red-600 border-red-500 bg-red-50'
                                : 'text-indigo-600 border-indigo-500 bg-white'
                            : 'text-slate-500 border-transparent hover:text-slate-700'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
                    <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                        <h3 className="text-lg font-bold text-slate-900">Organization Details</h3>

                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Contact Email</span>
                            <input
                                type="email"
                                value={settings.contactEmail}
                                onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Contact Phone</span>
                            <input
                                type="tel"
                                value={settings.contactPhone}
                                onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Office Address</span>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </label>
                    </div>

                    <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                        <h3 className="text-lg font-bold text-slate-900">Regional Settings</h3>

                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Timezone</span>
                            <select
                                value={settings.timezone}
                                onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="America/Toronto">Eastern (Toronto)</option>
                                <option value="America/Vancouver">Pacific (Vancouver)</option>
                                <option value="America/Edmonton">Mountain (Edmonton)</option>
                                <option value="America/Winnipeg">Central (Winnipeg)</option>
                                <option value="America/Halifax">Atlantic (Halifax)</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Locale / Language</span>
                            <select
                                value={settings.locale}
                                onChange={e => setSettings({ ...settings, locale: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="en-CA">English (Canada)</option>
                                <option value="fr-CA">French (Canada)</option>
                            </select>
                        </label>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-4 max-w-2xl animate-in fade-in duration-300">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Email Notifications</h3>

                    {[
                        { label: 'Enable All Notifications', desc: 'Master toggle for all email notifications', key: 'enableNotifications' },
                        { label: 'New Lead Alert', desc: 'Get notified when a new lead inquiry is submitted', key: 'emailOnNewLead' },
                        { label: 'DDF Sync Error Alert', desc: 'Get notified when a DDF sync fails', key: 'emailOnDDFError' },
                    ].map(toggle => (
                        <div key={toggle.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div>
                                <p className="text-sm font-bold text-slate-900">{toggle.label}</p>
                                <p className="text-xs text-slate-500">{toggle.desc}</p>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, [toggle.key]: !(s as any)[toggle.key] }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(settings as any)[toggle.key] ? 'bg-indigo-600' : 'bg-white/10'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(settings as any)[toggle.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
                <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                    <div className="p-8 rounded-3xl bg-red-50 border border-red-200 space-y-6">
                        <h3 className="text-lg font-bold text-red-700">Danger Zone</h3>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-red-100">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Maintenance Mode</p>
                                <p className="text-xs text-slate-600">Put your public website into maintenance mode. Visitors will see a &quot;Coming Soon&quot; page.</p>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-600' : 'bg-white/10'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-red-100">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Reset All Listings</p>
                                <p className="text-xs text-slate-600">Remove all synced listings and start fresh. This cannot be undone.</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-red-600 text-slate-900 text-xs font-bold hover:bg-red-700 transition-all">
                                Reset
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-red-100">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Delete Organization</p>
                                <p className="text-xs text-slate-600">Permanently delete this organization and all associated data.</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-red-600 text-slate-900 text-xs font-bold hover:bg-red-700 transition-all">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save */}
            {activeTab !== 'danger' && (
                <div className="flex items-center justify-end gap-4">
                    {saved && (
                        <span className="text-sm font-bold text-emerald-400 animate-in fade-in">✓ Settings saved</span>
                    )}
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 rounded-2xl bg-indigo-600 text-slate-900 font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
}
