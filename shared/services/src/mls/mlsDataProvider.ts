import {
  MLSListing,
  MLSListingFilters,
  MLSListingQueryResult,
  MLSListingCard,
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
    if (typeof window !== 'undefined') return ''; // Browser context: naturally relative

    // 1. Prefer process.env.VERCEL_URL for server-side fetches on Vercel
    const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
    if (vercelUrl) {
      return `https://${vercelUrl}`;
    }

    // 2. Fallback to manually configured NEXT_PUBLIC_BASE_URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (baseUrl) return baseUrl;

    // 3. Last resort fallback
    return 'http://localhost:3000';
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
        const type = Array.isArray(filters.propertyType)
          ? filters.propertyType.join(',')
          : filters.propertyType;
        params.set('propertyType', type);
      }
      if (filters.keyword) params.set('q', filters.keyword);
      if (filters.featured !== undefined) params.set('featured', filters.featured.toString());
      if (filters.listingType) params.set('listingType', filters.listingType);
      if (filters.minSqft !== undefined) params.set('minSqft', filters.minSqft.toString());
      if (filters.maxSqft !== undefined) params.set('maxSqft', filters.maxSqft.toString());
      if (filters.minYearBuilt !== undefined)
        params.set('minYearBuilt', filters.minYearBuilt.toString());
      if (filters.maxYearBuilt !== undefined)
        params.set('maxYearBuilt', filters.maxYearBuilt.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.page) params.set('page', filters.page.toString());

      const url = `${this.getBaseUrl()}/api/internal-listings?${params.toString()}`;
      if (typeof window === 'undefined') console.log(`[ApiMlsProvider] Server Fetch: ${url}`);

      const response = await fetch(
        url,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        } as RequestInit
      );

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
        squareFootage: l.LivingArea || l.Building?.TotalFinishedArea || 0,
        images: (() => {
          let imgs: string[] = [];
          if (Array.isArray(l.Media) && l.Media.length > 0) {
            imgs = l.Media.filter((m: any) => m && m.MediaURL)
              .map((m: any) => m.MediaURL)
              .filter(Boolean);
          }
          if (imgs.length === 0 && l.primaryPhotoUrl) imgs = [l.primaryPhotoUrl];
          if (imgs.length === 0 && l.primaryPhoto) imgs = [l.primaryPhoto];
          return imgs;
        })(),
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
      const url = `${this.getBaseUrl()}/api/internal-listings/${mlsNumber}`;
      if (typeof window === 'undefined') console.log(`[ApiMlsProvider] Server Fetch Detail: ${url}`);

      const response = await fetch(url);
      if (!response.ok) return null;
      const l = await response.json();

      // Resolve images — try Media array first, then fallback fields
      let images: string[] = [];
      if (Array.isArray(l.Media) && l.Media.length > 0) {
        images = l.Media.filter((m: any) => m && m.MediaURL)
          .map((m: any) => m.MediaURL)
          .filter(Boolean);
      }
      if (images.length === 0 && l.primaryPhotoUrl) {
        images = [l.primaryPhotoUrl];
      }
      if (images.length === 0 && l.primaryPhoto) {
        images = [l.primaryPhoto];
      }

      // Map to full MLSListing
      return {
        mlsNumber: l.ListingKey || l.ListingId || mlsNumber,
        price: l.ListPrice ?? 0,
        status: l.StandardStatus || l.standardStatus || 'Active',
        propertyType: l.PropertySubType || l.PropertyType || 'Detached',
        address: l.UnparsedAddress || '',
        city: l.City || '',
        province: l.StateOrProvince || '',
        postalCode: l.PostalCode || '',
        bedrooms: l.BedroomsTotal ?? 0,
        bathrooms: l.BathroomsTotalInteger ?? 0,
        squareFootage: l.LivingArea || l.Building?.TotalFinishedArea || 0,
        yearBuilt: l.YearBuilt || undefined,
        images,
        isFeatured: !!l.isFeatured,
        createdAt: l.ModificationTimestamp || new Date().toISOString(),
        description: l.PublicRemarks || '',
        location: { lat: l.Latitude || 0, lng: l.Longitude || 0 },
        agentName: l.ListAgentFullName || l.agentName || '',
        agentPhone: l.ListAgentDirectPhone || l.agentPhone || undefined,
        agentEmail: l.ListAgentEmail || l.agentEmail || undefined,
        agentPhoto: l.ListAgentPhoto || l.agentPhoto || undefined,
        brokerageName: l.ListOfficeName || l.officeName || undefined,
        features: l.Features || [],
        amenities: l.Amenities || [],
        organizationId: 'org-1',
        updatedAt: l.ModificationTimestamp || new Date().toISOString(),
        ddfListingKey: l.ListingKey,
        ddfMemberKey: l.ListAgentKey,
      };
    } catch (error) {
      console.error('[ApiMlsProvider] getListingByMLS failed:', error);
      return null;
    }
  }
}

/**
 * Provider Instance - Production Ready
 * Exclusively uses ApiMlsProvider to ensure real DDF data is always used.
 */
export const mlsDataProvider: IMlsDataProvider = new ApiMlsProvider();
