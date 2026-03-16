'use client';

import React from 'react';
import { ShortcodeFilters } from '@repo/types';

interface ShortcodeFilterSelectorProps {
    filters: ShortcodeFilters;
    onChange: (filters: ShortcodeFilters) => void;
}

export const ShortcodeFilterSelector: React.FC<ShortcodeFilterSelectorProps> = ({ filters, onChange }) => {
    const handleChange = (key: keyof ShortcodeFilters, value: any) => {
        onChange({ ...filters, [key]: value || undefined });
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</span>
                <input
                    type="text"
                    value={filters.city || ''}
                    onChange={e => handleChange('city', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none"
                    placeholder="All Cities"
                />
            </label>

            <label className="block space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Type</span>
                <select
                    value={(filters.propertyType as string) || ''}
                    onChange={e => handleChange('propertyType', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none"
                >
                    <option value="">Any Type</option>
                    <option value="Detached">Detached</option>
                    <option value="Semi-Detached">Semi-Detached</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Condo">Condo</option>
                </select>
            </label>

            <label className="block space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Price</span>
                <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={e => handleChange('minPrice', Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none"
                    placeholder="0"
                />
            </label>

            <label className="block space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Price</span>
                <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={e => handleChange('maxPrice', Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none"
                    placeholder="No Max"
                />
            </label>
        </div>
    );
};
