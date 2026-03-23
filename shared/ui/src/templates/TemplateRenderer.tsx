'use client';

import React from 'react';
import { Listing } from '@repo/types';

// Template imports
import * as ModernRealty from './modern-realty';
import * as LuxuryEstate from './luxury-estate';
import * as AgentPortfolio from './agent-portfolio';
import * as CorporateBrokerage from './corporate-brokerage';
import * as MinimalRealty from './minimal-realty';
import { TemplateProvider } from './TemplateContext';

export type TemplateName =
    | 'modern-realty'
    | 'luxury-estate'
    | 'agent-portfolio'
    | 'corporate-brokerage'
    | 'minimal-realty';

export type PageType =
    | 'homepage'
    | 'about'
    | 'listings'
    | 'listing-detail'
    | 'agents'
    | 'agent-detail'
    | 'communities'
    | 'community-detail'
    | 'contact'
    | 'seo-landing';

interface TemplateModule {
    FeaturedListings: React.FC<any>;
    TemplateLayout: React.FC<{ children: React.ReactNode }>;
    Homepage: React.FC;
    AboutPage: React.FC;
    ListingsPage: React.FC;
    ListingDetailPage: React.FC<{ listing?: Listing }>;
    AgentListingPage?: React.FC;
    AgentProfilePage?: React.FC<{ agent?: any }>;
    AgentDetailPage?: React.FC<{ agent?: any }>;
    CommunitiesPage: React.FC;
    CommunityDetailPage?: React.FC<{ community?: any }>;
    ContactPage: React.FC;
    SeoLandingPage?: React.FC<{ config?: any }>;
    Header: React.FC;
    Footer: React.FC;
    // Section Components for Builder
    Hero?: React.FC<any>;
    Listings?: React.FC<any>;
    Agents?: React.FC<any>;
    Contact?: React.FC<any>;
    // Data representation of the template structure
    structure?: {
        homepage: any[];
        [page: string]: any[];
    };
    sections?: Record<string, React.FC<any>>;
}

const templateRegistry: Record<TemplateName, TemplateModule> = {
    'modern-realty': ModernRealty,
    'luxury-estate': LuxuryEstate,
    'agent-portfolio': AgentPortfolio,
    'corporate-brokerage': CorporateBrokerage,
    'minimal-realty': MinimalRealty,
};

interface TemplateRendererProps {
    template: TemplateName;
    page?: PageType;
    listing?: Listing;
    agent?: any;
    community?: any;
    seoConfig?: any;
    pageSections?: Record<string, any[]>;
    navigation?: any[];
    organizationName?: string;
    branding?: any;
    onNavigate?: (slug: string) => void;
}

/**
 * Dynamic template renderer.
 * Usage: <TemplateRenderer template="modern-realty" page="homepage" />
 * Usage: <TemplateRenderer template="luxury-estate" page="listing-detail" listing={someListing} />
 */
export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
    template,
    page = 'homepage',
    listing,
    agent,
    community,
    seoConfig,
    pageSections,
    navigation,
    organizationName,
    branding,
    onNavigate,
}) => {
    const mod = templateRegistry[template];

    if (!mod) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Template Not Found</h1>
                    <p className="text-slate-400 mt-2">The template "{template}" does not exist.</p>
                </div>
            </div>
        );
    }

    const { TemplateLayout, Homepage, AboutPage, ListingsPage, ListingDetailPage, CommunitiesPage, ContactPage } = mod;

    const renderPage = () => {
        switch (page) {
            case 'homepage':
                return <Homepage />;
            case 'about':
                return <AboutPage />;
            case 'listings':
                return <ListingsPage />;
            case 'listing-detail':
                return <ListingDetailPage listing={listing} />;
            case 'agents':
                return mod.AgentListingPage ? <mod.AgentListingPage /> : <Homepage />;
            case 'agent-detail':
                return (mod.AgentProfilePage
                    ? <mod.AgentProfilePage agent={agent} />
                    : mod.AgentDetailPage
                        ? <mod.AgentDetailPage agent={agent} />
                        : <Homepage />);
            case 'communities':
                return <CommunitiesPage />;
            case 'community-detail':
                return mod.CommunityDetailPage ? <mod.CommunityDetailPage community={community} /> : <CommunitiesPage />;
            case 'contact':
                return <ContactPage />;
            case 'seo-landing':
                return mod.SeoLandingPage ? <mod.SeoLandingPage config={seoConfig} /> : <ListingsPage />;
            default:
                return <Homepage />;
        }
    };

    return (
        <TemplateProvider
            templateId={template}
            pageSections={pageSections}
            navigation={navigation}
            onNavigate={onNavigate}
            organizationName={organizationName}
            branding={branding}
            currentPageSlug={page === 'homepage' ? '/' : `/${page}`}
        >
            <TemplateLayout>
                {renderPage()}
            </TemplateLayout>
        </TemplateProvider>
    );
};

// Re-export everything for direct access
export { templateRegistry };
export type { TemplateModule };
