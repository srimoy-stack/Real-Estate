import { mockListings } from '../mock/listingsMock';
import { Listing, PropertyType } from '@repo/types';

export interface SearchFilters {
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    baths?: number;
    city?: string;
    propertyType?: PropertyType;
}

export const searchService = {
    searchListings: async (filters: SearchFilters = {}): Promise<Listing[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let filtered = [...mockListings];

        if (filters.city) {
            filtered = filtered.filter(l => l.city.toLowerCase() === filters.city?.toLowerCase());
        }
        if (filters.propertyType) {
            filtered = filtered.filter(l => l.propertyType === filters.propertyType);
        }
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(l => l.price >= (filters.minPrice || 0));
        }
        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(l => l.price <= (filters.maxPrice || Infinity));
        }
        if (filters.beds !== undefined) {
            filtered = filtered.filter(l => l.bedrooms >= (filters.beds || 0));
        }
        if (filters.baths !== undefined) {
            filtered = filtered.filter(l => l.bathrooms >= (filters.baths || 0));
        }

        return filtered;
    }
};
