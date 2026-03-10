import type { TemplateDefinition, SectionConfig } from './website';

// ═══════════════════════════════════════════════════════════
//  TEMPLATE REGISTRY
//  Platform-defined templates. Tenants select one during
//  onboarding and CANNOT modify the template itself.
//  They only customize the configuration derived from it.
// ═══════════════════════════════════════════════════════════

const modernSections: SectionConfig[] = [
    {
        id: 'hero-default',
        type: 'hero',
        title: 'Hero Banner',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'hero',
            headline: 'Your New Home Awaits',
            subheadline: 'Discover the most exclusive properties in the region.',
            buttonText: 'Browse Listings',
            buttonHref: '/listings',
            overlayOpacity: 0.4,
        },
        order: 0,
    },
    {
        id: 'featured-default',
        type: 'featured_listings',
        title: 'Featured Collections',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'featured_listings',
            title: 'Featured Collections',
            subtitle: 'Hand-picked premium listings in your area.',
            maxItems: 6,
        },
        order: 1,
    },
    {
        id: 'stats-default',
        type: 'stats',
        title: 'Market Impact',
        isVisible: true,
        isLocked: false,
        content: {
            _type: 'stats',
            title: 'Market Impact',
            stats: [
                { label: 'Properties Sold', value: '1.2k+' },
                { label: 'Happy Clients', value: '850+' },
                { label: 'Awards Won', value: '42' },
                { label: 'Active Listings', value: '150+' },
            ],
        },
        order: 2,
    },
    {
        id: 'how-it-works-default',
        type: 'how_it_works',
        title: 'How It Works',
        isVisible: true,
        isLocked: false,
        content: {
            _type: 'how_it_works',
            title: 'How It Works',
            steps: [
                { icon: '🔍', heading: 'Search', description: 'Browse our curated collection of premium properties.' },
                { icon: '📋', heading: 'Schedule', description: 'Book a private viewing at your convenience.' },
                { icon: '🏠', heading: 'Move In', description: 'Close the deal and start your new chapter.' },
            ],
        },
        order: 3,
    },
    {
        id: 'cta-default',
        type: 'contact_cta',
        title: 'Call to Action',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'contact_cta',
            title: 'Ready to find your dream home?',
            description: 'Join thousands of families who found their home with us.',
            buttonLabel: 'Contact Us Today',
            buttonHref: '/contact',
        },
        order: 4,
    },
];

const luxurySections: SectionConfig[] = [
    {
        id: 'hero-luxury',
        type: 'hero',
        title: 'Hero Banner',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'hero',
            headline: 'Exceptional Estates',
            subheadline: 'Curated luxury real estate for the discerning buyer.',
            buttonText: 'View Portfolio',
            buttonHref: '/listings',
            overlayOpacity: 0.5,
        },
        order: 0,
    },
    {
        id: 'featured-luxury',
        type: 'featured_listings',
        title: 'Exclusive Properties',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'featured_listings',
            title: 'Exclusive Properties',
            subtitle: 'A curated selection for high-net-worth individuals.',
            maxItems: 4,
        },
        order: 1,
    },
    {
        id: 'testimonials-luxury',
        type: 'testimonials',
        title: 'Client Stories',
        isVisible: true,
        isLocked: false,
        content: {
            _type: 'testimonials',
            title: 'Client Stories',
            testimonials: [],
        },
        order: 2,
    },
    {
        id: 'about-luxury',
        type: 'about_banner',
        title: 'About',
        isVisible: true,
        isLocked: false,
        content: {
            _type: 'about_banner',
            title: 'Bespoke Advisory',
            description: 'With decades of experience in luxury real estate, we provide unmatched service and discretion.',
            buttonText: 'Learn More',
            buttonHref: '/about',
        },
        order: 3,
    },
    {
        id: 'cta-luxury',
        type: 'contact_cta',
        title: 'Book a Consultation',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'contact_cta',
            title: 'Exclusive Advisory',
            description: 'Bespoke real estate services tailored to your lifestyle.',
            buttonLabel: 'Book a Consultation',
            buttonHref: '/consultation',
        },
        order: 4,
    },
];

const classicSections: SectionConfig[] = [
    {
        id: 'hero-classic',
        type: 'hero',
        title: 'Hero Banner',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'hero',
            headline: 'Find Your Perfect Home',
            subheadline: 'Your trusted partner in real estate since 1985.',
            buttonText: 'Start Searching',
            buttonHref: '/listings',
            overlayOpacity: 0.35,
        },
        order: 0,
    },
    {
        id: 'featured-classic',
        type: 'featured_listings',
        title: 'Featured Listings',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'featured_listings',
            title: 'Featured Listings',
            subtitle: 'The best properties on the market right now.',
            maxItems: 6,
        },
        order: 1,
    },
    {
        id: 'stats-classic',
        type: 'stats',
        title: 'Our Track Record',
        isVisible: true,
        isLocked: false,
        content: {
            _type: 'stats',
            title: 'Our Track Record',
            stats: [
                { label: 'Years in Business', value: '40+' },
                { label: 'Homes Sold', value: '5,000+' },
                { label: 'Agents', value: '120' },
                { label: 'Offices', value: '8' },
            ],
        },
        order: 2,
    },
    {
        id: 'newsletter-classic',
        type: 'newsletter',
        title: 'Newsletter',
        isVisible: true,
        isLocked: false,
        content: {
            _type: 'newsletter',
            title: 'Stay Updated',
            subtitle: 'Get the latest listings and market insights delivered to your inbox.',
            placeholder: 'Enter your email',
            buttonLabel: 'Subscribe',
        },
        order: 3,
    },
    {
        id: 'cta-classic',
        type: 'contact_cta',
        title: 'Get in Touch',
        isVisible: true,
        isLocked: true,
        content: {
            _type: 'contact_cta',
            title: 'Ready to make a move?',
            description: 'Our experienced agents are here to help you every step of the way.',
            buttonLabel: 'Contact an Agent',
            buttonHref: '/contact',
        },
        order: 4,
    },
];

