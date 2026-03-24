import { BuilderPage } from './useBuilderStore';

export interface GeneratedSeo {
    title: string;
    description: string;
}

/** 
 * Refined SEO Engine for Real Estate.
 * Supports template-based generation from MLS shortcodes and page context.
 */
export const seoEngine = {
    /** 
     * Infers SEO metadata from page sections (typically the first ListingsSection found)
     */
    generateDynamicSeo: (page: BuilderPage, siteName: string = 'Our Realty'): GeneratedSeo => {
        // 1. Look for a section that contains MLS listings (shortcodes)
        const listingSection = page.sections.find(s =>
            s.type === 'ListingsSection' ||
            s.type === 'FeaturedListingsSection' ||
            s.type === 'HeroSection'
        );

        if (listingSection?.config) {
            const f = listingSection.config.filters || {};

            // Extract core identifiers with defaults
            const city = f.city || 'Local Area';
            const propertyType = f.propertyType || 'Real Estate';
            const status = f.status || 'for Sale';

            // Extract price range for contextual supplement if needed
            const minPrice = f.minPrice ? `$${(f.minPrice / 1000).toFixed(0)}K` : null;
            const maxPrice = f.maxPrice ? `$${(f.maxPrice / 1000000).toFixed(1)}M` : null;
            const priceRange = (minPrice || maxPrice)
                ? `${minPrice || '$0'} to ${maxPrice || 'Premium'}`
                : '';

            // Title: "{propertyType} for Sale in {city} | {siteName}" (User requirement)
            const title = `${propertyType} ${status} in ${city} | ${siteName}`;

            // Description: "Browse {propertyType} listings in {city} with latest prices and details" (User requirement)
            const description = `Browse ${propertyType} listings in ${city} with latest prices and details. ${priceRange ? `See properties from ${priceRange}.` : ''} High-quality images, virtual tours, and up-to-the-minute MLS data.`;

            return { title, description };
        }

        // 2. Default fallback based on page name
        return {
            title: `${page.name} | ${siteName}`,
            description: `View ${page.name} for modern real estate opportunities, professional insights, and local listings.`
        };
    },

    /**
     * Generates a dynamic slug based on MLS shortcode context
     * e.g. "Toronto" + "Condo" -> "/toronto-condos"
     */
    generateDynamicSlug: (filters: Record<string, any>): string => {
        const city = (filters.city || 'local').toLowerCase().replace(/\s+/g, '-');
        const propertyType = (filters.propertyType || 'listing').toLowerCase().replace(/\s+/g, '-');

        // Return a clean, hyphenated slug
        return `/${city}-${propertyType}s`.replace(/-+/g, '-');
    },

    /**
     * Prepares metadata for a sitemap entry
     */
    generateSitemapEntry: (page: BuilderPage, baseUrl: string): any => {
        const listingSection = page.sections.find(s =>
            s.type === 'ListingsSection' ||
            s.type === 'FeaturedListingsSection'
        );

        let priority = 0.5;
        let changefreq = 'weekly';

        if (listingSection) {
            priority = 0.8; // Dynamic listing pages are high value
            changefreq = 'daily'; // Real estate changes frequently
        }

        return {
            url: `${baseUrl}${page.slug}`,
            lastmod: new Date().toISOString(),
            changefreq,
            priority
        };
    },

    /**
     * Programmatically creates a high-performance SEO landing page from MLS data
     */
    generateSeoPage: (city: string, propertyType: string): Partial<BuilderPage> => {
        const slug = seoEngine.generateDynamicSlug({ city, propertyType });
        const name = `${city} ${propertyType}s for Sale`;

        return {
            name,
            slug,
            isPublic: true,
            pageType: 'listing',
            sections: [
                {
                    id: `seo-hero-${Date.now()}`,
                    type: 'HeroSection',
                    config: {
                        filters: { city, propertyType, status: 'Active' },
                        content: {
                            title: `Modern ${propertyType}s in ${city}`,
                            subtitle: `Browse the latest ${city} real estate listings and find your dream home.`
                        }
                    }
                },
                {
                    id: `seo-listings-${Date.now()}`,
                    type: 'ListingsSection',
                    config: {
                        filters: { city, propertyType, status: 'Active' },
                        content: { title: `Active ${propertyType} Listings` },
                        source: 'manual'
                    }
                }
            ]
        };
    },

    /**
     * Generates standard JSON-LD Schema Markup
     */
    generateSchemaMarkup: (page: BuilderPage, website: any): string => {
        const siteName = website?.name || 'Prestige Realty';
        const baseUrl = `https://${website?.domain || 'site.com'}`;

        const listingSection = page.sections.find(s => s.type === 'ListingsSection');
        const filters = listingSection?.config?.filters || {};

        const schemas: any[] = [
            // 1. Organization Schema
            {
                "@context": "https://schema.org",
                "@type": "RealEstateAgent",
                "name": siteName,
                "url": baseUrl,
                "logo": website?.brandingConfig?.logoUrl || "",
                "image": website?.brandingConfig?.logoUrl || ""
            },
            // 2. Breadcrumb Schema
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
                    { "@type": "ListItem", "position": 2, "name": page.name, "item": `${baseUrl}${page.slug}` }
                ]
            }
        ];

        // 3. Collection/Listing Page Schema if applicable
        if (listingSection) {
            schemas.push({
                "@context": "https://schema.org",
                "@type": "RealEstateListing",
                "name": `${filters.propertyType || 'Property'}s for Sale in ${filters.city || 'Local Area'}`,
                "url": `${baseUrl}${page.slug}`,
                "description": page.name
            });
        }

        return JSON.stringify(schemas);
    },

    /**
     * Generates internal linking suggestions for contextual SEO
     */
    generateInternalLinking: (city: string, propertyType: string): string[] => {
        return [
            `Explore more in ${city}`,
            `Similar ${propertyType}s nearby`,
            `Latest Real Estate in ${city}`,
            `Best value ${propertyType}s`
        ];
    },

    /**
     * Resolves variables in a template string
     * e.g. "{propertyType} in {city}" -> "Condos in Toronto"
     */
    resolveTemplate: (template: string, data: Record<string, string>): string => {
        return template.replace(/{(\w+)}/g, (match, key) => {
            return data[key] || match;
        });
    }
};
