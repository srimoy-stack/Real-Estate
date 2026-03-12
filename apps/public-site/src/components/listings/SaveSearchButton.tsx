'use client';

import React, { useState } from 'react';
import { useAuth } from '@repo/auth';
import { userSavedItemService } from '@repo/services';
import { ListingFilters } from '@repo/types';

interface SaveSearchButtonProps {
    filters: ListingFilters;
}

export const SaveSearchButton = ({ filters }: SaveSearchButtonProps) => {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveSearch = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }

        setIsLoading(true);
        try {
            const searchName = filters.city
                ? `${filters.city} ${filters.propertyType || ''} Search`
                : 'Custom Property Search';

            await userSavedItemService.saveSearch(user.id, searchName, filters);
            setIsSaved(true);
        } catch (error) {
            console.error('Failed to save search', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 p-6 bg-slate-900 rounded-[32px] text-white overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <h3 className="text-lg font-black italic mb-2">Save this <span className="text-amber-500">search</span></h3>
            <p className="text-xs text-slate-400 font-medium mb-6">Be the first to know when new matching properties hit the market.</p>
            <button
                onClick={handleSaveSearch}
                disabled={isLoading || isSaved}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${isSaved
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-slate-900 hover:bg-amber-500 hover:text-white shadow-xl shadow-slate-900'
                    }`}
            >
                {isLoading ? 'Saving...' : isSaved ? 'Search Saved ✓' : 'Enable Alerts'}
            </button>
        </div>
    );
}
