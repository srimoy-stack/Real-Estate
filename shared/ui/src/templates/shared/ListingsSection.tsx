import React from 'react';
import { FeaturedListings } from './FeaturedListings';
import { Listing } from '@repo/types';
import { mlsListingService as listingsService } from '@repo/services';

export interface ListingsSectionProps {
    title?: string;
    subtitle?: string;
    limit?: number;
    filters?: any;
    city?: string;
    propertyType?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    listings?: Listing[];
    content?: {
        title?: string;
        subtitle?: string;
        configId?: string;
        breadcrumbLabel?: string;
    };
    variant?: 'default' | 'luxury' | 'minimal' | 'corporate';
    id?: string;
}

export const ListingsSection: React.FC<ListingsSectionProps> = ({
    title,
    subtitle,
    limit = 6,
    filters: propsFilters,
    city,
    propertyType,
    status,
    minPrice,
    maxPrice,
    listings: providedListings,
    content,
    variant = 'default',
    id
}) => {
    const [listings, setListings] = React.useState<Listing[]>(providedListings || []);
    const [loading, setLoading] = React.useState(!providedListings);

    React.useEffect(() => {
        // If listings were provided as a prop, don't fetch.
        if (providedListings && providedListings.length > 0) {
            setListings(providedListings);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // Determine active filters
                const activeCity = city || propsFilters?.city;
                const activeType = propertyType || propsFilters?.propertyType;
                const activeStatus = status || propsFilters?.status;
                const activeMin = minPrice !== undefined ? minPrice : propsFilters?.minPrice;
                const activeMax = maxPrice !== undefined ? maxPrice : propsFilters?.maxPrice;

                // Only fetch if some criteria is provided, otherwise fall back to empty/mock in FeaturedListings
                if (activeCity || activeType || activeStatus || activeMin || activeMax) {
                    const filters = {
                        city: activeCity,
                        propertyType: activeType as any,
                        status: activeStatus as any,
                        minPrice: activeMin,
                        maxPrice: activeMax,
                        limit: limit
                    };
                    const response = await listingsService.getListings(filters);
                    // Map to legacy 'id' for compatibility
                    setListings(response.listings.map((l: any) => ({ ...l, id: l.mlsNumber })));
                }
            } catch (error) {
                console.error('ListingsSection fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [providedListings, city, propsFilters, propertyType, status, minPrice, maxPrice, limit]);

    if (loading) return (
        <div className="py-20 text-center">
            <div className="animate-pulse flex items-center justify-center gap-2">
                <div className="h-2 w-2 bg-indigo-600 rounded-full" />
                <div className="h-2 w-2 bg-indigo-600 rounded-full delay-100" />
                <div className="h-2 w-2 bg-indigo-600 rounded-full delay-200" />
            </div>
        </div>
    );

    return (
        <FeaturedListings
            title={content?.title || title}
            subtitle={content?.subtitle || subtitle}
            listings={listings}
            variant={variant}
            id={id}
        />
    );
};
