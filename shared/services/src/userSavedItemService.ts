import { SavedListing, SavedSearch, ListingFilters } from '@repo/types';

// Mock DB
let savedListings: SavedListing[] = [
    { id: 'sl-1', userId: 'user-1', listingId: 'premium-property-3', createdAt: new Date().toISOString() }
];

let savedSearches: SavedSearch[] = [
    {
        id: 'ss-1',
        userId: 'user-1',
        name: 'Toronto Condos Under 1M',
        filters: { city: 'Toronto', maxPrice: 1000000, page: 1, limit: 10 },
        createdAt: new Date().toISOString()
    }
];

export const userSavedItemService = {
    // Saved Listings
    getSavedListings: async (userId: string): Promise<SavedListing[]> => {
        return savedListings.filter(sl => sl.userId === userId);
    },

    saveListing: async (userId: string, listingId: string): Promise<SavedListing> => {
        const existing = savedListings.find(sl => sl.userId === userId && sl.listingId === listingId);
        if (existing) return existing;

        const newSaved: SavedListing = {
            id: `sl-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            listingId,
            createdAt: new Date().toISOString()
        };
        savedListings.push(newSaved);
        return newSaved;
    },

    removeSavedListing: async (userId: string, listingId: string): Promise<void> => {
        savedListings = savedListings.filter(sl => !(sl.userId === userId && sl.listingId === listingId));
    },

    isListingSaved: async (userId: string, listingId: string): Promise<boolean> => {
        return savedListings.some(sl => sl.userId === userId && sl.listingId === listingId);
    },

    // Saved Searches
    getSavedSearches: async (userId: string): Promise<SavedSearch[]> => {
        return savedSearches.filter(ss => ss.userId === userId);
    },

    saveSearch: async (userId: string, name: string, filters: ListingFilters): Promise<SavedSearch> => {
        const newSearch: SavedSearch = {
            id: `ss-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            name,
            filters,
            createdAt: new Date().toISOString()
        };
        savedSearches.push(newSearch);
        return newSearch;
    },

    removeSavedSearch: async (id: string): Promise<void> => {
        savedSearches = savedSearches.filter(ss => ss.id !== id);
    },

    // Internal helper for notifications
    getAllSavedSearches: (): SavedSearch[] => {
        return savedSearches;
    }
};
