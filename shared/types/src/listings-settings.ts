export interface FilterRestrictions {
    cities: string[];
    postalCodes: string[];
    minPrice?: number;
    maxPrice?: number;
}

export type ListingPoolMode = 'brokerage_only' | 'shared_pool';

export interface ListingDisplaySettings {
    defaultSort: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
    listingsPerPage: number;
    featuredListingIds: string[];
    filterRestrictions: FilterRestrictions;
    poolMode: ListingPoolMode;
    showPriceRange: boolean;
    showMap: boolean;
    showVirtualTour: boolean;
    hideOffMarket: boolean;
    enableComparisons: boolean;
}
