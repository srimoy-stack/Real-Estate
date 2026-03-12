'use client';

import React from 'react';
import {
    HeroSection,
    TextSection,
    ImageSection,
    ListingsSection,
    AgentProfilesSection,
    ContactSection
} from '@repo/ui';

interface SectionConfig {
    type: string;
    props?: any;
    content?: any;
    filters?: any;
    limit?: number;
    text?: string;
    url?: string;
    caption?: string;
}

interface SectionRendererProps {
    layoutConfig: {
        sections: SectionConfig[];
    };
}

export const ModernSectionRenderer: React.FC<SectionRendererProps> = ({ layoutConfig }) => {
    if (!layoutConfig || !layoutConfig.sections) {
        return null;
    }

    return (
        <div className="flex flex-col">
            {layoutConfig.sections.map((section, index) => {
                // Map simplified JSON types to components
                // Handle both 'content' prop and direct properties for flexibility
                switch (section.type) {
                    case 'HeroSection':
                    case 'hero':
                        return <HeroSection key={index} content={section.content || section.props?.content || {}} />;

                    case 'TextSection':
                    case 'text':
                        return <TextSection key={index} text={section.text || section.props?.text || ''} />;

                    case 'ImageSection':
                    case 'image':
                        return <ImageSection key={index} url={section.url || section.props?.url || ''} caption={section.caption || section.props?.caption} />;

                    case 'ListingsSection':
                    case 'listings':
                        return (
                            <ListingsSection
                                key={index}
                                content={section.content || section.props?.content || {}}
                                filters={section.filters || section.props?.filters}
                                limit={section.limit || section.props?.limit}
                            />
                        );

                    case 'AgentProfilesSection':
                    case 'agents':
                        return <AgentProfilesSection key={index} content={section.content || section.props?.content || {}} />;

                    case 'ContactSection':
                    case 'contact':
                        return <ContactSection key={index} content={section.content || section.props?.content || {}} />;

                    default:
                        console.warn(`[ModernSectionRenderer] Unknown section type: ${section.type}`);
                        return null;
                }
            })}
        </div>
    );
};
