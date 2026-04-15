'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ListingSectionConfigForm, ListingPreviewComponent } from '@repo/modules/listing-shortcodes';
import { ShortcodeConfig } from '@repo/types';
import { getOrganizationById } from '@repo/services';

export default function OrgShortcodesPage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.orgId as string;
    const [shortcodes, setShortcodes] = useState<ShortcodeConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShortcode, setEditingShortcode] = useState<ShortcodeConfig | null>(null);
    const [organization, setOrganization] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const org = await getOrganizationById(orgId);
            setOrganization(org);

            // In a real app, we'd fetch shortcodes for this org
            // For now, we use mock data specific to this org
            setShortcodes([
                {
                    id: 'sc_1',
                    organizationId: orgId,
                    websiteId: `ws_${orgId}`,
                    createdByRole: 'super_admin',
                    shortcodeName: 'featuredListings',
                    filters: { city: 'Toronto', minPrice: 500000 },
                    limit: 6,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ]);
            setLoading(false);
        })();
    }, [orgId]);

    const handleSave = (data: Partial<ShortcodeConfig>) => {
        if (editingShortcode) {
            setShortcodes(shortcodes.map(s => s.id === editingShortcode.id ? { ...s, ...data } as ShortcodeConfig : s));
        } else {
            const newShortcode: ShortcodeConfig = {
                id: `sc_${Math.random().toString(36).substr(2, 9)}`,
                organizationId: orgId,
                websiteId: `ws_${orgId}`,
                createdByRole: 'super_admin',
                shortcodeName: data.shortcodeName || 'newListings',
                filters: data.filters || {},
                limit: data.limit || 10,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...data
            } as ShortcodeConfig;
            setShortcodes([...shortcodes, newShortcode]);
        }
        setShowModal(false);
        setEditingShortcode(null);
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Shortcode Configuration
                    </h1>
                    <p className="text-slate-500 font-medium">Manage listing queries for {organization?.name || 'Brokerage'}</p>
                </div>
                <button
                    onClick={() => { setEditingShortcode(null); setShowModal(true); }}
                    className="ml-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    Add Shortcode
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortcodes.map(sc => (
                    <div key={sc.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">⚡</div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingShortcode(sc); setShowModal(true); }} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button onClick={() => setShortcodes(shortcodes.filter(s => s.id !== sc.id))} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{sc.shortcodeName}</h3>
                        <div className="text-[10px] font-mono text-indigo-600 bg-indigo-50 p-2 rounded-lg mb-4 break-all">
                            [listings config="{sc.shortcodeName}"]
                        </div>
                        <div className="space-y-2 py-4 border-t border-slate-50">
                            {sc.filters.city && <p className="text-xs text-slate-500 font-medium">City: <span className="text-slate-900 font-bold">{sc.filters.city}</span></p>}
                            <p className="text-xs text-slate-500 font-medium">Limit: <span className="text-slate-900 font-bold">{sc.limit}</span></p>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[48px] p-12 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <ListingSectionConfigForm
                            initialData={editingShortcode || {}}
                            onSave={handleSave}
                            onCancel={() => setShowModal(false)}
                            title={editingShortcode ? 'Edit Shortcode' : 'Create Shortcode'}
                        />
                        <div className="hidden md:block">
                            <ListingPreviewComponent
                                filters={editingShortcode?.filters || {}}
                                limit={editingShortcode?.limit || 10}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
