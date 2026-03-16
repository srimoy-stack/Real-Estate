import { Metadata } from 'next';
import { IDXExplorer } from '@/components/idx';

export const metadata: Metadata = {
    title: 'Property Explorer | IDX Listings Search',
    description:
        'Browse real estate listings with an interactive map. Filter by city, price, property type, bedrooms, and more. Find your dream home today.',
    openGraph: {
        title: 'Property Explorer | IDX Listings Search',
        description:
            'Browse real estate listings with an interactive map. Filter by city, price, property type, bedrooms, and more.',
        type: 'website',
    },
};

export default function PropertiesPage() {
    return <IDXExplorer />;
}
