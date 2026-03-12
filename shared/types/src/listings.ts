import { BaseEntity } from './index';

export enum ListingStatus {
    ACTIVE = 'ACTIVE',
    SOLD = 'SOLD',
    PENDING = 'PENDING',
    OFF_MARKET = 'OFF_MARKET',
}

export enum PropertyType {
    DETACHED = 'DETACHED',
    SEMI_DETACHED = 'SEMI_DETACHED',
    TOWNHOUSE = 'TOWNHOUSE',
    CONDO = 'CONDO',
    LAND = 'LAND',
    COMMERCIAL = 'COMMERCIAL',
}

export interface Listing extends BaseEntity {
    organizationId: string;
    tenantId?: string; // Some data uses tenantId instead of organizationId
    mlsNumber: string;
    agentName: string;
    agentPhone?: string;
    agentEmail?: string;
    brokerageName?: string;
    externalId?: string; // e.g. CREA DDF ID
    slug: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage?: number;
    squareFeet?: number; // Alias used in templates
    lotSize?: number;
    yearBuilt?: number;
    propertyType: PropertyType;
    status: ListingStatus;
    isFeatured?: boolean;

    // Address
    address: string; // Simplified string representation for quick rendering
    city: string;
    province: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;

    // Media
    mainImage: string;
    images: string[];
    virtualTourUrl?: string;

    // Features
    features: string[];
    amenities: string[];

    // SEO
    seoTitle?: string;
    seoDescription?: string;
}

export interface ListingFilters {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: PropertyType[];
    city?: string;
    postalCode?: string;
    keyword?: string;
    page: number;
    limit: number;
}
