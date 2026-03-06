import { BaseEntity } from './index';

// ═══════════════════════════════════════════════════════════
//  TEMPLATE SYSTEM
//  Templates are platform-defined. Tenants CANNOT modify them.
//  They serve as the "blueprint" for a tenant website.
// ═══════════════════════════════════════════════════════════

export type TemplateId = 'modern' | 'classic' | 'luxury';

export interface TemplateDefinition {
    id: TemplateId;
    name: string;
    description: string;
    /** Preview thumbnail shown in template picker */
    thumbnailUrl: string;
    /** Sections that MUST appear and cannot be removed */
    lockedSections: SectionType[];
    /** All sections allowed in this template */
    allowedSections: SectionType[];
    /** Default homepage section layout when a tenant first provisions */
    defaultHomepageSections: SectionConfig[];
    /** Header visual style */
    headerStyle: 'solid' | 'transparent' | 'gradient';
    /** Footer visual style */
    footerStyle: 'simple' | 'columns' | 'minimal';
    /** Listing page layout used on /listings */
    listingPageLayout: 'grid' | 'list' | 'map-split';
}

// ═══════════════════════════════════════════════════════════
//  SECTION SYSTEM
//  Sections are the building blocks of the homepage.
//  Templates define which sections are allowed & locked.
//  Tenants can reorder, toggle visibility, and edit content
//  of non-locked sections.
// ═══════════════════════════════════════════════════════════

export type SectionType =
    | 'hero'
    | 'featured_listings'
    | 'how_it_works'
    | 'testimonials'
    | 'stats'
    | 'contact_cta'
    | 'blog_preview'
    | 'newsletter'
    | 'about_banner'
    | 'gallery';

export interface SectionConfig {
    id: string;
    type: SectionType;
    title: string;
    /** Whether this section renders on the live site */
    isVisible: boolean;
    /** Locked sections cannot be deleted or moved past boundaries */
    isLocked: boolean;
    /** Section-specific content payload */
    content: SectionContent;
    /** Display order (0-indexed) */
    order: number;
}

/**
 * Strongly-typed section content variants.
 * Each section type has its own content shape.
 */
export type SectionContent =
    | HeroContent
    | FeaturedListingsContent
    | HowItWorksContent
    | TestimonialsContent
    | StatsContent
    | ContactCtaContent
    | BlogPreviewContent
    | NewsletterContent
    | AboutBannerContent
    | GalleryContent;

export interface HeroContent {
    _type: 'hero';
    headline: string;
    subheadline: string;
    buttonText?: string;
    buttonHref?: string;
    bgImage?: string;
    overlayOpacity?: number;
}

export interface FeaturedListingsContent {
    _type: 'featured_listings';
    title: string;
    subtitle?: string;
    maxItems: number;
    /** If empty, platform auto-selects featured listings */
    listingIds?: string[];
}

export interface HowItWorksContent {
    _type: 'how_it_works';
    title: string;
    steps: Array<{
        icon: string;
        heading: string;
        description: string;
    }>;
}

export interface TestimonialsContent {
    _type: 'testimonials';
    title: string;
    testimonials: Array<{
        id: string;
        name: string;
        role?: string;
        quote: string;
        avatarUrl?: string;
        rating?: number;
    }>;
}

export interface StatsContent {
    _type: 'stats';
    title: string;
    stats: Array<{
        label: string;
        value: string;
    }>;
}

export interface ContactCtaContent {
    _type: 'contact_cta';
    title: string;
    description?: string;
    buttonLabel: string;
    buttonHref: string;
}

export interface BlogPreviewContent {
    _type: 'blog_preview';
    title: string;
    subtitle?: string;
    maxPosts: number;
}

export interface NewsletterContent {
    _type: 'newsletter';
    title: string;
    subtitle?: string;
    placeholder: string;
    buttonLabel: string;
}

export interface AboutBannerContent {
    _type: 'about_banner';
    title: string;
    description: string;
    imageUrl?: string;
    buttonText?: string;
    buttonHref?: string;
}

export interface GalleryContent {
    _type: 'gallery';
    title: string;
    images: Array<{
        url: string;
        caption?: string;
    }>;
    layout: 'grid' | 'masonry' | 'carousel';
}

// ═══════════════════════════════════════════════════════════
//  PAGE BLOCK SYSTEM
//  Pages are tenant-created custom pages (About, Contact, etc.)
//  Blocks are the content units within pages.
// ═══════════════════════════════════════════════════════════

export type BlockType = 'text' | 'image' | 'text_image' | 'cta' | 'gallery' | 'video';

