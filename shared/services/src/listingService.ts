import { apiClient } from '@repo/api-client';
import { Listing, ListingFilters, PaginatedResponse } from '@repo/types';
import { useNotificationStore } from './notificationStore';

/**
 * Service for managing real estate listings.
 * Optimized for performance and multi-tenant isolation.
 */
export const listingService = {
    /**
     * Search for listings with filters.
     * Note: tenantId must be handled by the middleware (automatically injected by request headers).
     */
    search: async (filters: ListingFilters): Promise<PaginatedResponse<Listing>> => {
        const response = await apiClient.get<PaginatedResponse<Listing>>('/listings/search', {
            params: filters,
        });
        return response.data;
    },

    /**
     * Get a single listing by ID.
     */
    getById: async (id: string): Promise<Listing | null> => {
        try {
            const response = await apiClient.get<Listing>(`/listings/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    /**
     * Submit a lead for a listing.
     */
    submitLead: async (listingId: string, leadData: {
        name: string;
        email: string;
        phone: string;
        message: string;
        source?: string;
        tenantId?: string;
    }) => {
        try {
            const response = await apiClient.post(`/listings/${listingId}/leads`, leadData);
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Lead Captured',
                message: `Thank you, ${leadData.name}. We will contact you shortly.`
            });
            return response;
        } catch (error) {
            useNotificationStore.getState().addNotification({
                type: 'error',
                title: 'Lead Submission Failed',
                message: 'Something went wrong. Please try calling the office directly.'
            });
            throw error;
        }
    }
};
