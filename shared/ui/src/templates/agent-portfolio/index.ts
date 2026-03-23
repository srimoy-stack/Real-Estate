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
import { AgentHero, AgentHero as Hero } from './agent-hero';
import { AgentBio, AgentBio as Agents } from './agent-bio';
import { ListingCard } from './listing-card';
import { FeaturedListings, FeaturedListings as Listings } from './FeaturedListings';
import { CommunitiesSection } from './communities-section';
import { Testimonials } from './testimonials';
import { ContactSection as Contact } from './contact-section';
import { ListingDetailSection as ListingDetail, AgentDetailSection as AgentDetail } from '../shared';

export {
    AgentHero,
    AgentBio,
    ListingCard,
    Testimonials,
    CommunitiesSection,
    Hero,
    Agents,
    FeaturedListings,
    Listings,
    Contact,
    ListingDetail,
    AgentDetail
};

export const sections = {
    // Unique sections for this template (not in global toolbox)
    CommunitiesSection: CommunitiesSection,
};

export const structure = {
    homepage: [
        { type: 'hero', config: { title: 'Find Your Dream Home', subtitle: 'Leading with integrity and performance', variant: 'agent' } },
        { type: 'agents', config: { title: 'Expert Professional Real Estate Advisor', variant: 'agent' } },
        { type: 'featured_listings', config: { title: 'Featured Listings', variant: 'agent' } },
        { type: 'communities', config: { title: 'Explore Communities' } },
        { type: 'testimonials', config: { title: 'Client Testimonials' } },
        { type: 'contact', config: { title: 'Ready to work together?', variant: 'agent' } }
    ],
    'community-detail': [
        { type: 'community_detail', config: { variant: 'agent' } },
        { type: 'featured_listings', config: { title: 'Personalized Portfolio', variant: 'agent' } }
    ],
    about: [
        { type: 'hero', config: { headline: 'About Me', subheadline: 'Passion meets expertise in real estate.', variant: 'agent' } },
        { type: 'agents', config: { title: 'Professional Real Estate Advisor', variant: 'agent' } },
        { type: 'testimonials', config: { title: 'Client Success Stories' } }
    ],
    listings: [
        { type: 'hero', config: { headline: 'My Listings', subheadline: 'Properties I am proud to represent.', variant: 'agent' } },
        { type: 'listings', config: { limit: 12, variant: 'agent' } }
    ],
    'listing-detail': [
        { type: 'listing_detail', config: { variant: 'agent' } },
        { type: 'featured_listings', config: { title: 'Other Exclusive Properties', variant: 'agent' } }
    ],
    agents: [
        { type: 'hero', config: { headline: 'Our Team', subheadline: 'A powerhouse of real estate expertise.', variant: 'agent' } },
        { type: 'agents', config: { title: 'Meet the Professionals', variant: 'agent' } }
    ],
    'agent-detail': [
        { type: 'agent_detail', config: { variant: 'agent' } },
        { type: 'featured_listings', config: { title: 'My Track Record', variant: 'agent' } }
    ],
    contact: [
        { type: 'contact', config: { title: 'Get In Touch', subtitle: 'I\'d love to hear from you.', variant: 'agent' } }
    ],
    communities: [
        { type: 'hero', config: { headline: 'My Service Areas', subheadline: 'Neighbourhoods I know best.', variant: 'agent' } },
        { type: 'communities', config: { title: 'GTA Neighbourhoods' } }
    ]
};
