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
            title="Featured Commercial & Lease Properties"
            subtitle="Explore premium commercial opportunities and high-value lease listings curated for professional investors and businesses."
            showViewAll={true}
            viewAllHref="/search?propertyType=Commercial,Lease&province=Ontario"
            filters={{ propertyType: "Commercial,Lease", province: "Ontario" }}
        />
    );
};
