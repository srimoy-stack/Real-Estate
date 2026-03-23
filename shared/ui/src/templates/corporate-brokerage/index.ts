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
import { HeroSection as UIHero, FeaturedListings as UIListings, AgentSection as UIAgents, ContactSection as UIContact, ListingDetailSection as UIListingDetail, AgentDetailSection as UIAgentDetail } from '../shared';
import React from 'react';

export const Hero = (props: any) => React.createElement(UIHero, { variant: 'corporate', ...props });
export const Listings = (props: any) => React.createElement(UIListings, { variant: 'corporate', ...props });
export const FeaturedListings = (props: any) => React.createElement(UIListings, { variant: 'corporate', ...props });
export const Agents = (props: any) => React.createElement(UIAgents, { variant: 'corporate', ...props });
export const Contact = (props: any) => React.createElement(UIContact, { variant: 'corporate', ...props });
export const ListingDetail = (props: any) => React.createElement(UIListingDetail, { variant: 'corporate', ...props });
export const AgentDetail = (props: any) => React.createElement(UIAgentDetail, { variant: 'corporate', ...props });

export const sections = {
    // Unique sections for this template
};

export const structure = {
    homepage: [
        { type: 'hero', config: { title: 'Excellence in Corporate Real Estate', variant: 'corporate' } },
        { type: 'featured_listings', config: { title: 'Premium Portfolio', variant: 'corporate' } },
        { type: 'text', config: { title: 'Local Expertise, Global Reach' } },
        { type: 'agents', config: { title: 'Our Advisors', variant: 'corporate' } },
        { type: 'contact', config: { title: 'Partner with Us', variant: 'corporate' } }
    ],
    about: [
        {
            type: 'hero',
            config: {
                headline: 'Excellence Through Experience',
                subheadline: 'A global leader in professional real estate advisory services.',
                bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600',
                variant: 'corporate'
            }
        },
        {
            type: 'stats',
            config: {
                title: 'Market Leadership',
                stats: [
                    { value: '50+', label: 'Years in Business' },
                    { value: '$100B+', label: 'Transaction Volume' },
                    { value: '1000+', label: 'Certified Advisors' },
                    { value: 'Global', label: 'Network Reach' }
                ]
            }
        }
    ],
    listings: [
        {
            type: 'hero',
            config: {
                headline: 'Brokerage Listings',
                subheadline: 'Strategic acquisition opportunities for institutional and private investors.',
                bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600',
                variant: 'corporate'
            }
        },
        {
            type: 'listings',
            config: { limit: 12, variant: 'corporate' }
        }
    ],
    'listing-detail': [
        { type: 'listing_detail', config: { variant: 'corporate' } },
        { type: 'featured_listings', config: { title: 'Similar Opportunities', variant: 'corporate' } }
    ],
    agents: [
        {
            type: 'hero',
            config: {
                headline: 'Strategic Advisors',
                subheadline: 'Our multidisciplinary team delivers results across all asset classes.',
                bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600',
                variant: 'corporate'
            }
        },
        {
            type: 'agents',
            config: { title: 'Meet our Advisors', variant: 'corporate' }
        }
    ],
    'agent-detail': [
        { type: 'agent_detail', config: { variant: 'corporate' } },
        { type: 'featured_listings', config: { title: 'Active Mandates', variant: 'corporate' } }
    ],
    contact: [
        {
            type: 'contact_cta',
            config: {
                title: 'Corporate Headquarters',
                subtitle: 'Professional inquiries and partnership opportunities.',
                buttonLabel: 'Contact Headquarters',
                variant: 'corporate'
            }
        }
    ],
    communities: [
        {
            type: 'hero',
            config: {
                headline: 'Market Intelligence Guides',
                subheadline: 'Strategic insights into the GTA\'s most profitable markets.',
                bgImage: 'https://images.unsplash.com/photo-1497366750747-37048770ed94?auto=format&fit=crop&q=80&w=1600',
                variant: 'corporate'
            }
        },
        {
            type: 'communities',
            config: {
                title: 'Strategic Markets',
                communities: [
                    { name: 'Financial District', description: 'The power center of Canadian commerce.', imageUrl: 'https://images.unsplash.com/photo-1514229988170-2cbe2a4a2eec?auto=format&fit=crop&q=80&w=800' },
                    { name: 'North York CBD', description: 'A major corporate hub with excellent connectivity.', imageUrl: 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?auto=format&fit=crop&q=80&w=800' }
                ]
            }
        }
    ],
    'community-detail': [
        { type: 'community_detail', config: { variant: 'corporate' } },
        { type: 'featured_listings', config: { title: 'Market Mandates', variant: 'corporate' } }
    ]
};
