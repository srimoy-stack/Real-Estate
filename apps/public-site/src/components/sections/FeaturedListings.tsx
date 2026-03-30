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
            limit={20}
            sort="latest"
            title="Premium Collection"
            subtitle="Explore our hand-picked properties representing the pinnacle of design, location, and value in today's most desirable markets."
            showViewAll={true}
            viewAllHref="/properties"
            variant="idx"
        />
    );
};
