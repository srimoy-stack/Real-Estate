// Layout & Navigation
export { Header, Footer, TemplateLayout } from './layout';

// Pages
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

// Individual Components (for granular use)
import { LuxuryHero, LuxuryHero as Hero } from './luxury-hero';
import { LuxuryListingCard } from './luxury-listing-card';
import { FeaturedLuxuryListings, FeaturedLuxuryListings as Listings, FeaturedLuxuryListings as FeaturedListings } from './featured-luxury-listings';
import { PropertyGallery } from './property-gallery';
import { AgentSpotlight, AgentSpotlight as Agents } from './agent-spotlight';
import { Testimonials } from './testimonials';
import { LuxuryFooter, LuxuryFooter as Contact } from './footer';
import { ListingDetailSection as ListingDetail, AgentDetailSection as AgentDetail } from '../shared';

export {
    LuxuryHero,
    LuxuryListingCard,
    FeaturedLuxuryListings,
    PropertyGallery,
    AgentSpotlight,
    Testimonials,
    LuxuryFooter,
    Hero,
    Listings,
    FeaturedListings,
    Agents,
    Contact,
    ListingDetail,
    AgentDetail
};

export const sections = {
    // Unique sections for this template
    PropertyGallery: PropertyGallery,
};

export const structure = {
    homepage: [
        { type: 'hero', config: { title: 'The Pinnacle of Luxury Living', variant: 'luxury' } },
        { type: 'featured_listings', config: { title: 'Curated Collection', variant: 'luxury' } },
        { type: 'gallery', config: { title: 'Exquisite Details' } },
        { type: 'agents', config: { title: 'The Art of Discretion', variant: 'luxury' } },
        { type: 'testimonials', config: { title: 'Kind Words' } },
        { type: 'contact', config: { title: 'Schedule a Private Consultation', variant: 'luxury' } }
    ],
    about: [
        {
            type: 'hero',
            config: {
                headline: 'The Luxury Estate Legacy',
                subheadline: 'A tradition of excellence in the world\'s most prestigious markets.',
                bgImage: 'https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=1600',
                variant: 'luxury'
            }
        },
        {
            type: 'about_banner',
            config: {
                title: 'Unrivaled Expertise',
                description: 'For over three decades, Luxury Estate has been the definitive authority on premium residential real estate. We understand that luxury is not just a price point—it is a lifestyle, an inheritance, and a statement.',
                imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=800'
            }
        },
        {
            type: 'stats',
            config: {
                title: 'Our Global Presence',
                stats: [
                    { value: '$12B+', label: 'Lifetime Sales' },
                    { value: '45', label: 'Global Offices' },
                    { value: '250+', label: 'Luxury Partners' },
                    { value: '1', label: 'Standard of Excellence' }
                ]
            }
        }
    ],
    listings: [
        {
            type: 'hero',
            config: {
                headline: 'Exquisite Listings',
                subheadline: 'An exclusive collection of the world\'s most beautiful homes.',
                bgImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600',
                variant: 'luxury'
            }
        },
        {
            type: 'listings',
            config: { limit: 12, variant: 'luxury' }
        }
    ],
    'listing-detail': [
        {
            type: 'listing_detail',
            config: { variant: 'luxury' }
        },
        {
            type: 'featured_listings',
            config: { title: 'Related Estates', variant: 'luxury' }
        }
    ],
    agents: [
        {
            type: 'hero',
            config: {
                headline: 'World Class Representation',
                subheadline: 'Connecting high-net-worth individuals with extraordinary properties.',
                bgImage: 'https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=1600',
                variant: 'luxury'
            }
        },
        {
            type: 'agents',
            config: { title: 'Our Global Advisors', variant: 'luxury' }
        }
    ],
    'agent-detail': [
        {
            type: 'agent_detail',
            config: { variant: 'luxury' }
        },
        {
            type: 'featured_listings',
            config: { title: 'Exclusive Portfolio', variant: 'luxury' }
        }
    ],
    contact: [
        {
            type: 'contact_cta',
            config: {
                title: 'Private Inquiries',
                subtitle: 'Request a discreet consultation regarding your real estate portfolio.',
                buttonLabel: 'Request Consultation',
                variant: 'luxury'
            }
        },
        {
            type: 'about_banner',
            config: {
                title: 'Flagship Gallery',
                description: '100 Yorkville Ave, Toronto, ON M5R 1B9\nConcierge: (416) 555-0888\nEmail: private@luxuryestate.ca',
                imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800'
            }
        }
    ],
    communities: [
        {
            type: 'hero',
            config: {
                headline: 'Elite Destinations',
                subheadline: 'An insider\'s look at the most exclusive enclaves.',
                bgImage: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=1600',
                variant: 'luxury'
            }
        },
        {
            type: 'communities',
            config: {
                title: 'Prestige Neighborhoods',
                communities: [
                    { name: 'Bridle Path', description: 'The most prestigious residential address in Canada.', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Forest Hill', description: 'Timeless elegance and some of the country\'s finest schools.', imageUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Rosedale', description: 'A peaceful oasis of heritage homes and lush ravines.', imageUrl: 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Oakville South', description: 'Magnificent lakefront estates and a charming heritage downtown.', imageUrl: 'https://images.unsplash.com/photo-1512915922686-57c11f9ad6b3?auto=format&fit=crop&q=80&w=800' }
                ]
            }
        }
    ],
    'community-detail': [
        { type: 'community_detail', config: { variant: 'luxury' } },
        { type: 'featured_listings', config: { title: 'Estate Selection', variant: 'luxury' } }
    ]
};
