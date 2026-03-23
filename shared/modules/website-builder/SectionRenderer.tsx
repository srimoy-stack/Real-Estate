'use client';

import React from 'react';
import {
    HeroSection,
    ListingsSection,
    AgentProfilesSection,
    ContactSection,
    TextSection,
    ImageSection,
    HeadingSection,
    SpacerSection,
    DividerSection,
    ButtonSection,
    VideoSection,
    TestimonialsSection,
    StatsSection,
    FAQSection,
    NewsletterSection,
    GallerySection,
    MapSection,
    FeaturedListingsSection,
    ListingDetailSection,
    AgentDetailSection,
} from './CraftSections';
import { SectionConfig } from '@repo/types';

export function renderSection(section: any): React.ReactNode {
    if (!section) return null;

    const type = section.type;
    const config = section.config || {};
    const sectionId = section.id || crypto.randomUUID();

    // Map of logical types to Craft component names (for backward compat)
    const typeToComponent: Record<string, string> = {
        'hero': 'HeroSection',
        'listings': 'ListingsSection',
        'featured_listings': 'FeaturedListingsSection',
        'about': 'TextSection',
        'text': 'TextSection',
        'agentbio': 'AgentProfilesSection',
        'agent-bio': 'AgentProfilesSection',
        'communities': 'TextSection',
        'blog': 'TextSection',
        'heading': 'HeadingSection',
        'contact': 'ContactSection',
        'footer': 'ContactSection',
        'team': 'AgentProfilesSection',
        'agent_profiles': 'AgentProfilesSection',
        'agentprofilessection': 'AgentProfilesSection',
        'agents': 'AgentProfilesSection',
        'testimonials': 'TestimonialsSection',
        'image': 'ImageSection',
        'video': 'VideoSection',
        'gallery': 'GallerySection',
        'spacer': 'SpacerSection',
        'divider': 'DividerSection',
        'button': 'ButtonSection',
        'stats': 'StatsSection',
        'faq': 'FAQSection',
        'newsletter': 'NewsletterSection',
        'map': 'MapSection',
        'listing-detail': 'ListingDetailSection',
        'agent-detail': 'AgentDetailSection',
    };


    // Determine the component name to render
    const componentName = typeToComponent[type?.toLowerCase()] || type;

    // A map of all available builder components for direct lookup
    const components: Record<string, React.FC<any>> = {
        HeroSection,
        ListingsSection,
        AgentProfilesSection,
        ContactSection,
        TextSection,
        ImageSection,
        HeadingSection,
        SpacerSection,
        DividerSection,
        ButtonSection,
        VideoSection,
        TestimonialsSection,
        StatsSection,
        FAQSection,
        NewsletterSection,
        GallerySection,
        MapSection,
        FeaturedListingsSection,
        ListingDetailSection,
        AgentDetailSection,
    };

    const Component = components[componentName];

    if (Component) {
        return <Component id={sectionId} variant={section.variant} {...config} {...(section.content || {})} />;
    }

    console.warn(`SectionRenderer: Unknown section type "${type}" (resolved to "${componentName}")`);
    return null;
}


/**
 * SectionRenderer component wrapper for standard React rendering contexts.
 */
export default function SectionRenderer({ section }: { section: SectionConfig }) {
    if (!section) return null;
    return <>{renderSection(section)}</>;
}
