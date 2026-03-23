export { Header, Footer, TemplateLayout } from './layout';
export { Homepage } from './homepage';
export { AboutPage } from './about-page';
export { ContactPage } from './contact-page';
export { CommunitiesPage } from './communities-page';
export { CommunityDetailPage } from './community-detail-page';
export { ListingsPage } from './listings-page';
export { ListingDetailPage } from './listing-detail-page';
export { AgentListingPage } from './agent-listing-page';
export { AgentProfilePage } from './agent-profile-page';
export { SeoLandingPage } from './seo-landing-page';

// Modular Sections for Builder
import {
    HeroSection as Hero,
    ListingsSection as Listings,
    FeaturedListings as FeaturedListings,
    AgentSection as Agents,
    ContactSection as Contact,
    ListingDetailSection as ListingDetail,
    AgentDetailSection as AgentDetail
} from '../shared';

export { Hero, Listings, FeaturedListings, Agents, Contact, ListingDetail, AgentDetail };

export const sections = {
    // Unique sections for this template
};

export const structure = {
    homepage: [
        {
            type: 'hero',
            config: {
                headline: 'Find Your Dream Home',
                subheadline: 'Explore premium properties curated for modern living.',
                buttonText: 'Browse Listings',
                bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600'
            }
        },
        {
            type: 'featured_listings',
            config: { title: 'Featured Properties', variant: 'default' }
        },
        {
            type: 'agents',
            config: { title: 'Expertise in Every Transaction', description: 'Our team of dedicated professionals brings decades of collective experience to help you navigate the complex world of real estate.' }
        },
        {
            type: 'contact',
            config: { title: 'Ready to find your next home?', buttonLabel: 'Get In Touch' }
        }
    ],
    about: [
        {
            type: 'hero',
            config: {
                headline: 'About Modern Realty',
                subheadline: 'Redefining the real estate experience through innovation and excellence.',
                bgImage: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1600'
            }
        },
        {
            type: 'stats',
            config: {
                title: 'By The Numbers',
                stats: [
                    { value: '$2.5B+', label: 'Total Sales' },
                    { value: '15k+', label: 'Happy Clients' },
                    { value: '25+', label: 'Toronto Neighborhoods' },
                    { value: '98%', label: 'Retention Rate' }
                ]
            }
        },
        {
            type: 'agents',
            config: { title: 'Lead with Experience', secondary: true }
        }
    ],
    listings: [
        {
            type: 'hero',
            config: {
                headline: 'Our Listings',
                subheadline: 'Discover the most exclusive properties in the Greater Toronto Area.',
                bgImage: 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&q=80&w=1600'
            }
        },
        {
            type: 'listings',
            config: { limit: 12 }
        }
    ],
    'listing-detail': [
        {
            type: 'listing_detail',
            config: {}
        },
        {
            type: 'featured_listings',
            config: { title: 'Similar Properties' }
        }
    ],
    agents: [
        {
            type: 'hero',
            config: {
                headline: 'Expert Guidance',
                subheadline: 'Meet the professionals who make your real estate dreams a reality.',
                bgImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1600'
            }
        },
        {
            type: 'agents',
            config: { title: 'Our World-Class Team' }
        }
    ],
    'agent-detail': [
        {
            type: 'agent_detail',
            config: {}
        },
        {
            type: 'featured_listings',
            config: { title: 'My Active Listings' }
        }
    ],
    contact: [
        {
            type: 'contact_cta',
            config: {
                title: 'Get In Touch',
                subtitle: 'We are here to help you with all your real estate needs.',
                buttonLabel: 'Send Message'
            }
        }
    ],
    communities: [
        {
            type: 'hero',
            config: {
                headline: 'Explore Our Communities',
                subheadline: 'Detailed guides to the most vibrant neighborhoods in the Greater Toronto Area.',
                bgImage: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&q=80&w=1600'
            }
        },
        {
            type: 'communities',
            config: {
                title: 'Toronto Neighborhoods',
                communities: [
                    { name: 'Liberty Village', description: 'A vibrant tech and creative hub.', imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=800' },
                    { name: 'The Annex', description: 'Historic homes and academic atmosphere.', imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Distillery District', description: 'Pedestrian-only 19th-century village.', imageUrl: 'https://images.unsplash.com/photo-1549410141-866416597792?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Yorkville', description: 'Luxury shopping, dining, and residences.', imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800' }
                ]
            }
        }
    ],
    'community-detail': [
        {
            type: 'community_detail',
            config: {}
        },
        {
            type: 'featured_listings',
            config: { title: 'Nearby Listings' }
        }
    ]
};
