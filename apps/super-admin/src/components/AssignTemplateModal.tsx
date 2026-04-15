'use client';

import React, { useState, useEffect } from 'react';
import { getOrganizations, OrganizationDashboardItem as Organization, assignTemplateToTenant } from '@repo/services';
import type { Template } from '@repo/types';

interface AssignTemplateModalProps {
    template: Template;
    onClose: () => void;
    onSuccess: () => void;
}

export function AssignTemplateModal({ template, onClose, onSuccess }: AssignTemplateModalProps) {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingOrgs, setFetchingOrgs] = useState(true);

    useEffect(() => {
        async function fetchOrgs() {
            try {
                const res = await getOrganizations({ page: 1, limit: 100 });
                setOrganizations(res.items);
            } catch (err) {
                console.error('Failed to fetch orgs', err);
            } finally {
                setFetchingOrgs(false);
            }
        }
        fetchOrgs();
    }, []);

    const handleAssign = async () => {
        if (!selectedOrgId) return;
        setLoading(true);
        try {
            await assignTemplateToTenant(selectedOrgId, template.templateKey, 'super-admin');
            onSuccess();
        } catch (err) {
            console.error('Failed to assign template', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 bg-gradient-to-br from-slate-50 to-white">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        Assign <span className="text-indigo-600">{template.templateName}</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Link this template to a brokerage to make it available in their portal.</p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Brokerage</label>
                        {fetchingOrgs ? (
                            <div className="h-14 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
                        ) : (
                            <select
                                className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                                value={selectedOrgId}
                                onChange={(e) => setSelectedOrgId(e.target.value)}
                            >
                                <option value="">Choose a brokerage...</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
                        <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[11px] text-indigo-700 font-bold leading-relaxed">
                            Once assigned, the client admin will be able to see this template in their "Available Templates" page.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading || !selectedOrgId}
                        className={`flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${loading || !selectedOrgId ? 'opacity-50 grayscale' : 'hover:bg-indigo-500 hover:scale-[1.02] shadow-indigo-200'}`}
                    >
                        {loading ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                </div>
            </div>
        </div>
    );
}
