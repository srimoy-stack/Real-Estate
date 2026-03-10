import { InternalListing, InternalListingStatus } from '@repo/types';

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
    limit?: number;
    page?: number;
    sort?: 'latest' | 'price_asc' | 'price_desc';
}

export type ListingCardField = Pick<
    InternalListing,
    | 'id'
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
>;

export interface ListingQueryResponse {
    listings: ListingCardField[];
    totalCount: number;
}

export class ListingQueryApi {
    // In a real application, this would be your database connection.
    // We mock it using an in-memory array for demonstration.
    private documentStore: InternalListing[] = [];

    private cache: Map<string, { data: any, expiry: number }> = new Map();
    private pendingQueries: Map<string, Promise<any>> = new Map();
    public cacheDurationMs = 5 * 60 * 1000; // 5 minutes default

    constructor() {
        // Optionally pre-populate or bind to the sync service store.
    }

    // Hydrate the store (e.g. from the sync service)
    public seed(listings: InternalListing[]) {
        this.documentStore = listings;
        this.clearCache();
    }

    /**
     * Clear all cached query results. 
     * Typically called during MLS sync.
     */
    public clearCache() {
        this.cache.clear();
        this.pendingQueries.clear();
        console.log('[ListingQueryApi] Cache cleared.');
    }

    /**
     * Get full listing by MLS Number
     */
    public async getListingByMlsId(mlsId: string): Promise<InternalListing | null> {
        const cacheKey = `mls_${mlsId}`;
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }

        if (this.pendingQueries.has(cacheKey)) {
            return this.pendingQueries.get(cacheKey);
        }

        const fetchPromise = (async () => {
            const listing = this.documentStore.find(l => l.mlsNumber === mlsId) || null;
            if (listing) {
                this.cache.set(cacheKey, { data: listing, expiry: Date.now() + this.cacheDurationMs });
            }
            this.pendingQueries.delete(cacheKey);
            return listing;
        })();

        this.pendingQueries.set(cacheKey, fetchPromise);
        return fetchPromise;
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
            // 1. Filtering Phase (Combining multiple filters)
            let results = this.documentStore.filter(listing => {
                if (params.mlsId && listing.mlsNumber !== params.mlsId) return false;

                if (params.ids && params.ids.length > 0) {
                    if (!params.ids.includes(listing.mlsNumber) && !params.ids.includes(listing.id)) {
                        return false;
                    }
                }

                if (params.city && listing.city.toLowerCase() !== params.city.toLowerCase()) return false;

                if (params.propertyType) {
                    const types = Array.isArray(params.propertyType) ? params.propertyType : [params.propertyType];
                    if (!types.includes(listing.propertyType)) return false;
                }

                if (params.status) {
                    const statuses = Array.isArray(params.status) ? params.status : [params.status];
                    if (!statuses.includes(listing.status)) return false;
                }

                if (params.minPrice !== undefined && listing.price < params.minPrice) return false;
                if (params.maxPrice !== undefined && listing.price > params.maxPrice) return false;
                if (params.bedrooms !== undefined && listing.bedrooms < params.bedrooms) return false;
                if (params.bathrooms !== undefined && listing.bathrooms < params.bathrooms) return false;
                if (params.featured !== undefined && listing.isFeatured !== params.featured) return false;

                return true;
            });

            // Capture total count before pagination
            const totalCount = results.length;

            // 2. Sorting Phase (Requirement 2: Default sorting by latest)
            const sortParams = params.sort || 'latest';
            results.sort((a, b) => {
                switch (sortParams) {
                    case 'price_asc':
                        return a.price - b.price;
                    case 'price_desc':
                        return b.price - a.price;
                    case 'latest':
                    default:
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
            });

            // 3. Pagination Phase
            const limit = params.limit || 10;
            const page = params.page || 1;
            const startIndex = (page - 1) * limit;
            const paginatedResults = results.slice(startIndex, startIndex + limit);

            // 4 & 5. Field Selection Phase (Only return required fields for listing cards)
            const mappedListings: ListingCardField[] = paginatedResults.map(listing => ({
                id: listing.id,
                mlsNumber: listing.mlsNumber,
                address: listing.address,
                city: listing.city,
                province: listing.province,
                price: listing.price,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                squareFootage: listing.squareFootage,
                status: listing.status,
                propertyType: listing.propertyType,
                images: listing.images && listing.images.length > 0 ? [listing.images[0]] : [],
                isFeatured: listing.isFeatured,
                createdAt: listing.createdAt,
                description: listing.description,
            }));

            // 6. Response Format
            const response: ListingQueryResponse = {
                listings: mappedListings,
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
