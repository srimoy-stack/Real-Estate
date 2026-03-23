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

export const Hero = (props: any) => React.createElement(UIHero, { variant: 'minimal', ...props });
export const Listings = (props: any) => React.createElement(UIListings, { variant: 'minimal', ...props });
export const FeaturedListings = (props: any) => React.createElement(UIListings, { variant: 'minimal', ...props });
export const Agents = (props: any) => React.createElement(UIAgents, { variant: 'minimal', ...props });
export const Contact = (props: any) => React.createElement(UIContact, { variant: 'minimal', ...props });
export const ListingDetail = (props: any) => React.createElement(UIListingDetail, { variant: 'minimal', ...props });
export const AgentDetail = (props: any) => React.createElement(UIAgentDetail, { variant: 'minimal', ...props });

export const sections = {
    // Unique sections for this template
};

export const structure = {
    homepage: [
        { type: 'hero', config: { title: 'Find Your Space', variant: 'minimal' } },
        { type: 'featured_listings', config: { title: 'Selected Properties', variant: 'minimal' } },
        { type: 'text', config: { title: 'Our Philosophy' } },
        { type: 'contact', config: { title: 'Get in Touch', variant: 'minimal' } }
    ],
    about: [
        {
            type: 'hero',
            config: {
                headline: 'Less is More',
                subheadline: 'A minimalist approach to modern living and real estate.',
                bgImage: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1600',
                variant: 'minimal'
            }
        },
        {
            type: 'about_banner',
            config: {
                title: 'Our Simple Goal',
                description: 'We remove the noise from the real estate process. No gimmicks, just quality homes and honest representation.',
                imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800'
            }
        }
    ],
    listings: [
        {
            type: 'hero',
            config: {
                headline: 'Pure Space',
                subheadline: 'A handpicked selection of exceptional homes.',
                bgImage: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1600',
                variant: 'minimal'
            }
        },
        {
            type: 'listings',
            config: { limit: 12, variant: 'minimal' }
        }
    ],
    'listing-detail': [
        { type: 'listing_detail', config: { variant: 'minimal' } },
        { type: 'featured_listings', config: { title: 'Similar Spaces', variant: 'minimal' } }
    ],
    agents: [
        {
            type: 'hero',
            config: {
                headline: 'Pure Representation',
                subheadline: 'Meet the team behind our minimalist approach.',
                bgImage: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1600',
                variant: 'minimal'
            }
        },
        {
            type: 'agents',
            config: { title: 'Our Team', variant: 'minimal' }
        }
    ],
    'agent-detail': [
        { type: 'agent_detail', config: { variant: 'minimal' } },
        { type: 'featured_listings', config: { title: 'Recent Success', variant: 'minimal' } }
    ],
    contact: [
        {
            type: 'contact_cta',
            config: {
                title: 'Start a Conversation',
                subtitle: 'Reach out for tailored real estate advice.',
                buttonLabel: 'Say Hello',
                variant: 'minimal'
            }
        }
    ],
    communities: [
        {
            type: 'hero',
            config: {
                headline: 'Local Life',
                subheadline: 'Quietly brilliant neighborhoods.',
                bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1600',
                variant: 'minimal'
            }
        },
        {
            type: 'communities',
            config: {
                title: 'Selected Areas',
                communities: [
                    { name: 'Leslieville', description: 'Toronto\'s cozy, creative east end.', imageUrl: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Roncesvalles', description: 'A tight-knit community with European charm.', imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=800' }
                ]
            }
        }
    ],
    'community-detail': [
        { type: 'community_detail', config: { variant: 'minimal' } },
        { type: 'featured_listings', config: { title: 'Selected Spaces', variant: 'minimal' } }
    ]
};
