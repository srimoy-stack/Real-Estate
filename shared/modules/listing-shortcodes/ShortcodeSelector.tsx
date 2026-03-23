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
    const [searchTerm, setSearchTerm] = useState('');
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
    const filteredShortcodes = shortcodes.filter(sc =>
        sc.shortcodeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sc.filters.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const siteConfigs = filteredShortcodes.filter(c => c.websiteId === websiteId);
    const globalConfigs = filteredShortcodes.filter(c => c.websiteId !== websiteId);

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

    // ─── Render summary of selected shortcode's filters ─────────
    const renderFilterBadges = (filters: ShortcodeFilters) => {
        const entries = Object.entries(filters).filter(([, v]) => v !== undefined && v !== '');
        if (entries.length === 0) return <span className="text-slate-400 text-[10px] font-bold">No filters</span>;
        return (
            <div className="flex flex-wrap gap-1.5 mt-2">
                {entries.map(([key, value]) => (
                    <span
                        key={key}
                        className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-md"
                    >
                        {key}: {String(value)}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* ─── Search and Dropdown Container ────────────────── */}
            <div className="space-y-3">
                <div className="group relative">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                        Search and Select Shortcode
                    </span>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search configs..."
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <select
                        value={selectedId || ''}
                        onChange={e => handleSelect(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-slate-100/50 px-4 py-3 text-sm font-black focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none pr-10 text-slate-900 shadow-sm"
                    >
                        <option value="">
                            {loading ? 'Loading database…' : '— Choose shortcode configuration —'}
                        </option>
                        {siteConfigs.length > 0 && (
                            <optgroup label="This Website Only">
                                {siteConfigs.map(sc => (
                                    <option key={sc.id} value={sc.id}>
                                        ✦ {sc.shortcodeName}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                        {globalConfigs.length > 0 && (
                            <optgroup label="Network-wide Shortcodes">
                                {globalConfigs.map(sc => (
                                    <option key={sc.id} value={sc.id}>
                                        ❂ {sc.shortcodeName}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                    {/* Chevron icon */}
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* ─── Selected shortcode info card ────── */}
            {selectedShortcode && (
                <div className="bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-2xl border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <span className="text-xs font-black text-slate-900 tracking-tight">
                                {selectedShortcode.shortcodeName}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full ${selectedShortcode.isActive
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-red-100 text-red-500'
                                }`}>
                                {selectedShortcode.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                        <span>Limit: {selectedShortcode.limit}</span>
                        <span>·</span>
                        <span>Sort: {selectedShortcode.sort || 'latest'}</span>
                    </div>
                    {renderFilterBadges(selectedShortcode.filters)}

                    {/* Edit Button in Card */}
                    <div className="pt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={handleEditClick}
                            className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit Configuration
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Create New Button ────────────────── */}
            <button
                type="button"
                onClick={handleCreateClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all group"
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
