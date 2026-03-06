import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { listingService } from '@repo/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const headersList = headers();
    const domain = headersList.get('host') || 'localhost';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${domain}`;

    // Get current tenant ID from headers (injected by middleware)
    const tenantId = headersList.get('x-website-id');

    const routes = ['', '/listings'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    let listingRoutes: MetadataRoute.Sitemap = [];

    if (tenantId) {
        try {
            // Fetch some listings for this tenant to include in sitemap
            // In a real app, we'd paginate or use a specialized sitemap service
            const listingsData = await listingService.search({ page: 1, limit: 100 });
            listingRoutes = listingsData.data.map((listing) => ({
                url: `${baseUrl}/listings/${listing.slug}`,
                lastModified: new Date(listing.updatedAt || listing.createdAt),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        } catch (e) {
            console.error('Sitemap generation failed for tenant:', tenantId, e);
        }
    }

    return [...routes, ...listingRoutes];
}
