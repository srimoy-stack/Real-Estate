import { BaseEntity } from './index';

export type ListingSortOrder = 'latest' | 'price_asc' | 'price_desc' | 'price-low-high' | 'price-high-low';

export interface ListingSectionFilters {
    city?: string;
    propertyType?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    featured?: boolean;
}

export interface ListingSectionConfig extends BaseEntity {
    websiteId: string;
    sectionKey: string;
    filters: ListingSectionFilters;
    limit: number;
    sort: ListingSortOrder;
}
