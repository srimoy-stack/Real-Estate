import { SavedListing } from '@repo/types';

const STORAGE_KEY = 'skyline_saved_listings';

/**
 * Saved Listings Service
 * manages user's bookmarked properties using localStorage.
 */
export const savedListingsService = {
    /**
     * Save a property for a specific user.
     */
    saveListing: async (userId: string, listingId: string): Promise<void> => {
        if (typeof window === 'undefined') return;

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const exists = saved.some((s: any) => s.userId === userId && s.listingId === listingId);

        if (!exists) {
            const newSaved: SavedListing = {
                id: `sl-${Math.random().toString(36).substr(2, 9)}`,
                userId,
                listingId,
                createdAt: new Date().toISOString()
            };
            saved.push(newSaved);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
            console.log(`[SavedListings] Listing ${listingId} saved for user ${userId}`);
        }
    },

    /**
     * Remove a property from user's bookmarks.
     */
    removeSavedListing: async (userId: string, listingId: string): Promise<void> => {
        if (typeof window === 'undefined') return;

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const filtered = saved.filter((s: any) => !(s.userId === userId && s.listingId === listingId));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        console.log(`[SavedListings] Listing ${listingId} removed for user ${userId}`);
    },

    /**
     * Get all saved listing IDs for a user.
     */
    getSavedListings: async (userId: string): Promise<SavedListing[]> => {
        if (typeof window === 'undefined') return [];

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return saved.filter((s: any) => s.userId === userId);
    },

    /**
     * Synchronous check for UI state (client side).
     */
    isListingSaved: (userId: string, listingId: string): boolean => {
        if (typeof window === 'undefined') return false;

        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return saved.some((s: any) => s.userId === userId && s.listingId === listingId);
    }
};
