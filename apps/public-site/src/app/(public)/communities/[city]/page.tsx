import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { communitiesService } from '@repo/services';

interface CityPageProps {
    params: { city: string };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
    const community = await communitiesService.getCommunityBySlug(params.city);
    if (!community) return { title: 'City Not Found' };

    return {
        title: `Homes for Sale in ${community.name} | Real Estate Listings`,
        description: `Browse the latest real estate listings in ${community.name}. Find condos, detached houses, and townhomes for sale in ${community.name}.`,
    };
}

export default async function CityDetailPage({ params }: CityPageProps) {
    const community = await communitiesService.getCommunityBySlug(params.city);
    if (!community) return notFound();

    // Redirect community slugs straight into the unified search experience
    redirect(`/search?city=${encodeURIComponent(community.name || params.city)}`);
}
