import {
    MLSListing,
    MLSListingFilters,
    MLSListingQueryResult,
    MLSListingCard
} from './listingModel';
import { listingStore } from './listingStore';

/**
 * MLS Data Provider Abstraction Layer
 * ──────────────────────────────────────────────────────────
 * Defines the contract for fetching listing data. Allows switching
 * between local mock data and future remote API integrations.
 */
export interface IMlsDataProvider {
    getListings(filters: MLSListingFilters): Promise<MLSListingQueryResult>;
    getListingByMLS(mlsNumber: string): Promise<MLSListing | null>;
}

/**
 * 1. Mock Provider (Production Mock)
 * Uses the existing in-memory listingStore and mock filtering logic.
 */
export class MockMlsProvider implements IMlsDataProvider {
    async getListings(filters: MLSListingFilters = {}): Promise<MLSListingQueryResult> {
        // Simulate async data access
        await new Promise(resolve => setTimeout(resolve, 50));

        let results = listingStore.getAllListings();

        // Default: hide 'Removed' unless explicitly requested
        if (!filters.status) {
            results = results.filter(l => l.status !== 'Removed');
        }

        // Filtering Logic
        if (filters.ids && filters.ids.length > 0) {
            results = results.filter(l => filters.ids!.includes(l.mlsNumber));
        }

        if (filters.city) {
            const c = filters.city.toLowerCase();
            results = results.filter(l => l.city.toLowerCase().includes(c));
        }

        if (filters.propertyType) {
            const types = (Array.isArray(filters.propertyType) ? filters.propertyType : [filters.propertyType])
                .map(t => t.toLowerCase());
            results = results.filter(l => types.includes(l.propertyType.toLowerCase()));
        }

        if (filters.status) {
            let statuses = (Array.isArray(filters.status) ? (filters.status as string[]) : [filters.status as string])
                .map(s => s.toLowerCase());
            if (statuses.includes('active')) {
                statuses = [...statuses, 'for sale'];
            }
            results = results.filter(l => statuses.includes(l.status.toLowerCase()));
        }

        if (filters.minPrice !== undefined) results = results.filter(l => l.price >= filters.minPrice!);
        if (filters.maxPrice !== undefined) results = results.filter(l => l.price <= filters.maxPrice!);
        if (filters.bedrooms !== undefined) results = results.filter(l => l.bedrooms >= filters.bedrooms!);
        if (filters.bathrooms !== undefined) results = results.filter(l => l.bathrooms >= filters.bathrooms!);
        if (filters.featured !== undefined) results = results.filter(l => !!l.isFeatured === filters.featured);

        if (filters.keyword) {
            const kw = filters.keyword.toLowerCase();
            results = results.filter(l =>
                l.address.toLowerCase().includes(kw) ||
                l.city.toLowerCase().includes(kw) ||
                l.mlsNumber.toLowerCase().includes(kw) ||
                l.description.toLowerCase().includes(kw) ||
                l.agentName.toLowerCase().includes(kw) ||
                l.propertyType.toLowerCase().includes(kw)
            );
        }

        // Sorting
        const sort = filters.sort || 'newest';
        results.sort((a, b) => {
            switch (sort) {
                case 'price-low-high':
                case 'price_asc': return a.price - b.price;
                case 'price-high-low':
                case 'price_desc': return b.price - a.price;
                case 'newest':
                default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        const totalCount = results.length;

        // Pagination
        const limit = filters.limit ?? 12;
        const page = filters.page ?? 1;
        const start = (page - 1) * limit;
        const paginated = results.slice(start, start + limit);

        // Project to card fields
        const listings: MLSListingCard[] = paginated.map(l => ({
            mlsNumber: l.mlsNumber,
            price: l.price,
            status: l.status,
            propertyType: l.propertyType,
            address: l.address,
            city: l.city,
            province: l.province,
            postalCode: l.postalCode,
            bedrooms: l.bedrooms,
            bathrooms: l.bathrooms,
            squareFootage: l.squareFootage,
            images: l.images.length > 0 ? [l.images[0]] : [],
            isFeatured: l.isFeatured,
            createdAt: l.createdAt,
            description: l.description,
            location: l.location,
            agentName: l.agentName,
        }));

        return { listings, totalCount };
    }

    async getListingByMLS(mlsNumber: string): Promise<MLSListing | null> {
        await new Promise(resolve => setTimeout(resolve, 50));
        return listingStore.getListing(mlsNumber) ?? null;
    }
}

/**
 * 2. API Provider (Placeholder)
 * Ready for future integration with CREA DDF / RESO Web API.
 */
export class ApiMlsProvider implements IMlsDataProvider {
    // Placholders for future API configuration
    private apiKey = process.env.MLS_API_KEY || '';
    private apiSecret = process.env.MLS_API_SECRET || '';
    private endpoint = process.env.MLS_API_ENDPOINT || 'https://api.mls-gateway.com/v1';

    async getListings(_filters: MLSListingFilters): Promise<MLSListingQueryResult> {
        console.log(`[MLS API Provider] Connecting to ${this.endpoint} with key ${this.apiKey.substring(0, 4)}...`);
        // This will eventually perform a fetch() call to the backend API
        return { listings: [], totalCount: 0 };
    }

    async getListingByMLS(_mlsNumber: string): Promise<MLSListing | null> {
        console.log(`[MLS API Provider] Fetching ${_mlsNumber} using ${this.apiSecret ? 'Secret' : 'Public'} mode`);
        return null;
    }
}

/**
 * Provider Instance Switch
 * Uses USE_MOCK_DATA environment variable to determine which provider to use.
 */
const useMock = process.env.USE_MOCK_DATA !== 'false';
export const mlsDataProvider: IMlsDataProvider = useMock
    ? new MockMlsProvider()
    : new ApiMlsProvider();
