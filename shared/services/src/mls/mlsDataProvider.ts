import {
    MLSListing,
    MLSListingFilters,
    MLSListingQueryResult,
    MLSListingCard
} from './listingModel';

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
 * 2. API Provider (Production)
 * Connects to the internal Next.js API route that proxies Prisma/DDF.
 */
export class ApiMlsProvider implements IMlsDataProvider {
    private getBaseUrl() {
        if (typeof window !== 'undefined') return ''; // Browser
        return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Server
    }

    async getListings(filters: MLSListingFilters): Promise<MLSListingQueryResult> {
        try {
            const params = new URLSearchParams();
            if (filters.city) params.set('city', filters.city);
            if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
            if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
            if (filters.bedrooms !== undefined) params.set('beds', filters.bedrooms.toString());
            if (filters.bathrooms !== undefined) params.set('baths', filters.bathrooms.toString());
            if (filters.propertyType) {
                const type = Array.isArray(filters.propertyType) ? filters.propertyType[0] : filters.propertyType;
                params.set('propertyType', type);
            }
            if (filters.keyword) params.set('q', filters.keyword);
            if (filters.featured !== undefined) params.set('featured', filters.featured.toString());
            if (filters.listingType) params.set('listingType', filters.listingType);
            if (filters.minSqft !== undefined) params.set('minSqft', filters.minSqft.toString());
            if (filters.maxSqft !== undefined) params.set('maxSqft', filters.maxSqft.toString());
            if (filters.minYearBuilt !== undefined) params.set('minYearBuilt', filters.minYearBuilt.toString());
            if (filters.maxYearBuilt !== undefined) params.set('maxYearBuilt', filters.maxYearBuilt.toString());
            if (filters.limit) params.set('limit', filters.limit.toString());
            if (filters.page) params.set('page', filters.page.toString());

            const response = await fetch(`${this.getBaseUrl()}/api/internal-listings?${params.toString()}`, {
                next: { revalidate: 3600 } // Cache for 1 hour
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const json = await response.json();
            const rawListings = json.listings || json.data || [];

            // Map DDF fields back to MLSListing format
            const listings: MLSListingCard[] = rawListings.map((l: any) => ({
                mlsNumber: l.ListingKey,
                price: l.ListPrice,
                status: l.StandardStatus || 'Active',
                propertyType: l.PropertySubType || 'Detached',
                address: l.UnparsedAddress,
                city: l.City,
                province: l.StateOrProvince,
                postalCode: l.PostalCode,
                bedrooms: l.BedroomsTotal,
                bathrooms: l.BathroomsTotalInteger,
                squareFootage: l.Building?.TotalFinishedArea || 0,
                images: l.Media?.map((m: any) => m.MediaURL) || [],
                isFeatured: !!l.isFeatured,
                createdAt: l.ModificationTimestamp || new Date().toISOString(),
                description: l.PublicRemarks,
                location: { lat: l.Latitude, lng: l.Longitude },
                agentName: l.agentName || l.ListAgentFullName,
                agentPhone: l.agentPhone || l.ListAgentDirectPhone,
                agentEmail: l.agentEmail || l.ListAgentEmail,
                agentPhoto: l.agentPhoto || l.ListAgentPhoto,
                brokerageName: l.officeName || l.ListOfficeName,
                ddfListingKey: l.ListingKey,
                ddfMemberKey: l.ListAgentKey,
            }));

            return { listings, totalCount: json.total || 0 };
        } catch (error) {
            console.error('[ApiMlsProvider] Fetch failed:', error);
            return { listings: [], totalCount: 0 };
        }
    }

    async getListingByMLS(mlsNumber: string): Promise<MLSListing | null> {
        try {
            const response = await fetch(`${this.getBaseUrl()}/api/internal-listings/${mlsNumber}`);
            if (!response.ok) return null;
            const l = await response.json();

            // Map to full MLSListing
            return {
                mlsNumber: l.ListingKey,
                price: l.ListPrice,
                status: l.StandardStatus,
                propertyType: l.PropertySubType,
                address: l.UnparsedAddress,
                city: l.City,
                province: l.StateOrProvince,
                postalCode: l.PostalCode,
                bedrooms: l.BedroomsTotal,
                bathrooms: l.BathroomsTotalInteger,
                squareFootage: l.Building?.TotalFinishedArea || 0,
                images: l.Media?.map((m: any) => m.MediaURL) || [],
                isFeatured: !!l.isFeatured,
                createdAt: l.ModificationTimestamp,
                description: l.PublicRemarks,
                location: { lat: l.Latitude, lng: l.Longitude },
                agentName: l.ListAgentFullName,
                features: l.Features || [],
                amenities: l.Amenities || [],
                organizationId: 'org-1', // Default for now
                updatedAt: l.ModificationTimestamp || new Date().toISOString(),
                ddfListingKey: l.ListingKey,
                ddfMemberKey: l.ListAgentKey,
            };
        } catch (error) {
            return null;
        }
    }
}

/**
 * Provider Instance - Production Ready
 * Exclusively uses ApiMlsProvider to ensure real DDF data is always used.
 */
export const mlsDataProvider: IMlsDataProvider = new ApiMlsProvider();
