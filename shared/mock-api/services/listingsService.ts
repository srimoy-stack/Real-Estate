import { mockListings } from '../mock/listingsMock';
import { Listing, ListingFilters } from '@repo/types';

export const listingsService = {
    getListings: async (filters: ListingFilters = {}): Promise<{ listings: Listing[], totalCount: number }> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = [...mockListings];

        // Filter by City
        if (filters.city) {
            filtered = filtered.filter(l => l.city.toLowerCase().includes(filters.city!.toLowerCase()));
        }

        // Filter by Property Type
        if (filters.propertyType) {
            const types = Array.isArray(filters.propertyType) ? filters.propertyType : [filters.propertyType];
            filtered = filtered.filter(l => types.includes(l.propertyType));
        }

        // Filter by Status
        if (filters.status) {
            filtered = filtered.filter(l => l.status === filters.status);
        }

        // Filter by Price Range
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(l => l.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(l => l.price <= filters.maxPrice!);
        }

        // Filter by Bedrooms
        if (filters.bedrooms !== undefined) {
            // "3+" logic: if filter is 3, show 3 or more
            filtered = filtered.filter(l => l.bedrooms >= filters.bedrooms!);
        }

        // Filter by Bathrooms
        if (filters.bathrooms !== undefined) {
            filtered = filtered.filter(l => l.bathrooms >= filters.bathrooms!);
        }

        // Filter by Agent Name
        if (filters.agentName) {
            filtered = filtered.filter(l => l.agentName.toLowerCase() === filters.agentName!.toLowerCase());
        }

        // Filter by Keyword (matching title, description, address, or mlsNumber)
        if (filters.keyword) {
            const kw = filters.keyword.toLowerCase();
            filtered = filtered.filter(l =>
                l.title.toLowerCase().includes(kw) ||
                l.description.toLowerCase().includes(kw) ||
                l.address.toLowerCase().includes(kw) ||
                l.mlsNumber.toLowerCase().includes(kw)
            );
        }

        // Sort Results
        if (filters.sort) {
            switch (filters.sort) {
                case 'price_asc':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                default:
                    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    break;
            }
        } else {
            // Default sort by newest
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        const totalCount = filtered.length;

        // Pagination
        const limit = filters.limit || 12;
        const page = filters.page || 1;
        const start = (page - 1) * limit;
        const listings = filtered.slice(start, start + limit);

        return { listings, totalCount };
    },

    getListingByMLS: async (mlsNumber: string): Promise<Listing | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockListings.find(l => l.mlsNumber === mlsNumber) || null;
    }
};
