'use client';

import React from 'react';
import { ListingsSection } from './ListingsSection';

/**
 * FeaturedListings section - a preconfigured ListingsSection
 * for the homepage that shows active (featured) listings.
 * 
 * Uses the dynamic ListingsSection engine under the hood,
 * so data is fetched via listingsService, never hardcoded.
 */
export const FeaturedListings: React.FC = () => {
    return (
        <ListingsSection
            filters={{ status: 'ACTIVE' as any }}
            limit={3}
            sort="latest"
            title="Featured Listings"
            subtitle="Hand-picked properties that represent the pinnacle of design, location, and value in today's elite market."
            showViewAll={true}
            viewAllHref="/search"
        />
    );
};
