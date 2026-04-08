'use client';

import React from 'react';
import { ListingsSection } from './ListingsSection';

/**
 * FeaturedListings section — Homepage preview.
 * Shows a curated set of 6 premium listings to entice visitors.
 * "View All" button leads to /search where full search + auth gate awaits.
 */
export const FeaturedListings: React.FC = () => {
    return (
        <ListingsSection
            limit={50}
            sort="latest"
            title="Ontario Featured Properties"
            subtitle="Explore high-value commercial and lease opportunities across Ontario's premier business districts and growing urban centers."
            showViewAll={true}
            viewAllHref="/search?propertyType=Commercial,Lease&city=Ontario"
            filters={{ propertyType: "Commercial,Lease", city: "Ontario" }}
        />
    );
};
