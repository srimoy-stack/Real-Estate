import { InternalListingStatus, ListingLead } from '@repo/types';
import { mlsListingService, MLSListing } from './mls';

export interface ListingQueryParams {
    mlsId?: string;
    ids?: string[];
    city?: string;
    propertyType?: string | string[];
    status?: InternalListingStatus | InternalListingStatus[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    featured?: boolean;
    organizationId?: string;
    keyword?: string;
    limit?: number;
    page?: number;
    sort?: 'latest' | 'price_asc' | 'price_desc';
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
}

export type ListingCardField = Pick<
    MLSListing,
    | 'mlsNumber'
    | 'address'
    | 'city'
    | 'province'
    | 'price'
    | 'bedrooms'
    | 'bathrooms'
    | 'squareFootage'
    | 'status'
    | 'propertyType'
    | 'images'
    | 'isFeatured'
    | 'createdAt'
    | 'description'
    | 'location'
    | 'agentName'
> & { id: string; latitude: number; longitude: number }; // Keep legacy fields for compatibility

export interface ListingQueryResponse {
    listings: ListingCardField[];
    totalCount: number;
}

const leadStore: ListingLead[] = [];

export class ListingQueryApi {
    private cache: Map<string, { data: any, expiry: number }> = new Map();
    private pendingQueries: Map<string, Promise<any>> = new Map();
    public cacheDurationMs = 5 * 60 * 1000; // 5 minutes default

    constructor() { }

    /**
     * Clear all cached query results.
     */
    public clearCache() {
        this.cache.clear();
        this.pendingQueries.clear();
        console.log('[ListingQueryApi] Cache cleared.');
    }

    /**
     * Get full listing by MLS Number
     */
    public async getListingByMlsId(mlsId: string): Promise<any | null> {
        return await mlsListingService.getListingByMLS(mlsId);
    }

    /**
     * Get related listings.
     */
    public async getRelatedListings(
        listing: any,
        limit: number = 3
    ): Promise<any[]> {
        return await mlsListingService.getRelatedListings(listing.mlsNumber, limit);
    }

    /**
     * Submit a lead/inquiry
     */
    public async submitListingLead(data: Omit<ListingLead, 'id' | 'createdAt'>): Promise<ListingLead> {
        const lead: ListingLead = {
            ...data,
            id: `lead_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        leadStore.push(lead);
        console.log('[ListingQueryApi] Lead captured:', lead.id, '→', lead.mlsNumber);
        return lead;
    }

    /**
     * Main Query API Method
     */
    public async searchListings(params: ListingQueryParams): Promise<ListingQueryResponse> {
        const cacheKey = JSON.stringify(params);
        const cached = this.cache.get(cacheKey);

        if (cached && cached.expiry > Date.now()) {
            return cached.data as ListingQueryResponse;
        }

        if (this.pendingQueries.has(cacheKey)) {
            return this.pendingQueries.get(cacheKey);
        }

        const fetchPromise = (async () => {
            const { listings, totalCount } = await mlsListingService.getListings({
                city: params.city,
                propertyType: params.propertyType as any,
                status: params.status as any,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
                bedrooms: params.bedrooms,
                bathrooms: params.bathrooms,
                featured: params.featured,
                organizationId: params.organizationId,
                keyword: params.keyword,
                limit: params.limit,
                page: params.page,
                sort: params.sort === 'latest' ? 'newest' : params.sort as any,
                minLat: params.minLat,
                maxLat: params.maxLat,
                minLng: params.minLng,
                maxLng: params.maxLng
            });

            // Map to compatible format for existing UI
            const compatibleListings = listings.map(l => ({
                ...l,
                id: l.mlsNumber, // Use MLS as ID for consistency
                latitude: l.location.lat,
                longitude: l.location.lng
            }));

            const response: ListingQueryResponse = {
                listings: compatibleListings as any,
                totalCount
            };

            this.cache.set(cacheKey, { data: response, expiry: Date.now() + this.cacheDurationMs });
            this.pendingQueries.delete(cacheKey);

            return response;
        })();

        this.pendingQueries.set(cacheKey, fetchPromise);
        return fetchPromise;
    }
}

export const listingQueryApi = new ListingQueryApi();

