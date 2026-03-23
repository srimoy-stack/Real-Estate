import type {
    WebsiteConfig,
    TemplateId,
    BrandingConfig,
    NavigationConfig,
    WebsiteSeoConfig,
} from './website';
import { getTemplateById } from './templates';

// ═══════════════════════════════════════════════════════════
//  WEBSITE CONFIG FACTORY
//  Generates a default WebsiteConfig from a template.
//  Called during tenant onboarding / provisioning.
// ═══════════════════════════════════════════════════════════

interface ProvisionOptions {
    tenantId: string;
    domain: string;
    brandName: string;
    templateId: TemplateId;
    logoUrl?: string;
}

/**
 * Create a fresh WebsiteConfig for a newly provisioned tenant.
 * Deep-clones the template's default sections so each tenant
 * gets an independent copy they can safely mutate.
 */
export function createWebsiteConfig(options: ProvisionOptions): WebsiteConfig {
    const template = getTemplateById(options.templateId);
    if (!template) {
        throw new Error(`Template "${options.templateId}" not found in registry.`);
    }

    const now = new Date().toISOString();

    const defaultBranding: BrandingConfig = {
        mode: options.templateId,
        primaryColor: options.templateId === 'luxury-estate' ? '#0F172A' : '#2563EB',
        fontHeading: 'Inter',
        fontBody: 'Inter',
        logoUrl: options.logoUrl ?? '/images/logo-placeholder.png',
    };

    const defaultNavigation: NavigationConfig = {
        headerLinks: [
            { id: 'nav-home', label: 'Home', href: '/', isExternal: false, order: 0, isVisible: true },
            { id: 'nav-listings', label: 'Listings', href: '/listings', isExternal: false, order: 1, isVisible: true },
            { id: 'nav-about', label: 'About', href: '/about', isExternal: false, order: 2, isVisible: true },
            { id: 'nav-contact', label: 'Contact', href: '/contact', isExternal: false, order: 3, isVisible: true },
        ],
        footerLinks: [
            { id: 'foot-privacy', label: 'Privacy Policy', href: '/privacy', isExternal: false, order: 0, isVisible: true },
            { id: 'foot-terms', label: 'Terms of Service', href: '/terms', isExternal: false, order: 1, isVisible: true },
        ],
        footerColumns: [],
    };

    const defaultSeo: WebsiteSeoConfig = {
        defaultTitle: options.brandName,
        titleTemplate: `%s | ${options.brandName}`,
        defaultDescription: `Premium real estate services by ${options.brandName}. Browse listings, schedule viewings, and find your dream home.`,
        keywords: ['real estate', 'homes for sale', 'listings', options.brandName.toLowerCase()],
        metaTags: {},
    };

    // Deep-clone default sections from template
    const homepageSections = JSON.parse(
        JSON.stringify(template.defaultHomepageSections)
    );

    return {
        id: `wsc_${options.tenantId}`,
        websiteId: `ws_${options.tenantId}`,
        tenantId: options.tenantId,
        domain: options.domain,
        brandName: options.brandName,
        status: 'PROVISIONING',
        templateId: options.templateId,
        branding: defaultBranding,
        homepage: {
            sections: homepageSections,
        },
        pages: [],
        navigation: defaultNavigation,
        seo: defaultSeo,
        createdAt: now,
        updatedAt: now,
    };
}
