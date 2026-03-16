import { Listing, ListingSortOrder, ListingSectionFilters, PaginatedResponse } from '@repo/types';
import { useNotificationStore } from './notificationStore';
import { listingsService as mockApi } from '../../mock-api/services/listingsService';

export const listingService = {
    search: async (filters: any): Promise<PaginatedResponse<Listing>> => {
        const { listings, totalCount } = await mockApi.getListings(filters);
        const limit = filters.limit || 12;
        return {
            success: true,
            data: listings,
            pagination: {
                page: filters.page || 1,
                pageSize: limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    },

    getById: async (id: string): Promise<Listing | null> => {
        const { listings } = await mockApi.getListings();
        return listings.find(l => l.id === id) || null;
    },

    getByMLS: async (mlsNumber: string): Promise<Listing | null> => {
        return await mockApi.getListingByMLS(mlsNumber);
    },

    /**
     * Fetch listings based on ListingSectionConfig filters.
     */
    getBySectionConfig: async (filters: ListingSectionFilters, limit: number, _sort: ListingSortOrder): Promise<Listing[]> => {
        const { listings } = await mockApi.getListings({
            city: filters.city,
            propertyType: filters.propertyType as any,
            status: filters.status as any,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            limit: limit
        });
        return listings;
    },

    getRelatedListings: async (listing: Listing, limit: number = 3): Promise<Listing[]> => {
        const { listings } = await mockApi.getListings({
            city: listing.city,
            propertyType: listing.propertyType,
            limit: limit + 1
        });
        return listings.filter(l => l.id !== listing.id).slice(0, limit);
    },

    submitLead: async (_listingId: string, leadData: any) => {
        console.log('Lead submitted:', leadData);
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Inquiry Sent',
            message: 'Your message has been delivered to the agent.'
        });
        return { success: true };
    }
};
