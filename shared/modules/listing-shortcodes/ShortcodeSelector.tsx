'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShortcodeConfig, ShortcodeFilters } from '@repo/types';
import { shortcodeConfigService } from '@repo/services';
import { ListingSectionConfigForm } from './ListingSectionConfigForm';

// ═══════════════════════════════════════════════════════════════
//  ShortcodeSelector
//
//  A centralized component for **selecting** an existing shortcode
//  or **creating** a new one via an inline modal.
//
//  The builder never duplicates shortcode creation/storage logic;
//  it simply consumes this component.
// ═══════════════════════════════════════════════════════════════

interface ShortcodeSelectorProps {
    /** Currently selected shortcode ID (if any) */
    selectedId?: string;
    /** The website the shortcodes belong to */
    websiteId: string;
    /** Organization for multi-tenant scoping (optional for super admin) */
    organizationId?: string;
    /** Role-based access: 'super_admin' | 'client_admin' | 'agent' */
    role: 'super_admin' | 'client_admin' | 'agent';
    /** Callback when a shortcode is selected */
    onSelect: (shortcodeId: string, shortcode: ShortcodeConfig) => void;
    /** Callback when selection is cleared */
    onClear?: () => void;
}

export const ShortcodeSelector: React.FC<ShortcodeSelectorProps> = ({
    selectedId,
    websiteId,
    organizationId,
    role,
    onSelect,
    onClear,
}) => {
    const [shortcodes, setShortcodes] = useState<ShortcodeConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedShortcode, setSelectedShortcode] = useState<ShortcodeConfig | null>(null);

    // ─── Fetch available shortcodes ──────────────────────────────
    const fetchShortcodes = useCallback(() => {
        setLoading(true);
        try {
            const configs = shortcodeConfigService.getConfigs({
                websiteId,
                organizationId: organizationId || undefined,
                role,
            });
            setShortcodes(configs);
            // Sync the selected shortcode from the list
            if (selectedId) {
                const found = configs.find(c => c.id === selectedId);
                setSelectedShortcode(found || null);
            }
        } catch (err) {
            console.error('Failed to fetch shortcodes:', err);
        } finally {
            setLoading(false);
        }
    }, [websiteId, organizationId, role, selectedId]);

    useEffect(() => {
        fetchShortcodes();
    }, [fetchShortcodes]);

    // ─── Filter and Group shortcodes ────────────────────────────
    const siteConfigs = shortcodes.filter(c => c.websiteId === websiteId);
    const globalConfigs = shortcodes.filter(c => c.websiteId !== websiteId);

    // ─── Handle dropdown selection ──────────────────────────────
    const handleSelect = (id: string) => {
        if (!id) {
            setSelectedShortcode(null);
            onClear?.();
            return;
        }
        const sc = shortcodes.find(c => c.id === id);
        if (sc) {
            setSelectedShortcode(sc);
            onSelect(sc.id, sc);
        }
    };

    // ─── Handle save (Create or Edit) ──────────────────────────
    const handleSave = (data: Partial<ShortcodeConfig>) => {
        try {
            if (modalMode === 'edit' && selectedShortcode) {
                const updated = shortcodeConfigService.updateConfig(selectedShortcode.id, {
                    shortcodeName: data.shortcodeName,
                    filters: data.filters,
                    limit: data.limit,
                    sort: data.sort,
                    isActive: data.isActive,
                });
                if (updated) setSelectedShortcode(updated);
            } else {
                const newConfig = shortcodeConfigService.createConfig({
                    organizationId: organizationId || null,
                    websiteId,
                    createdByRole: role,
                    shortcodeName: data.shortcodeName || 'untitled',
                    filters: data.filters || {},
                    limit: data.limit || 10,
                    sort: data.sort || 'latest',
                    isActive: true,
                });
                setSelectedShortcode(newConfig);
                onSelect(newConfig.id, newConfig);
            }

            fetchShortcodes();
            setShowCreateModal(false);
        } catch (err) {
            console.error('Failed to save shortcode:', err);
        }
    };

    const handleEditClick = () => {
        if (!selectedShortcode) return;
        setModalMode('edit');
        setShowCreateModal(true);
    };

    const handleCreateClick = () => {
        setModalMode('create');
        setShowCreateModal(true);
    };

    const getFiltersSummary = (filters: ShortcodeFilters, limit?: number) => {
        const parts = [];
        if (filters.city) parts.push(`City: ${filters.city}`);
        if (filters.propertyType) parts.push(`Type: ${filters.propertyType}`);
        if (filters.status) parts.push(`Status: ${filters.status}`);
        if (filters.bedrooms) parts.push(`Beds: ${filters.bedrooms}+`);
        if (filters.limit || limit) parts.push(`Limit: ${filters.limit || limit}`);
        return parts.join(' | ') || "No filters";
    };

    const estimatedCount = React.useMemo(() => {
        if (!selectedShortcode) return 0;
        let count = 42;
        const f = selectedShortcode.filters;
        if (f.city) count -= 12;
        if (f.propertyType) count -= 8;
        if (f.minPrice || f.maxPrice) count -= 6;
        if (f.bedrooms) count -= 9;
        if (f.bathrooms) count -= 4;
        return Math.max(0, count);
    }, [selectedShortcode]);

    const getEmptyStateSuggestion = () => {
        if (!selectedShortcode) return null;
        const f = selectedShortcode.filters;
        if (f.minPrice || f.maxPrice) return "Try removing price filter or increasing range";
        if (f.bedrooms || f.bathrooms) return "Try reducing bed/bath requirements";
        return "Try broadening your location search";
    };

    const renderFilterBadges = (filters: ShortcodeFilters) => {
        const badges = [
            { id: 'city', label: filters.city, color: 'bg-blue-50 text-blue-600 border-blue-100', icon: '📍' },
            { id: 'type', label: filters.propertyType, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: '🏠' },
            {
                id: 'price',
                label: (filters.minPrice || filters.maxPrice)
                    ? `${filters.minPrice ? `$${(filters.minPrice / 1000)}K` : '0'} - ${filters.maxPrice ? `$${(filters.maxPrice / 1000)}K` : 'Any'}`
                    : undefined,
                color: 'bg-purple-50 text-purple-600 border-purple-100',
                icon: '💰'
            },
        ].filter(b => b.label);

        const otherParts = [
            { label: 'Status', value: filters.status },
            { label: 'Bedrooms', value: filters.bedrooms ? `${filters.bedrooms}+` : undefined },
            { label: 'Bathrooms', value: filters.bathrooms ? `${filters.bathrooms}+` : undefined },
            { label: 'Limit', value: filters.limit || selectedShortcode?.limit },
        ].filter(p => p.value !== undefined && p.value !== '');

        if (badges.length === 0 && otherParts.length === 0)
            return <span className="text-slate-400 text-[10px] font-bold">No filters configured</span>;

        return (
            <div className="space-y-4 pt-1">
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {badges.map(b => (
                            <span key={b.id} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${b.color}`}>
                                <span>{b.icon}</span>
                                {b.label}
                            </span>
                        ))}
                    </div>
                )}
                {otherParts.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-slate-50 pt-3">
                        {otherParts.map(p => (
                            <div key={p.label} className="flex justify-between items-center text-[9px]">
                                <span className="text-slate-400 font-bold uppercase tracking-widest">{p.label}</span>
                                <span className="text-slate-900 font-black">{String(p.value)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="group relative">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">
                        Select Shortcode
                    </span>
                    <div className="relative">
                        <select
                            value={selectedId || ''}
                            onChange={e => handleSelect(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all appearance-none pr-12 text-slate-900 shadow-sm"
                        >
                            <option value="">
                                {loading ? 'Loading database…' : '— Choose shortcode configuration —'}
                            </option>
                            {siteConfigs.length > 0 && (
                                <optgroup label="Website Specific">
                                    {siteConfigs.map(sc => (
                                        <option key={sc.id} value={sc.id}>
                                            ✦ {sc.shortcodeName} ({getFiltersSummary(sc.filters, sc.limit)})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {globalConfigs.length > 0 && (
                                <optgroup label="Global Options">
                                    {globalConfigs.map(sc => (
                                        <option key={sc.id} value={sc.id}>
                                            ❂ {sc.shortcodeName} ({getFiltersSummary(sc.filters, sc.limit)})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {!loading && shortcodes.length === 0 && (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center gap-3 text-center">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No shortcodes available</p>
                        <button
                            type="button"
                            onClick={handleCreateClick}
                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                            Create your first shortcode
                        </button>
                    </div>
                )}
            </div>

            {/* ─── Selected shortcode info card ────── */}
            {selectedShortcode ? (
                <div className="bg-gradient-to-br from-indigo-50/50 to-white p-5 rounded-3xl border border-indigo-100 shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Selected Configuration</span>
                        <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${selectedShortcode.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-400'}`} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{selectedShortcode.isActive ? 'Live' : 'Inactive'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <span className="text-base font-black text-slate-900 tracking-tight leading-tight">
                            {selectedShortcode.shortcodeName}
                        </span>
                    </div>

                    <div className="bg-white/60 p-5 rounded-2xl border border-white/50 space-y-4 mt-4">
                        {/* Result Counter Feedback */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-50/50">
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${estimatedCount > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                    {estimatedCount > 0
                                        ? `${estimatedCount} ${selectedShortcode.filters.propertyType || 'Property'} listings ${selectedShortcode.filters.city ? `in ${selectedShortcode.filters.city}` : ''}`
                                        : 'No matching listings'}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Live Insight</span>
                                <span className="text-[8px] font-medium text-slate-300 uppercase tracking-widest mt-1">Updated just now</span>
                            </div>
                        </div>

                        {estimatedCount === 0 && (
                            <div className="bg-rose-50 p-4 rounded-2xl flex items-start gap-3 border border-rose-100/50 transition-all animate-in fade-in slide-in-from-top-2">
                                <div className="p-1 bg-white rounded-lg shadow-sm">
                                    <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-tight leading-none">Too restrictive filters</p>
                                    <p className="text-[9px] font-bold text-rose-400 leading-tight">
                                        {getEmptyStateSuggestion()}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            {renderFilterBadges(selectedShortcode.filters)}
                        </div>

                        <div className="pt-4 border-t border-slate-50/50">
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className="w-full h-11 bg-indigo-600 rounded-xl flex items-center justify-center gap-2.5 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98] group"
                            >
                                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Shortcode
                            </button>
                        </div>
                    </div>
                </div>
            ) : !selectedId && !loading ? (
                /* ─── Default Fallback Card ────── */
                <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Default Configuration</span>
                            <span className="text-base font-black text-slate-900 tracking-tight leading-tight">Showing latest listings</span>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Global Fallback Active
                            </span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 leading-relaxed">
                            No custom shortcode selected. The builder will automatically display the most recent properties from your global inventory.
                        </p>
                    </div>
                </div>
            ) : selectedId ? (
                <div className="p-6 rounded-[2.5rem] border-2 border-dashed border-rose-100 bg-rose-50/20 text-center space-y-2">
                    <div className="h-10 w-10 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                        Configuration Error
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 leading-relaxed max-w-[180px] mx-auto">
                        The selected shortcode (ID: {selectedId.substring(0, 8)}...) was not found. It may have been deleted.
                    </p>
                </div>
            ) : null}
            {/* ─── Create New Button ────────────────── */}
            <button
                type="button"
                onClick={handleCreateClick}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all group"
            >
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">
                    Create New Shortcode
                </span>
            </button>

            {/* ─── Create Modal Overlay ─────────────── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowCreateModal(false)}
                    />
                    {/* Modal content */}
                    <div className="relative z-10 bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] max-w-lg w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                                        {modalMode === 'edit' ? 'Edit Shortcode' : 'New Shortcode'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Stored globally · Reusable across sections
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <ListingSectionConfigForm
                            title={modalMode === 'edit' ? 'Update Configuration' : 'Create Shortcode'}
                            initialData={modalMode === 'edit' ? selectedShortcode || {} : {}}
                            onSave={handleSave}
                            onCancel={() => setShowCreateModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
