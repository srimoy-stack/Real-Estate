import { Listing, ListingSortOrder, ListingSectionFilters, PaginatedResponse, ListingStatus, PropertyType } from '@repo/types';
import { mlsListingService, MLSListing, MLSListingCard } from './mls';

/**
 * Maps the new MLSListing model to the legacy Listing interface for UI compatibility.
 */
function mapToLegacyListing(l: MLSListing | MLSListingCard): Listing {
    // Map Status
    let status = ListingStatus.ACTIVE;
    if (l.status === 'Sold') status = ListingStatus.SOLD;
    if (l.status === 'Pending') status = ListingStatus.PENDING;
    if (l.status === 'Removed') status = ListingStatus.OFF_MARKET;

    // Map Property Type
    let type = PropertyType.DETACHED;
    if (l.propertyType === 'Condo') type = PropertyType.CONDO;
    if (l.propertyType === 'Semi-Detached') type = PropertyType.SEMI_DETACHED;
    if (l.propertyType === 'Townhouse') type = PropertyType.TOWNHOUSE;
    if (l.propertyType === 'Land') type = PropertyType.LAND;
    if (l.propertyType === 'Commercial') type = PropertyType.COMMERCIAL;

    return {
        id: l.mlsNumber,
        organizationId: (l as MLSListing).organizationId || 'org-1',
        mlsNumber: l.mlsNumber,
        slug: l.mlsNumber,
        title: `${l.bedrooms} Bed ${l.propertyType} in ${l.city}`,
        description: l.description,
        price: l.price,
        currency: 'CAD',
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        squareFootage: l.squareFootage,
        propertyType: type,
        status: status,
        isFeatured: l.isFeatured,
        address: l.address,
        city: l.city,
        province: l.province,
        postalCode: l.postalCode || '',
        latitude: l.location.lat,
        longitude: l.location.lng,
        location: l.location,
        agentName: l.agentName,
        images: l.images,
        mainImage: l.images[0] || '',
        features: (l as MLSListing).features || [],
        amenities: (l as MLSListing).amenities || [],
        createdAt: l.createdAt,
        updatedAt: (l as MLSListing).updatedAt || l.createdAt,
    };
}

export const listingService = {
    search: async (filters: any): Promise<PaginatedResponse<Listing>> => {
        const { listings, totalCount } = await mlsListingService.getListings({
            ...filters,
            sort: filters.sort === 'latest' ? 'newest' : filters.sort
        });
        const limit = filters.limit || 12;
        return {
            success: true,
            data: listings.map(mapToLegacyListing),
            pagination: {
                page: filters.page || 1,
                pageSize: limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    },

    getById: async (id: string): Promise<Listing | null> => {
        const listing = await mlsListingService.getListingByMLS(id);
        return listing ? mapToLegacyListing(listing) : null;
    },

    getByMLS: async (mlsNumber: string): Promise<Listing | null> => {
        const listing = await mlsListingService.getListingByMLS(mlsNumber);
        return listing ? mapToLegacyListing(listing) : null;
    },

    /**
     * Fetch listings based on ListingSectionConfig filters.
     */
    getBySectionConfig: async (filters: ListingSectionFilters, limit: number, sort: ListingSortOrder): Promise<Listing[]> => {
        const { listings } = await mlsListingService.getListings({
            city: filters.city,
            propertyType: filters.propertyType as any,
            status: filters.status as any,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            bedrooms: filters.bedrooms,
            bathrooms: filters.bathrooms,
            limit: limit,
            sort: sort === 'latest' ? 'newest' : (sort as any)
        });
        return listings.map(mapToLegacyListing);
    },

    getRelatedListings: async (listing: any, limit: number = 3): Promise<Listing[]> => {
        const listings = await mlsListingService.getRelatedListings(listing.mlsNumber, limit);
        return listings.map(mapToLegacyListing);
    },

    submitLead: async (listingId: string, leadData: any) => {
        // Dynamic imports for services that might use Zustand or involve large trees
        const { leadService } = await import('./leadService');
        const { useNotificationStore } = await import('./notificationStore');

        try {
            await leadService.createLead({
                name: leadData.name,
                email: leadData.email,
                phone: leadData.phone,
                message: leadData.message,
                source: leadData.source || 'listing_page',
                mlsNumber: listingId,
                websiteId: 'ws-1' // Default mock website
            });

            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Inquiry Sent',
                message: 'Your message has been delivered to the agent.'
            });

            return { success: true };
        } catch (error) {
            console.error('Lead submission failed:', error);
            return { success: false, error: 'Failed to submit inquiry' };
        }
    }
};


