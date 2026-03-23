import React from 'react';
import { SectionRenderer } from '../../components/website/SectionRenderer';
import { useTemplate } from '../TemplateContext';
import * as Template from './index';

interface SeoLandingPageProps {
    config?: {
        city?: string;
        propertyType?: string;
        metaTitle?: string;
        metaDescription?: string;
        heading?: string;
        subheading?: string;
    };
}

export const SeoLandingPage: React.FC<SeoLandingPageProps> = ({ config }) => {
    const { pageSections } = useTemplate();
    const city = config?.city || 'Toronto';
    const propertyType = config?.propertyType || 'Homes';
    const heading = config?.heading || `${propertyType} for Sale in ${city}`;
    const subheading = config?.subheading || `Discover the latest ${propertyType.toLowerCase()} listings in ${city}.`;

    const rawSections = pageSections?.['seo-landing'] || [
        {
            type: 'hero',
            config: {
                headline: heading,
                subheadline: subheading,
                variant: 'corporate' // Default for SEO landing
            }
        },
        {
            type: 'listings',
            config: {
                title: 'Featured Inventory',
                city: config?.city,
                propertyType: config?.propertyType
            }
        },
        {
            type: 'contact_cta',
            config: {
                title: 'Market Consultation',
                subtitle: `Reach out for exclusive insights on the ${city} real estate market.`
            }
        }
    ];

    const sections = rawSections.map((s: any, idx: number) => ({
        id: s.id || `section-seo-${idx}`,
        type: s.type,
        config: s.config,
        isVisible: true,
        order: idx
    })) as any;

    return <SectionRenderer sections={sections} components={Template as any} context={{ config }} />;
};
