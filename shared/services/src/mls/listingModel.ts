/**
 * MLS Listing Data Engine – Model Definitions
 * Designed for easy swap to a real RESO/CREA DDF API adapter.
 */

export type MLSStatus = 'For Sale' | 'Sold' | 'Pending' | 'Removed';
export type MLSPropertyType = 'Condo' | 'Detached' | 'Semi-Detached' | 'Townhouse' | 'Land' | 'Commercial';

export interface MLSListing {
    mlsNumber: string;          // Unique key – used for deduplication
    price: number;
    status: MLSStatus;
    propertyType: MLSPropertyType;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    lotSize?: number;
    yearBuilt?: number;
    description: string;
    images: string[];
    features: string[];
    amenities: string[];
    location: { lat: number; lng: number };
    agentName: string;
    agentPhone?: string;
    agentEmail?: string;
    agentPhoto?: string;
    brokerageName?: string;
    organizationId: string;
    isFeatured?: boolean;
    virtualTourUrl?: string;
    createdAt: string;
    updatedAt: string;
    // DDF Compliance & Integration
    ddfListingKey?: string;
    ddfMemberKey?: string;
}

/** Lightweight card projection – only fields needed for listing cards */
export type MLSListingCard = Pick<
    MLSListing,
    | 'mlsNumber'
    | 'price'
    | 'status'
    | 'propertyType'
    | 'address'
    | 'city'
    | 'province'
    | 'postalCode'
    | 'bedrooms'
    | 'bathrooms'
    | 'squareFootage'
    | 'images'
    | 'isFeatured'
    | 'createdAt'
    | 'description'
    | 'location'
    | 'agentName'
    | 'agentPhone'
    | 'agentEmail'
    | 'agentPhoto'
    | 'brokerageName'
    | 'ddfListingKey'
    | 'ddfMemberKey'
>;

export interface MLSListingFilters {
    ids?: string[];             // Fetch specific listings by MLS numbers
    city?: string;
    propertyType?: MLSPropertyType | MLSPropertyType[];
    listingType?: 'Residential' | 'Commercial';
    status?: MLSStatus | MLSStatus[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    minSqft?: number;
    maxSqft?: number;
    minLandSize?: number;
    maxLandSize?: number;
    minYearBuilt?: number;
    maxYearBuilt?: number;
    keyword?: string;
    featured?: boolean;
    organizationId?: string;
    limit?: number;
    page?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'price-low-high' | 'price-high-low';
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
}

export interface MLSListingQueryResult {
    listings: MLSListingCard[];
    totalCount: number;
}
