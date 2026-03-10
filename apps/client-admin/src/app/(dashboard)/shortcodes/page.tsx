'use client';

import React, { useState } from 'react';
import { ShortcodeFilters, UserRole } from '@repo/types';

interface ShortcodeUIModel {
    id: string;
    websiteId: string;
    shortcodeName: string;
    filters: ShortcodeFilters;
    limit: number;
    isActive: boolean;
}

const mockShortcodes: ShortcodeUIModel[] = [
    {
        id: 'config_892jdk',
        websiteId: 'website_sarah',
        shortcodeName: 'luxuryCondos',
        filters: { city: 'Toronto', propertyType: 'Condo', minPrice: 1000000 },
        limit: 6,
        isActive: true,
    },
    {
        id: 'config_jf88sj',
        websiteId: 'website_michael',
        shortcodeName: 'starterHomes',
        filters: { maxPrice: 800000, propertyType: 'Townhouse' },
        limit: 9,
        isActive: true,
    }
];

export default function ShortcodesPage() {
    const [currentUserRole, setCurrentUserRole] = useState<UserRole>('client_admin');
    const [shortcodes, setShortcodes] = useState<ShortcodeUIModel[]>(mockShortcodes);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<ShortcodeUIModel>({
        id: '',
        websiteId: 'website_sarah', // Defaulting to one of the agents
        shortcodeName: '',
        filters: {},
        limit: 10,
        isActive: true,
    });

    const isBrokerageAdmin = currentUserRole === 'client_admin';

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBrokerageAdmin) return;

        if (editingId) {
            setShortcodes(shortcodes.map(s => s.id === editingId ? { ...formData, id: editingId } : s));
        } else {
            setShortcodes([...shortcodes, { ...formData, id: `config_${Math.random().toString(36).substr(2, 6)}` }]);
        }
        setShowModal(false);
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (!isBrokerageAdmin) return;
        if (confirm('Permanently delete this shortcode configuration? Agents using this will see an empty grid.')) {
            setShortcodes(shortcodes.filter(s => s.id !== id));
        }
    };

    const handleToggleStatus = (id: string) => {
        if (!isBrokerageAdmin) return;
        setShortcodes(shortcodes.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    };

    const resetForm = () => {
        setFormData({ id: '', websiteId: 'website_sarah', shortcodeName: '', filters: {}, limit: 10, isActive: true });
        setEditingId(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Role Simulator Switcher (Demo Only) */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Context Simulator:</span>
                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                    <button
                        onClick={() => setCurrentUserRole('client_admin')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${currentUserRole === 'client_admin' ? 'bg-indigo-600' : 'hover:bg-white/5'}`}
                    >
                        Brokerage Admin
                    </button>
                    <button
                        onClick={() => setCurrentUserRole('agent')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${currentUserRole === 'agent' ? 'bg-purple-600' : 'hover:bg-white/5'}`}
                    >
                        Agent View
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Site Config</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900">
                        Listing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Shortcodes</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        {isBrokerageAdmin
                            ? 'Create predefined listing queries that your team can embed securely into their templates via [listings config="name"].'
                            : 'View available shortcode configurations provided by your brokerage.'}
                    </p>
                </div>
                {isBrokerageAdmin && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/10 flex items-center gap-3"
                    >
                        <svg className="w-5 h-5 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Shortcode
                    </button>
                )}
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shortcodes.map(code => (
                    <div
                        key={code.id}
                        className={`group relative p-8 rounded-[48px] bg-white border border-slate-200 shadow-sm transition-all duration-500 overflow-hidden ${!code.isActive ? 'opacity-60 grayscale' : 'hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5'}`}
                    >
                        <div className="flex items-start justify-between mb-8">
                            <div className="h-16 w-16 rounded-[24px] bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl shadow-inner">
                                ⚡
                            </div>
                            {isBrokerageAdmin && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingId(code.id); setFormData(code); setShowModal(true); }}
                                        className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(code.id)}
                                        className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{code.shortcodeName}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target: {code.websiteId}</p>
                        </div>

                        <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            {code.filters.city && <div className="text-xs font-medium text-slate-700">City: <span className="font-bold">{code.filters.city}</span></div>}
                            {code.filters.propertyType && <div className="text-xs font-medium text-slate-700">Type: <span className="font-bold">{code.filters.propertyType}</span></div>}
                            {code.filters.minPrice && <div className="text-xs font-medium text-slate-700">Min Price: <span className="font-bold">${code.filters.minPrice.toLocaleString()}</span></div>}
                            {code.filters.maxPrice && <div className="text-xs font-medium text-slate-700">Max Price: <span className="font-bold">${code.filters.maxPrice.toLocaleString()}</span></div>}
                            <div className="text-xs font-medium text-slate-700">Limit: <span className="font-bold">{code.limit} items</span></div>
                        </div>

                        <div className="text-[10px] font-mono text-indigo-600 bg-indigo-50 p-3 rounded-xl break-all">
                            [listings config="{code.shortcodeName}"]
                        </div>

                        {isBrokerageAdmin && (
                            <button
                                onClick={() => handleToggleStatus(code.id)}
                                className={`w-full mt-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${code.isActive ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            >
                                {code.isActive ? 'Disable Shortcode' : 'Enable Shortcode'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Creation/Edit Modal */}
            {isBrokerageAdmin && showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-[48px] p-12 w-full max-w-2xl space-y-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                                {editingId ? 'Edit' : 'Create'} Shortcode
                            </h3>
                            <p className="text-slate-500 text-sm">Configure parameters for agent-facing grid embeds.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <label className="block space-y-2 col-span-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Shortcode Name Identifier</span>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. featuredHomes"
                                    value={formData.shortcodeName}
                                    onChange={e => setFormData({ ...formData, shortcodeName: e.target.value.replace(/\s+/g, '') })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none"
                                />
                            </label>

                            <label className="block space-y-2 col-span-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Target Agent Website ID</span>
                                <select
                                    value={formData.websiteId}
                                    onChange={e => setFormData({ ...formData, websiteId: e.target.value })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none"
                                >
                                    <option value="website_sarah">Sarah Jenkins</option>
                                    <option value="website_michael">Michael Chen</option>
                                    <option value="website_global">All Agents (Global)</option>
                                </select>
                            </label>

                            <h4 className="col-span-2 text-sm font-black text-slate-900 mt-4 pt-4 border-t border-slate-100">Filter Overrides</h4>

                            <label className="block space-y-2 mt-0">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">City Filter</span>
                                <input
                                    type="text"
                                    placeholder="e.g. Toronto"
                                    value={formData.filters.city || ''}
                                    onChange={e => setFormData({ ...formData, filters: { ...formData.filters, city: e.target.value || undefined } })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none"
                                />
                            </label>

                            <label className="block space-y-2 mt-0">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Property Type</span>
                                <select
                                    value={(formData.filters.propertyType as string) || ''}
                                    onChange={e => setFormData({ ...formData, filters: { ...formData.filters, propertyType: e.target.value || undefined } })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none"
                                >
                                    <option value="">Any Type</option>
                                    <option value="Detached">Detached</option>
                                    <option value="Semi-Detached">Semi-Detached</option>
                                    <option value="Townhouse">Townhouse</option>
                                    <option value="Condo">Condo</option>
                                </select>
                            </label>

                            <label className="block space-y-2 mt-0">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Min Price</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={formData.filters.minPrice || ''}
                                    onChange={e => setFormData({ ...formData, filters: { ...formData.filters, minPrice: Number(e.target.value) || undefined } })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none"
                                />
                            </label>

                            <label className="block space-y-2 mt-0">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Max Price</span>
                                <input
                                    type="number"
                                    placeholder="1000000"
                                    value={formData.filters.maxPrice || ''}
                                    onChange={e => setFormData({ ...formData, filters: { ...formData.filters, maxPrice: Number(e.target.value) || undefined } })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none"
                                />
                            </label>

                            <label className="block space-y-2 mt-0">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Grid Limit</span>
                                <input
                                    type="number"
                                    value={formData.limit}
                                    onChange={e => setFormData({ ...formData, limit: Number(e.target.value) || 1 })}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none"
                                />
                            </label>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700"
                            >
                                {editingId ? 'Update Config' : 'Save Config'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
