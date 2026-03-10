export enum InternalListingStatus {
    FOR_SALE = 'For Sale',
    SOLD = 'Sold',
    PENDING = 'Pending',
    REMOVED = 'Removed',
}

export interface InternalListing {
    id: string;
    mlsNumber: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    price: number;
    status: InternalListingStatus;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    lotSize: number;
    description: string;
    amenities: string[];
    images: string[];
    latitude: number;
    longitude: number;
    agentName: string;
    agentPhone: string;
    agentEmail: string;
    createdAt: string;
    updatedAt: string;
    isFeatured: boolean;
}
