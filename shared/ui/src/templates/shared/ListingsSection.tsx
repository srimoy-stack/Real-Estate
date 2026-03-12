import React from 'react';
import { FeaturedListings } from './FeaturedListings';
import { Listing } from '@repo/types';

export interface ListingsSectionProps {
    title?: string;
    subtitle?: string;
    limit?: number;
    filters?: any;
    listings?: Listing[];
    content?: {
        title?: string;
        subtitle?: string;
    };
}

export const ListingsSection: React.FC<ListingsSectionProps> = ({
    title,
    subtitle,
    limit = 6,
    listings = [],
    content
}) => {
    return (
        <FeaturedListings
            title={content?.title || title}
            subtitle={content?.subtitle || subtitle}
            listings={listings.slice(0, limit)}
        />
    );
};
