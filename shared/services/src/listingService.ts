import { Listing, ListingSortOrder, ListingSectionFilters, PaginatedResponse } from '@repo/types';
import { useNotificationStore } from './notificationStore';

// Mock listings based on requested model
const mockListings: Listing[] = [
    {
        id: 'L1',
        mlsNumber: 'X123456',
        agentName: 'John Smith',
        organizationId: 'org-1',
        slug: 'luxury-condo-toronto',
        title: 'Modern Luxury Condo',
        description: 'Stunning 2-bedroom condo in the heart of Toronto. Floor-to-ceiling windows and premium finishes.',
        price: 750000,
        currency: 'CAD',
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1100,
        propertyType: 'CONDO' as any,
        status: 'ACTIVE' as any,
        address: '123 Bay St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5J 2R8',
        mainImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
        images: [],
        features: ['Gym', 'Pool'],
        amenities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'L2',
        mlsNumber: 'X654321',
        agentName: 'Jane Doe',
        organizationId: 'org-1',
        slug: 'detached-house-vancouver',
        title: 'Spacious Family Home',
        description: 'Large detached home in a quiet neighborhood. Perfect for growing families.',
        price: 1850000,
        currency: 'CAD',
        bedrooms: 4,
        bathrooms: 3,
        squareFootage: 2800,
        propertyType: 'DETACHED' as any,
        status: 'ACTIVE' as any,
        address: '456 Oak Ave',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6B 1A1',
        mainImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800',
        images: [],
        features: ['Garden', 'Parking'],
        amenities: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const listingService = {
    search: async (_filters: any): Promise<PaginatedResponse<Listing>> => {
        // Return mock data for now
        return {
            success: true,
            data: mockListings,
            pagination: { page: 1, pageSize: 12, total: 2, totalPages: 1 }
        };
    },

    getById: async (id: string): Promise<Listing | null> => {
        return mockListings.find(l => l.id === id) || null;
    },

    /**
     * Fetch listings based on ListingSectionConfig filters.
     * Bridged to listingQueryApi for rich data and consistent filtering.
     */
    getBySectionConfig: async (filters: ListingSectionFilters, limit: number, sort: ListingSortOrder): Promise<any[]> => {
        const { listingQueryApi } = await import('./listingQueryApi');

        const response = await listingQueryApi.searchListings({
            city: filters.city,
            propertyType: filters.propertyType,
            status: filters.status as any,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            bedrooms: filters.bedrooms,
            bathrooms: filters.bathrooms,
            featured: filters.featured,
            limit: limit,
            sort: sort as any,
        });

        return response.listings;
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
