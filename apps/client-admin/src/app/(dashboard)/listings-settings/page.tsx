'use client';

import React, { useState } from 'react';
import { ListingDisplaySettings, ListingPoolMode } from '@repo/types';

const mockListings = [
    { id: '1', title: 'The Glass Pavilion Mansion', price: 12500000, status: 'ACTIVE', type: 'DETACHED', city: 'Toronto', featured: true },
    { id: '2', title: 'Skyline Penthouse Suites', price: 3800000, status: 'ACTIVE', type: 'CONDO', city: 'Toronto', featured: false },
    { id: '3', title: 'Elysian Shore Villa', price: 8900000, status: 'ACTIVE', type: 'DETACHED', city: 'Vancouver', featured: true },
    { id: '4', title: 'Harbor View Industrial', price: 2100000, status: 'PENDING', type: 'COMMERCIAL', city: 'Burnaby', featured: false },
    { id: '5', title: 'Meadowbrook Townhome', price: 950000, status: 'ACTIVE', type: 'TOWNHOUSE', city: 'Calgary', featured: false },
    { id: '6', title: 'Lakeview Semi-Detached', price: 1250000, status: 'OFF_MARKET', type: 'SEMI_DETACHED', city: 'Ottawa', featured: false },
];

export default function ListingsSettingsPage() {
    const [settings, setSettings] = useState<ListingDisplaySettings>({
        defaultSort: 'price_desc',
        listingsPerPage: 12,
        featuredListingIds: ['1', '3'],
        poolMode: 'brokerage_only',
        filterRestrictions: {
            cities: ['Toronto', 'Vancouver'],
            postalCodes: ['M5H', 'V6B'],
            minPrice: 500000,
            maxPrice: 20000000,
        },
        showPriceRange: true,
        showMap: true,
        showVirtualTour: true,
        hideOffMarket: false,
        enableComparisons: true,
    });

    const [tab, setTab] = useState<'display' | 'filters' | 'featured'>('display');
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }, 800);
    };

    const toggleFeatured = (id: string) => {
        setSettings(s => ({
            ...s,
            featuredListingIds: s.featuredListingIds.includes(id)
                ? s.featuredListingIds.filter(x => x !== id)
                : [...s.featuredListingIds, id]
        }));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Frontend Configuration</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900">
                        Display <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Logic</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Fine-tune how properties are presented, filtered, and prioritized on your public-facing portal.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {saveStatus === 'success' && (
                        <span className="text-emerald-500 text-sm font-bold animate-in fade-in slide-in-from-right-4">
                            ✓ System Updated
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                    >
                        {isSaving ? 'Processing...' : 'Apply Global Settings'}
                    </button>
                </div>
            </div>

            {/* Premium Navigation */}
            <div className="flex gap-1 bg-slate-100 p-1.5 rounded-[24px] w-fit">
                {[
                    { key: 'display', label: 'Core Presentation' },
                    { key: 'filters', label: 'Filter Constraints' },
                    { key: 'featured', label: 'Priority / Featured' },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key as any)}
                        className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${tab === t.key
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {tab === 'display' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-10 rounded-[48px] bg-white border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-2xl font-black text-slate-900">General <span className="text-indigo-600">Behavior</span></h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Sort Order</span>
                                        <select
                                            value={settings.defaultSort}
                                            onChange={e => setSettings({ ...settings, defaultSort: e.target.value as any })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="price_desc">Premium First (Price High-Low)</option>
                                            <option value="price_asc">Value First (Price Low-High)</option>
                                            <option value="newest">Recent First (Chronological)</option>
                                            <option value="oldest">Historical (Oldest First)</option>
                                        </select>
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Density</span>
                                        <select
                                            value={settings.listingsPerPage}
                                            onChange={e => setSettings({ ...settings, listingsPerPage: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
                                        >
                                            <option value={12}>12 Items Per Page</option>
                                            <option value={24}>24 Items Per Page</option>
                                            <option value={48}>48 Items Per Page</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integration Mode</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'brokerage_only', label: 'Exclusive Mode', desc: 'Display only listings held by your brokerage' },
                                            { id: 'shared_pool', label: 'Reciprocity Mode', desc: 'Display all shared DDF / MLS® data pool' }
                                        ].map((mode) => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setSettings({ ...settings, poolMode: mode.id as ListingPoolMode })}
                                                className={`p-6 rounded-[32px] text-left transition-all border-2 ${settings.poolMode === mode.id
                                                    ? 'border-indigo-600 bg-indigo-50/50'
                                                    : 'border-slate-100 bg-white hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`h-4 w-4 rounded-full border-2 mb-4 flex items-center justify-center ${settings.poolMode === mode.id ? 'border-indigo-600' : 'border-slate-300'}`}>
                                                    {settings.poolMode === mode.id && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                                                </div>
                                                <p className="text-sm font-black text-slate-900">{mode.label}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-1">{mode.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'filters' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-10 rounded-[48px] bg-white border border-slate-200 shadow-sm space-y-8">
                                <h3 className="text-2xl font-black text-slate-900">Regional <span className="text-indigo-600">Gatekeeping</span></h3>

                                <div className="space-y-6">
                                    <label className="block space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Whitelisted Cities</span>
                                            <span className="text-[9px] font-bold text-indigo-500 uppercase">Tags separate by comma</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={settings.filterRestrictions.cities.join(', ')}
                                            onChange={e => setSettings({
                                                ...settings,
                                                filterRestrictions: { ...settings.filterRestrictions, cities: e.target.value.split(',').map(s => s.trim()) }
                                            })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="e.g. Toronto, Vancouver, Burnaby"
                                        />
                                    </label>

                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postal Code Prefixes</span>
                                        <input
                                            type="text"
                                            value={settings.filterRestrictions.postalCodes.join(', ')}
                                            onChange={e => setSettings({
                                                ...settings,
                                                filterRestrictions: { ...settings.filterRestrictions, postalCodes: e.target.value.split(',').map(s => s.trim()) }
                                            })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="e.g. M5, V6, T2"
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Minimum Price</span>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                            <input
                                                type="number"
                                                value={settings.filterRestrictions.minPrice}
                                                onChange={e => setSettings({
                                                    ...settings,
                                                    filterRestrictions: { ...settings.filterRestrictions, minPrice: Number(e.target.value) }
                                                })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Maximum Price</span>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                            <input
                                                type="number"
                                                value={settings.filterRestrictions.maxPrice}
                                                onChange={e => setSettings({
                                                    ...settings,
                                                    filterRestrictions: { ...settings.filterRestrictions, maxPrice: Number(e.target.value) }
                                                })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-6 py-5 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'featured' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-10 rounded-[48px] bg-white border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-900">Featured <span className="text-indigo-600">Showcase</span></h3>
                                    <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-500">
                                        {settings.featuredListingIds.length} Selected
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {mockListings.map((l) => (
                                        <div
                                            key={l.id}
                                            className={`group p-6 rounded-[32px] border-2 transition-all flex items-center justify-between ${settings.featuredListingIds.includes(l.id)
                                                ? 'border-indigo-600 bg-indigo-50/20'
                                                : 'border-slate-50 bg-white hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900">{l.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{l.city}</span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <span className="text-[10px] font-black text-indigo-500">${(l.price / 1000000).toFixed(1)}M</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleFeatured(l.id)}
                                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${settings.featuredListingIds.includes(l.id)
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white border-2 border-slate-200 text-slate-400 hover:text-slate-900 group-hover:border-slate-900'
                                                    }`}
                                            >
                                                {settings.featuredListingIds.includes(l.id) ? 'Featured' : 'Mark Priority'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar UI Features */}
                <div className="space-y-8">
                    <div className="p-10 rounded-[48px] bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <h4 className="text-xl font-black italic relative">Interface <span className="text-indigo-400">Switches</span></h4>

                        <div className="space-y-6 relative">
                            {[
                                { label: 'Interactive price range mapping', key: 'showPriceRange' },
                                { label: 'Dynamic vector map interface', key: 'showMap' },
                                { label: 'Deep virtual tour projection', key: 'showVirtualTour' },
                                { label: 'Filter historical (Off-Market)', key: 'hideOffMarket' },
                                { label: 'Granular comparison engine', key: 'enableComparisons' },
                            ].map((toggle) => (
                                <div key={toggle.key} className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{toggle.label}</span>
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, [toggle.key]: !(s as any)[toggle.key] }))}
                                        className={`w-10 h-5 rounded-full transition-all relative ${(settings as any)[toggle.key] ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${(settings as any)[toggle.key] ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-[32px] bg-white/5 border border-white/5">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Technical Note</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                Toggle changes are synchronized with the CDN edge immediately upon application. Users will perceive these updates on the next page lifecycle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
