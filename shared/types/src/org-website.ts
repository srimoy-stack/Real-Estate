import { BaseEntity } from './index';

// ═══════════════════════════════════════════════════════════
//  ORGANIZATION WEBSITE
//  Represents the main website of a brokerage or individual
//  real estate agent. Initially configured by Super Admin
//  through template assignment. Client Admin manages and
//  customizes the website.
// ═══════════════════════════════════════════════════════════

export type OrgWebsiteStatus = 'ACTIVE' | 'DRAFT' | 'SUSPENDED' | 'PROVISIONING';

/** A single navigation menu item, optionally containing nested children (submenus). */
export interface OrgNavItem {
    label: string;
    slug: string;
    children?: OrgNavItem[];
}

export interface OrgWebsite extends BaseEntity {
    organizationId: string;
    domain: string;
    templateId: string;
    templateName: string;
    organizationName: string;
    status: OrgWebsiteStatus;
    navigation?: OrgNavItem[];
    seo?: any;
    brandingConfig?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════
//  ORGANIZATION WEBSITE PAGES
//  Pages managed by client admin. Each page stores layout
//  configuration as JSON.
// ═══════════════════════════════════════════════════════════

export type OrgPageSectionType =
    | 'hero' | 'text' | 'listings' | 'agent_profiles' | 'gallery'
    | 'testimonials' | 'contact' | 'cta' | 'heading' | 'spacer'
    | 'divider' | 'button' | 'video' | 'stats' | 'faq'
    | 'newsletter' | 'map' | 'image' | 'agents' | 'about'
    | 'communities' | 'blog' | 'footer' | 'listing-detail' | 'agent-detail' | 'featured_listings';

export interface OrgPageSectionConfig {
    id?: string;
    type: OrgPageSectionType;
    /** Optional reference to a specific configuration (e.g. featuredListings) */
    configId?: string;
    /** Optional filter config for listing sections */
    filters?: Record<string, any>;
    /** Optional content overrides */
    content?: Record<string, any>;
    /** Optional limit for list sections */
    limit?: number;
    /**
     * Optional dynamic configuration for this section.
     * Supports future per-section settings (e.g. layout variants, theme overrides).
     * Defaults to {} when not provided — existing sections are unaffected.
     */
    config?: Record<string, any>;
}

export interface OrgPageLayoutConfig {
    sections: OrgPageSectionConfig[];
}

import { PageSeoConfig } from './website';

export type OrgWebsitePageType = 'static' | 'listing' | 'agent';

export interface OrgWebsitePage extends BaseEntity {
    websiteId: string;
    slug: string;
    title: string;
    pageType: OrgWebsitePageType;
    layoutConfig: OrgPageLayoutConfig;
    customLayoutJson?: string;
    seo?: PageSeoConfig;
    isPublished: boolean;
    isPublic: boolean;
    overrideSections?: boolean;
}

// ═══════════════════════════════════════════════════════════
//  ORGANIZATION WEBSITE BRANDING
//  Stored separately so template layout remains intact.
// ═══════════════════════════════════════════════════════════

export interface OrgWebsiteBranding extends BaseEntity {
    websiteId: string;
    organizationId: string;
    logo: string;
    bannerImages: string[];
    brandColors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    siteTitle: string;
}

// ═══════════════════════════════════════════════════════════
//  WEBSITE AGENT PROFILES
//  Controls which agents appear on the organization website.
// ═══════════════════════════════════════════════════════════

export interface WebsiteAgentProfile extends BaseEntity {
    websiteId: string;
    organizationId: string;
    name: string;
    photo: string;
    bio: string;
    phone: string;
    email: string;
    /** Display order on the website */
    displayOrder: number;
    isVisible: boolean;
}
