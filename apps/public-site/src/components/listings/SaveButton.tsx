'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@repo/auth';
import { savedListingsService } from '@repo/services';

interface SaveButtonProps {
    listingId: string;
    variant?: 'icon' | 'full';
    className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ listingId, variant = 'icon', className = '' }) => {
    const { user, isAuthenticated } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            setIsSaved(savedListingsService.isListingSaved(user.id, listingId));
        }
    }, [isAuthenticated, user, listingId]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated || !user) {
            // In a real app, logic to show login modal
            alert('Please login to save listings');
            return;
        }

        setIsLoading(true);
        try {
            if (isSaved) {
                await savedListingsService.removeSavedListing(user.id, listingId);
                setIsSaved(false);
            } else {
                await savedListingsService.saveListing(user.id, listingId);
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Failed to update saved listing:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'full') {
        return (
            <button
                onClick={handleToggleSave}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isSaved
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-white text-slate-900 border border-slate-200 hover:border-rose-200 hover:text-rose-600'
                    } ${className}`}
            >
                <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isSaved ? 'Saved' : 'Save Property'}
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleSave}
            disabled={isLoading}
            className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isSaved ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                } ${className}`}
        >
            <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </button>
    );
};
