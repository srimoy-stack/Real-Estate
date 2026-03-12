'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@repo/auth';
import { userSavedItemService } from '@repo/services';

interface SaveListingButtonProps {
    mlsNumber: string;
}

export const SaveListingButton = ({ mlsNumber }: SaveListingButtonProps) => {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            userSavedItemService.isListingSaved(user.id, mlsNumber).then(setIsSaved);
        }
    }, [user, mlsNumber]);

    const handleToggleSave = async () => {
        if (!user) {
            window.location.href = '/login';
            return;
        }

        setIsLoading(true);
        try {
            if (isSaved) {
                await userSavedItemService.removeSavedListing(user.id, mlsNumber);
                setIsSaved(false);
            } else {
                await userSavedItemService.saveListing(user.id, mlsNumber);
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Failed to toggle save listing', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            disabled={isLoading}
            className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isSaved
                    ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20'
                    : 'bg-white text-slate-900 border border-slate-200 hover:border-rose-200 hover:bg-rose-50/30'
                }`}
        >
            <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isSaved ? 'Property Saved' : 'Save Property'}
        </button>
    );
}
