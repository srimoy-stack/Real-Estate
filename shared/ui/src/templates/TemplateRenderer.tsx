'use client';

import React from 'react';
import { Listing } from '@repo/types';

// Template imports
import * as ModernRealty from './modern-realty';
import * as LuxuryEstate from './luxury-estate';
import * as AgentPortfolio from './agent-portfolio';
import * as CorporateBrokerage from './corporate-brokerage';
import * as MinimalRealty from './minimal-realty';

export type TemplateName =
    | 'modern-realty'
    | 'luxury-estate'
    | 'agent-portfolio'
    | 'corporate-brokerage'
    | 'minimal-realty';

export type PageType = 'homepage' | 'listings' | 'listing-detail';

interface TemplateModule {
    TemplateLayout: React.FC<{ children: React.ReactNode }>;
    Homepage: React.FC;
    ListingsPage: React.FC;
    ListingDetailPage: React.FC<{ listing?: Listing }>;
    Header: React.FC;
    Footer: React.FC;
    // Section Components for Builder
    Hero?: React.FC<any>;
    Listings?: React.FC<any>;
    Agents?: React.FC<any>;
    Contact?: React.FC<any>;
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

    const { TemplateLayout, Homepage, ListingsPage, ListingDetailPage } = mod;

    const renderPage = () => {
        switch (page) {
            case 'homepage':
                return <Homepage />;
            case 'listings':
                return <ListingsPage />;
            case 'listing-detail':
                return <ListingDetailPage listing={listing} />;
            default:
                return <Homepage />;
        }
    };

    return (
        <TemplateLayout>
            {renderPage()}
        </TemplateLayout>
    );
};

// Re-export everything for direct access
export { templateRegistry };
export type { TemplateModule };
