import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { listingService, orgWebsiteService } from '@repo/services';

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
    let pageRoutes: MetadataRoute.Sitemap = [];

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

            // Fetch dynamic website pages
            const pages = await orgWebsiteService.getPages('org-1', tenantId);
            pageRoutes = pages
                .filter((p: any) => p.isPublished && p.slug !== '/' && !p.seoConfig?.noIndex) // Skip '/' and hidden pages
                .map((p: any) => ({
                    url: `${baseUrl}/${p.slug.replace(/^\//, '')}`,
                    lastModified: new Date(p.updatedAt),
                    changeFrequency: (p.sections?.some((s: any) => s.type === 'ListingsSection') ? 'daily' : 'weekly') as any,
                    priority: p.sections?.some((s: any) => s.type === 'ListingsSection') ? 0.8 : 0.6,
                }));
        } catch (e) {
            console.error('Sitemap generation failed for tenant:', tenantId, e);
        }
    }

    return [...routes, ...listingRoutes, ...pageRoutes];
}
