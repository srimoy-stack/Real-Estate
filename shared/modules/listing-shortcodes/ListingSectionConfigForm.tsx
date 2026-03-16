'use client';

import React, { useState } from 'react';
import { ShortcodeConfig } from '@repo/types';

interface ListingSectionConfigFormProps {
    initialData?: Partial<ShortcodeConfig>;
    onSave: (data: Partial<ShortcodeConfig>) => void;
    onCancel: () => void;
    title?: string;
}

export const ListingSectionConfigForm: React.FC<ListingSectionConfigFormProps> = ({
    initialData,
    onSave,
    onCancel,
    title = 'Configure Shortcode'
}) => {
    const [formData, setFormData] = useState<Partial<ShortcodeConfig>>({
        shortcodeName: '',
        filters: {},
        limit: 10,
        isActive: true,
        ...initialData
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                    {title}
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
                        value={formData.shortcodeName || ''}
                        onChange={e => setFormData({ ...formData, shortcodeName: e.target.value.replace(/\s+/g, '') })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 outline-none"
                    />
                </label>

                <h4 className="col-span-2 text-sm font-black text-slate-900 mt-4 pt-4 border-t border-slate-100">Filter Overrides</h4>

                <label className="block space-y-2 mt-0">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">City Filter</span>
                    <input
                        type="text"
                        placeholder="e.g. Toronto"
                        value={formData.filters?.city || ''}
                        onChange={e => setFormData({ ...formData, filters: { ...formData.filters, city: e.target.value || undefined } })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500"
                    />
                </label>

                <label className="block space-y-2 mt-0">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Property Type</span>
                    <select
                        value={(formData.filters?.propertyType as string) || ''}
                        onChange={e => setFormData({ ...formData, filters: { ...formData.filters, propertyType: e.target.value || undefined } })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500"
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
                        value={formData.filters?.minPrice || ''}
                        onChange={e => setFormData({ ...formData, filters: { ...formData.filters, minPrice: Number(e.target.value) || undefined } })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500"
                    />
                </label>

                <label className="block space-y-2 mt-0">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Max Price</span>
                    <input
                        type="number"
                        placeholder="1000000"
                        value={formData.filters?.maxPrice || ''}
                        onChange={e => setFormData({ ...formData, filters: { ...formData.filters, maxPrice: Number(e.target.value) || undefined } })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500"
                    />
                </label>

                <label className="block space-y-2 mt-0">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Grid Limit</span>
                    <input
                        type="number"
                        value={formData.limit || 10}
                        onChange={e => setFormData({ ...formData, limit: Number(e.target.value) || 1 })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500"
                    />
                </label>

                <label className="block space-y-2 mt-0">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sort Order</span>
                    <select
                        value={formData.sort || 'latest'}
                        onChange={e => setFormData({ ...formData, sort: e.target.value as any })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-500"
                    >
                        <option value="latest">Latest First</option>
                        <option value="price_asc">Price (Low to High)</option>
                        <option value="price_desc">Price (High to Low)</option>
                    </select>
                </label>
            </div>

            <div className="flex gap-4 pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-bold"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-bold"
                >
                    Save Configuration
                </button>
            </div>
        </form>
    );
};
