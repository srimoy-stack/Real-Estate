import { BaseEntity } from './index';

// ═══════════════════════════════════════════════════════════
//  ORGANIZATION WEBSITE
//  Represents the main website of a brokerage or individual
//  real estate agent. Initially configured by Super Admin
//  through template assignment. Client Admin manages and
//  customizes the website.
// ═══════════════════════════════════════════════════════════

export type OrgWebsiteStatus = 'ACTIVE' | 'DRAFT' | 'SUSPENDED' | 'PROVISIONING';

export interface OrgWebsite extends BaseEntity {
    organizationId: string;
    domain: string;
    templateId: string;
    templateName: string;
    organizationName: string;
    status: OrgWebsiteStatus;
}

// ═══════════════════════════════════════════════════════════
//  ORGANIZATION WEBSITE PAGES
//  Pages managed by client admin. Each page stores layout
//  configuration as JSON.
// ═══════════════════════════════════════════════════════════

export type OrgPageSectionType = 'hero' | 'text' | 'listings' | 'agent_profiles' | 'gallery' | 'testimonials' | 'contact' | 'cta';

export interface OrgPageSectionConfig {
    type: OrgPageSectionType;
    /** Optional reference to a specific configuration (e.g. featuredListings) */
    configId?: string;
}

export interface OrgPageLayoutConfig {
    sections: OrgPageSectionConfig[];
}

export interface OrgWebsitePage extends BaseEntity {
    websiteId: string;
    slug: string;
    title: string;
    layoutConfig: OrgPageLayoutConfig;
    customLayoutJson?: string;
    isPublished: boolean;
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
