import {
  Listing,
  ListingSortOrder,
  ListingSectionFilters,
  PaginatedResponse,
  ListingStatus,
  PropertyType,
} from '@repo/types';
import { mlsListingService, MLSListing, MLSListingCard } from './mls';

/**
 * Maps the new MLSListing model to the legacy Listing interface for UI compatibility.
 */
function mapToLegacyListing(l: MLSListing | MLSListingCard): Listing {
  // Map Status — handle various formats from DDF
  let status = ListingStatus.ACTIVE;
  const rawStatus = (l.status ?? '').toString().toLowerCase();
  if (rawStatus.includes('sold')) status = ListingStatus.SOLD;
  else if (rawStatus.includes('pending')) status = ListingStatus.PENDING;
  else if (rawStatus.includes('removed') || rawStatus.includes('off'))
    status = ListingStatus.OFF_MARKET;

  // Map Property Type — handle DDF sub-types
  let type = PropertyType.DETACHED;
  const rawType = (l.propertyType ?? '').toString().toLowerCase();
  if (rawType.includes('condo') || rawType.includes('apartment')) type = PropertyType.CONDO;
  else if (rawType.includes('semi')) type = PropertyType.SEMI_DETACHED;
  else if (rawType.includes('town') || rawType.includes('row')) type = PropertyType.TOWNHOUSE;
  else if (rawType.includes('land') || rawType.includes('vacant')) type = PropertyType.LAND;
  else if (
    rawType.includes('commercial') ||
    rawType.includes('retail') ||
    rawType.includes('office') ||
    rawType.includes('industrial')
  )
    type = PropertyType.COMMERCIAL;

  // Safe images array
  const images = Array.isArray(l.images) ? l.images.filter(Boolean) : [];

  return {
    id: l.mlsNumber || '',
    organizationId: (l as MLSListing).organizationId || 'org-1',
    mlsNumber: l.mlsNumber || '',
    slug: l.mlsNumber || '',
    title: (() => {
      const beds = l.bedrooms;
      const pType = l.propertyType || 'Property';
      const city = l.city || 'Unknown';
      if (beds != null && beds > 0) {
        return `${beds} Bed ${pType} in ${city}`;
      }
      return `${pType} in ${city}`;
    })(),
    description: l.description || '',
    price: l.price ?? 0,
    currency: 'CAD',
    bedrooms: l.bedrooms ?? 0,
    bathrooms: l.bathrooms ?? 0,
    squareFootage: l.squareFootage ?? 0,
    yearBuilt: (l as MLSListing).yearBuilt ?? undefined,
    propertyType: type,
    status: status,
    isFeatured: l.isFeatured ?? false,
    address: l.address || '',
    city: l.city || '',
    province: l.province || '',
    postalCode: l.postalCode || '',
    latitude: l.location?.lat ?? 0,
    longitude: l.location?.lng ?? 0,
    location: l.location || { lat: 0, lng: 0 },
    agentName: l.agentName || '',
    agentPhone: l.agentPhone || undefined,
    agentEmail: l.agentEmail || undefined,
    agentPhoto: l.agentPhoto || undefined,
    brokerageName: l.brokerageName || undefined,
    images,
    mainImage: images[0] || '',
    features: (l as MLSListing).features || [],
    amenities: (l as MLSListing).amenities || [],
    createdAt: l.createdAt || new Date().toISOString(),
    updatedAt: (l as MLSListing).updatedAt || l.createdAt || new Date().toISOString(),
  };
}

export const listingService = {
  search: async (filters: any): Promise<PaginatedResponse<Listing>> => {
    const { listings, totalCount } = await mlsListingService.getListings({
      ...filters,
      sort: filters.sort === 'latest' ? 'newest' : filters.sort,
    });
    const limit = filters.limit || 12;
    return {
      success: true,
      data: listings.map(mapToLegacyListing),
      pagination: {
        page: filters.page || 1,
        pageSize: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
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
  getBySectionConfig: async (
    filters: ListingSectionFilters,
    limit: number,
    sort: ListingSortOrder
  ): Promise<Listing[]> => {
    const { listings } = await mlsListingService.getListings({
      city: filters.city,
      propertyType: filters.propertyType as any,
      status: filters.status as any,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      bedrooms: filters.bedrooms,
      bathrooms: filters.bathrooms,
      featured: filters.featured,
      limit: limit,
      sort: sort === 'latest' ? 'newest' : (sort as any),
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
        websiteId: 'ws-1', // Default mock website
      });

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Inquiry Sent',
        message: 'Your message has been delivered to the agent.',
      });

      return { success: true };
    } catch (error) {
      console.error('Lead submission failed:', error);
      return { success: false, error: 'Failed to submit inquiry' };
    }
  },
};
