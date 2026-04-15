import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { communitiesService } from '@repo/services';

interface CityPageProps {
    params: { city: string };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
    const community = await communitiesService.getCommunityBySlug(params.city);
    const cityName = community?.name || params.city.charAt(0).toUpperCase() + params.city.slice(1);

    return {
        title: `Homes for Sale in ${cityName} | Real Estate Listings`,
        description: `Browse the latest real estate listings in ${cityName}. Find condos, detached houses, and townhomes for sale.`,
    };
}

export default async function CityDetailPage({ params }: CityPageProps) {
    const community = await communitiesService.getCommunityBySlug(params.city);
    
    // Redirect to search using the community name if found, otherwise use the slug directly
    const cityName = community?.name || params.city.charAt(0).toUpperCase() + params.city.slice(1);
    redirect(`/search?city=${encodeURIComponent(cityName)}`);
}
