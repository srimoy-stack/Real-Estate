import { ListingFilters } from './listings';

export interface SavedListing {
    id: string;
    userId: string;
    listingId: string; // mlsNumber or internal id
    createdAt: string;
}

export interface SavedSearch {
    id: string;
    userId: string;
    name: string;
    filters: ListingFilters;
    createdAt: string;
}