export interface PageBlock {
    id: string;
    type: BlockType;
    content: BlockContent;
    order: number;
}

/**
 * Strongly-typed block content variants.
 */
export type BlockContent =
    | TextBlockContent
    | ImageBlockContent
    | TextImageBlockContent
    | CtaBlockContent
    | GalleryBlockContent
    | VideoBlockContent;

export interface TextBlockContent {
    _type: 'text';
    text: string;
}

export interface ImageBlockContent {
    _type: 'image';
    url: string;
    alt: string;
    caption?: string;
}

export interface TextImageBlockContent {
    _type: 'text_image';
    text: string;
    imageUrl: string;
    imageAlt: string;
    layout: 'image-left' | 'image-right';
}

export interface CtaBlockContent {
    _type: 'cta';
    label: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline';
}

export interface GalleryBlockContent {
    _type: 'gallery';
    images: Array<{
        url: string;
        alt: string;
        caption?: string;
    }>;
}

export interface VideoBlockContent {
    _type: 'video';
    url: string;
    platform: 'youtube' | 'vimeo' | 'custom';
    posterUrl?: string;
}

// ═══════════════════════════════════════════════════════════
//  CUSTOM PAGES
//  Tenant-created pages (About, Contact, Services, etc.)
// ═══════════════════════════════════════════════════════════

export interface CustomPage extends BaseEntity {
    tenantId: string;
    title: string;
    slug: string;
    blocks: PageBlock[];
    seo: PageSeoConfig;
    isPublished: boolean;
    /** Order in which the page appears in page lists */
    sortOrder: number;
}

// ═══════════════════════════════════════════════════════════
//  NAVIGATION
//  Tenant-controlled header and footer navigation.
//  Supports nested menus and external links.
// ═══════════════════════════════════════════════════════════

export interface NavLink {
    id: string;
    label: string;
    href: string;
    /** If true, opens in new tab */
    isExternal: boolean;
    /** Display order */
    order: number;
    /** Whether this link is visible */
    isVisible: boolean;
    /** Nested children for dropdown menus */
    children?: NavLink[];
}

export interface NavigationConfig {
    headerLinks: NavLink[];
    footerLinks: NavLink[];
    /** Footer columns for multi-column footer layouts */
    footerColumns?: FooterColumn[];
}

export interface FooterColumn {
    id: string;
    title: string;
    links: NavLink[];
}

// ═══════════════════════════════════════════════════════════
//  SEO
//  Site-level and per-page SEO configuration.
// ═══════════════════════════════════════════════════════════

export interface WebsiteSeoConfig {
    defaultTitle: string;
    /** Title template for pages, e.g. "%s | Brand Name" */
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
    ogImage?: string;
    googleAnalyticsId?: string;
    /** Additional meta tags as key-value pairs */
    metaTags: Record<string, string>;
}

export interface PageSeoConfig {
    title: string;
    description: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
}

// ═══════════════════════════════════════════════════════════
//  BRANDING
//  Tenant branding overrides applied on top of template.
// ═══════════════════════════════════════════════════════════

export type ThemeMode = 'classic' | 'modern' | 'luxury';

export interface BrandingConfig {
    /** Theme mode (must match templateId in most cases) */
    mode: ThemeMode;
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    /** e.g. Gold #C8A951 for luxury templates */
    luxuryAccent?: string;
    fontHeading: string;
    fontBody: string;
    logoUrl: string;
    faviconUrl?: string;
    tagline?: string;
    socialLinks?: SocialLinksConfig;
}

export interface SocialLinksConfig {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
}

// ═══════════════════════════════════════════════════════════
//  ROOT WEBSITE CONFIGURATION
//  This is the SINGLE configuration object per tenant.
//  The public site reads this and renders everything.
// ═══════════════════════════════════════════════════════════

export interface WebsiteConfig extends BaseEntity {
    /** Unique website identifier */
    websiteId: string;
    /** Owning tenant */
    tenantId: string;
    /** Custom domain (e.g., skyline-estates.com) */
    domain: string;
    /** Display name shown in header / branding */
    brandName: string;
    /** Status drives middleware gating */
    status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
    /** Which template this website uses */
    templateId: TemplateId;
    /** Tenant branding overrides */
    branding: BrandingConfig;
    /** Homepage section configuration */
    homepage: {
        sections: SectionConfig[];
    };
    /** Custom pages created by tenant */
    pages: CustomPage[];
    /** Header & footer navigation */
    navigation: NavigationConfig;
    /** Site-level SEO settings */
    seo: WebsiteSeoConfig;
}
