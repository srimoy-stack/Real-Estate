export enum InternalListingStatus {
    FOR_SALE = 'For Sale',
    SOLD = 'Sold',
    PENDING = 'Pending',
    REMOVED = 'Removed',
}

export interface InternalListing {
    id: string;
    organizationId: string;
    mlsNumber: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    price: number;
    currency: string;
    status: InternalListingStatus;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    lotSize: number;
    yearBuilt?: number;
    description: string;
    features: string[];
    amenities: string[];
    images: string[];
    virtualTourUrl?: string;
    latitude: number;
    longitude: number;
    agentName: string;
    agentPhone: string;
    agentEmail: string;
    brokerageName?: string;
    createdAt: string;
    updatedAt: string;
    isFeatured: boolean;
}

/** Lead record created when a visitor submits an inquiry from a listing page */
export interface ListingLead {
    id: string;
    listingId: string;
    mlsNumber: string;
    websiteId?: string;
    organizationId?: string;
    source: 'listing_page' | 'contact_form' | 'chat' | 'referral';
    name: string;
    email: string;
    phone: string;
    message: string;
    createdAt: string;
}
