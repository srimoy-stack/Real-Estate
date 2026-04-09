import { SavedListing, SavedSearch, ListingFilters } from '@repo/types';

// In-memory cache to prevent infinite loops and request flooding
const savedListingsCache: Record<string, { data: SavedListing[], timestamp: number } | undefined> = {};
const pendingRequests: Record<string, Promise<SavedListing[]> | undefined> = {};
const CACHE_TTL = 3000; // 3 seconds is enough to prevent scroll-based flooding

export const userSavedItemService = {
    // Saved Listings
    getSavedListings: async (userId: string): Promise<SavedListing[]> => {
        if (!userId) return [];

        // Check if there is an active request for this user
        if (pendingRequests[userId]) return pendingRequests[userId];

        // Check cache
        const cached = savedListingsCache[userId];
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        // Create new request
        const fetchPromise = (async () => {
            try {
                const res = await fetch(`/api/account/saved-listings?userId=${userId}`);
                if (!res.ok) throw new Error('Failed to fetch saved listings');
                const data = await res.json();
                
                // Update cache
                savedListingsCache[userId] = { data, timestamp: Date.now() };
                return data;
            } catch (error) {
                console.error('userSavedItemService.getSavedListings error:', error);
                return [];
            } finally {
                // Cleanup pending request
                delete pendingRequests[userId];
            }
        })();

        pendingRequests[userId] = fetchPromise;
        return fetchPromise;
    },

    saveListing: async (userId: string, listingId: string): Promise<SavedListing | null> => {
        try {
            // Invalidate cache on change
            delete savedListingsCache[userId];
            
            const res = await fetch('/api/account/saved-listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, listingId })
            });
            if (!res.ok) throw new Error('Failed to save listing');
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    removeSavedListing: async (userId: string, listingId: string): Promise<void> => {
        try {
            // Invalidate cache on change
            delete savedListingsCache[userId];

            const res = await fetch(`/api/account/saved-listings?userId=${userId}&listingId=${listingId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to remove listing');
        } catch (error) {
            console.error(error);
        }
    },

    isListingSaved: async (userId: string, listingId: string): Promise<boolean> => {
        if (!userId || !listingId) return false;
        const saved = await userSavedItemService.getSavedListings(userId);
        return saved.some(sl => sl.listingId === listingId);
    },

    // Saved Searches
    getSavedSearches: async (_userId: string): Promise<SavedSearch[]> => {
        // Mocking searches for now, but following the pattern
        return [];
    },

    saveSearch: async (_userId: string, _name: string, _filters: ListingFilters): Promise<SavedSearch | null> => {
        return null;
    },

    removeSavedSearch: async (_id: string): Promise<void> => {
    },

    // Internal helper for notifications
    getAllSavedSearches: (): SavedSearch[] => {
        return [];
    }
};
