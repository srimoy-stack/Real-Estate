import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'MLS Listings Demo | Real Estate Search',
    description:
        'Search thousands of verified MLS listings across Canada. Find your dream property with our premium real estate search experience.',
};

/**
 * Layout for the standalone listings demo page.
 * The root layout already handles demo routes (no website config)
 * by rendering children in a basic html shell.
 */
export default function ListingsDemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="min-h-screen bg-gray-50 antialiased"
            style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
            {children}
        </div>
    );
}
