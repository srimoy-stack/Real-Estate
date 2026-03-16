'use client';

import React from 'react';
import { ListingsSection } from '../sections/ListingsSection';
import { ListingSectionFilters, ListingSortOrder } from '@repo/types';

interface ListingShortcodeProps {
    attributes: Record<string, string>;
}

/**
 * ListingShortcode bridges shortcode-style string attributes 
 * to the typed ListingsSection component.
 * 
 * Example shortcode:
 *   [listings city="Toronto" limit="6" status="For Sale"]
 * 
 * The attributes are parsed from the shortcode string by ShortcodeRenderer,
 * and this component converts them into proper typed props for ListingsSection.
 */
export const ListingShortcode: React.FC<ListingShortcodeProps> = ({ attributes }) => {
    // Convert raw string attributes into typed filter objects
    const filters: ListingSectionFilters = {};

    if (attributes.city) filters.city = attributes.city;
    if (attributes.property_type || attributes.propertyType) {
        filters.propertyType = (attributes.property_type || attributes.propertyType) as any;
    }
    if (attributes.status) {
        const rawStatus = attributes.status.toLowerCase();
        if (rawStatus.includes('sale') || rawStatus === 'active') {
            filters.status = 'ACTIVE' as any;
        } else if (rawStatus.includes('sold')) {
            filters.status = 'SOLD' as any;
        } else if (rawStatus.includes('pending')) {
            filters.status = 'PENDING' as any;
        } else {
            filters.status = attributes.status as any;
        }
    }
    if (attributes.min_price || attributes.minPrice) {
        filters.minPrice = parseInt(attributes.min_price || attributes.minPrice, 10);
    }
    if (attributes.max_price || attributes.maxPrice) {
        filters.maxPrice = parseInt(attributes.max_price || attributes.maxPrice, 10);
    }
    if (attributes.bedrooms) filters.bedrooms = parseInt(attributes.bedrooms, 10);
    if (attributes.bathrooms) filters.bathrooms = parseInt(attributes.bathrooms, 10);
    if (attributes.featured === 'true') filters.featured = true;

    const limit = attributes.limit ? parseInt(attributes.limit, 10) : 6;
    const sort = (attributes.sort as ListingSortOrder) || 'latest';
    const title = attributes.title;
    const subtitle = attributes.subtitle;

    return (
        <ListingsSection
            filters={filters}
            limit={limit}
            sort={sort}
            title={title}
            subtitle={subtitle}
            showViewAll={attributes.show_view_all !== 'false'}
            className="!py-0"
        />
    );
};
