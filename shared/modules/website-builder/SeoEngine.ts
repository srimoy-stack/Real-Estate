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
            s.type === 'HeroSection' // Some Hero variants include property search / shortcode context
        );

        if (listingSection?.config?.filters) {
            const f = listingSection.config.filters;

            // Extract core identifiers
            const city = f.city || 'local areas';
            const propertyType = f.propertyType || 'Real Estate';
            const status = f.status || 'for sale';
            const minPrice = f.minPrice ? `$${(f.minPrice / 1000).toFixed(0)}K` : null;
            const maxPrice = f.maxPrice ? `$${(f.maxPrice / 1000000).toFixed(1)}M` : null;

            // Title Generation Logic
            let title = `${propertyType} ${status} in ${city}`;
            if (minPrice || maxPrice) {
                title += ` from ${minPrice || '$0'} to ${maxPrice || 'Any'}`;
            }
            title += ` | ${siteName}`;

            // Description Generation Logic
            const description = `Discover the latest ${propertyType} listings ${status} in ${city}. ${minPrice ? `Starting at ${minPrice}.` : ''} Get direct MLS access, virtual tours, and neighborhood data. Professional service by ${siteName}.`;

            return { title, description };
        }

        // 2. Default fallback based on page name
        return {
            title: `${page.name} | ${siteName}`,
            description: `View ${page.name} for modern real estate opportunities, professional insights, and local listings.`
        };
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
