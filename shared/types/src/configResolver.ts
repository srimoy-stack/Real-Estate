import type {
    WebsiteConfig,
    SectionConfig,
    NavigationConfig,
    BrandingConfig,
    WebsiteSeoConfig,
    PageSeoConfig,
    CustomPage,
    TemplateId,
} from './website';
import { getTemplateById } from './templates';

// ═══════════════════════════════════════════════════════════
//  CONFIG RESOLVER
//  Utility functions to safely query and validate a
//  WebsiteConfig. Used by the rendering engine.
// ═══════════════════════════════════════════════════════════

/**
 * Get visible homepage sections, sorted by order.
 */
export function getVisibleSections(config: WebsiteConfig): SectionConfig[] {
    return config.homepage.sections
        .filter(section => section.isVisible)
        .sort((a, b) => a.order - b.order);
}

/**
 * Get visible header navigation links, sorted by order.
 */
export function getHeaderLinks(config: WebsiteConfig): NavigationConfig['headerLinks'] {
    return config.navigation.headerLinks
        .filter(link => link.isVisible)
        .sort((a, b) => a.order - b.order);
}

/**
 * Get visible footer navigation links, sorted by order.
 */
export function getFooterLinks(config: WebsiteConfig): NavigationConfig['footerLinks'] {
    return config.navigation.footerLinks
        .filter(link => link.isVisible)
        .sort((a, b) => a.order - b.order);
}

/**
 * Get published custom pages, sorted by sortOrder.
 */
export function getPublishedPages(config: WebsiteConfig): CustomPage[] {
    return config.pages
        .filter(page => page.isPublished)
        .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Find a custom page by slug.
 */
export function getPageBySlug(config: WebsiteConfig, slug: string): CustomPage | undefined {
    return config.pages.find(page => page.slug === slug && page.isPublished);
}

/**
 * Resolve the page-level SEO, falling back to site-level defaults.
 */
export function resolvePageSeo(
    siteSeo: WebsiteSeoConfig,
    pageSeo?: PageSeoConfig
): PageSeoConfig {
    if (!pageSeo) {
        return {
            title: siteSeo.defaultTitle,
            description: siteSeo.defaultDescription,
            keywords: siteSeo.keywords,
            ogImage: siteSeo.ogImage,
        };
    }

    return {
        title: pageSeo.title
            ? siteSeo.titleTemplate.replace('%s', pageSeo.title)
            : siteSeo.defaultTitle,
        description: pageSeo.description || siteSeo.defaultDescription,
        keywords: pageSeo.keywords ?? siteSeo.keywords,
        ogTitle: pageSeo.ogTitle ?? pageSeo.title,
        ogDescription: pageSeo.ogDescription ?? pageSeo.description,
        ogImage: pageSeo.ogImage ?? siteSeo.ogImage,
        canonicalUrl: pageSeo.canonicalUrl,
        noIndex: pageSeo.noIndex ?? false,
    };
}

/**
 * Get the font import URLs for the branding config.
 * Returns Google Fonts URLs to load in <head>.
 */
export function getFontUrls(branding: BrandingConfig): string[] {
    const fonts = new Set<string>();
    fonts.add(branding.fontHeading);
    fonts.add(branding.fontBody);

    return Array.from(fonts).map(
        font => `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`
    );
}

/**
 * Generate CSS custom properties from branding config.
 * Injected as inline styles on the <body> or root <div>.
 */
export function getBrandingCssVars(branding: BrandingConfig): Record<string, string> {
    const vars: Record<string, string> = {
        '--brand-primary': branding.primaryColor,
        '--brand-font-heading': `'${branding.fontHeading}', sans-serif`,
        '--brand-font-body': `'${branding.fontBody}', sans-serif`,
    };

    if (branding.secondaryColor) {
        vars['--brand-secondary'] = branding.secondaryColor;
    }
    if (branding.accentColor) {
        vars['--brand-accent'] = branding.accentColor;
    }
    if (branding.luxuryAccent) {
        vars['--brand-luxury-accent'] = branding.luxuryAccent;
    }

    return vars;
}

/**
 * Validate that a section mutation is allowed by the template.
 * Returns an error message or null if valid.
 */
export function validateSectionMutation(
    templateId: TemplateId,
    action: 'add' | 'remove' | 'toggle' | 'reorder',
    sectionConfig: SectionConfig
): string | null {
    const template = getTemplateById(templateId);
    if (!template) return `Unknown template: ${templateId}`;

    if (action === 'remove' && sectionConfig.isLocked) {
        return `Cannot remove locked section "${sectionConfig.title}". This section is required by the ${template.name} template.`;
    }

    if (action === 'toggle' && sectionConfig.isLocked && sectionConfig.isVisible) {
        return `Cannot hide locked section "${sectionConfig.title}". This section is required by the ${template.name} template.`;
    }

    if (action === 'add' && !template.allowedSections.includes(sectionConfig.type)) {
        return `Section type "${sectionConfig.type}" is not allowed in the ${template.name} template.`;
    }

    return null;
}