// ─── Template Definitions ──────────────────────────

export const TEMPLATE_MODERN_REALTY: TemplateDefinition = {
    id: 'modern-realty',
    name: 'Modern Realty',
    description: 'Clean, bold design with strong typography. Perfect for teams.',
    thumbnailUrl: '/images/templates/modern-thumb.png',
    lockedSections: ['hero', 'featured_listings', 'contact_cta'],
    allowedSections: [
        'hero', 'featured_listings', 'how_it_works', 'stats',
        'contact_cta', 'testimonials', 'blog_preview', 'newsletter',
        'about_banner', 'gallery', 'communities',
    ],
    defaultHomepageSections: modernSections,
    headerStyle: 'solid',
    footerStyle: 'columns',
    listingPageLayout: 'grid',
};

export const TEMPLATE_LUXURY_ESTATE: TemplateDefinition = {
    id: 'luxury-estate',
    name: 'Luxury Estate',
    description: 'Elegant layout with gold accents. Ideal for luxury agents.',
    thumbnailUrl: '/images/templates/luxury-thumb.png',
    lockedSections: ['hero', 'featured_listings', 'contact_cta'],
    allowedSections: [
        'hero', 'featured_listings', 'testimonials', 'about_banner',
        'contact_cta', 'gallery', 'stats', 'communities',
    ],
    defaultHomepageSections: luxurySections,
    headerStyle: 'transparent',
    footerStyle: 'minimal',
    listingPageLayout: 'grid',
};

export const TEMPLATE_CORPORATE_BROKERAGE: TemplateDefinition = {
    id: 'corporate-brokerage',
    name: 'Corporate Brokerage',
    description: 'Traditional, trustworthy look for large offices.',
    thumbnailUrl: '/images/templates/classic-thumb.jpg',
    lockedSections: ['hero', 'featured_listings', 'contact_cta'],
    allowedSections: [
        'hero', 'featured_listings', 'stats', 'how_it_works',
        'contact_cta', 'newsletter', 'blog_preview', 'testimonials',
    ],
    defaultHomepageSections: classicSections,
    headerStyle: 'solid',
    footerStyle: 'columns',
    listingPageLayout: 'list',
};

export const TEMPLATE_AGENT_PORTFOLIO: TemplateDefinition = {
    id: 'agent-portfolio',
    name: 'Agent Portfolio',
    description: 'Personalized design to showcase individual agent performance.',
    thumbnailUrl: '/images/templates/agent-thumb.png',
    lockedSections: ['hero', 'featured_listings'],
    allowedSections: ['hero', 'featured_listings', 'testimonials', 'contact_cta', 'stats', 'communities'],
    defaultHomepageSections: modernSections,
    headerStyle: 'transparent',
    footerStyle: 'minimal',
    listingPageLayout: 'grid',
};

export const TEMPLATE_MINIMAL_REALTY: TemplateDefinition = {
    id: 'minimal-realty',
    name: 'Minimal Realty',
    description: 'Clean, high-performance design for speed and simplicity.',
    thumbnailUrl: '/images/templates/minimal-thumb.jpg',
    lockedSections: ['hero', 'featured_listings'],
    allowedSections: ['hero', 'featured_listings', 'newsletter', 'contact_cta'],
    defaultHomepageSections: modernSections,
    headerStyle: 'solid',
    footerStyle: 'minimal',
    listingPageLayout: 'list',
};

// ─── Template Registry ─────────────────────────────

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
    'modern-realty': TEMPLATE_MODERN_REALTY,
    'luxury-estate': TEMPLATE_LUXURY_ESTATE,
    'corporate-brokerage': TEMPLATE_CORPORATE_BROKERAGE,
    'agent-portfolio': TEMPLATE_AGENT_PORTFOLIO,
    'minimal-realty': TEMPLATE_MINIMAL_REALTY,
};

/**
 * Look up a template by ID.
 * Returns undefined if not found.
 */
export function getTemplateById(id: string): TemplateDefinition | undefined {
    return TEMPLATE_REGISTRY[id];
}

/**
 * Get all available templates.
 */
export function getAllTemplates(): TemplateDefinition[] {
    return Object.values(TEMPLATE_REGISTRY);
}
