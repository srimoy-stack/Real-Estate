import { InternalListingStatus, UserRole } from './index';

export interface ShortcodeFilters {
    city?: string;
    propertyType?: string | string[];
    status?: InternalListingStatus | InternalListingStatus[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    featured?: boolean;
}

export interface ShortcodeConfig {
    id: string;
    tenantId: string | null; // For Super Admin created global configs
    websiteId: string;       // Target website this shortcode belongs to
    createdByRole: UserRole; // Enforce permissions based on creator role
    shortcodeName: string;   // E.g., "featuredHomes"
    filters: ShortcodeFilters;
    limit: number;
    sort?: 'latest' | 'price_asc' | 'price_desc';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
