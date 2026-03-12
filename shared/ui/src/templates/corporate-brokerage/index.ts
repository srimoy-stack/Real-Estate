export { Header, Footer, TemplateLayout } from './layout';
export { Homepage } from './homepage';
export { ListingsPage } from './listings-page';
export { ListingDetailPage } from './listing-detail-page';

// Modular Sections for Builder
import { HeroSection as UIHero, FeaturedListings as UIListings, AgentSection as UIAgents, ContactSection as UIContact } from '../shared';
import React from 'react';

export const Hero = (props: any) => React.createElement(UIHero, { variant: 'corporate', ...props });
export const Listings = (props: any) => React.createElement(UIListings, { variant: 'corporate', ...props });
export const Agents = (props: any) => React.createElement(UIAgents, { variant: 'corporate', ...props });
export const Contact = (props: any) => React.createElement(UIContact, { variant: 'corporate', ...props });
