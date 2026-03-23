'use client';

import React from 'react';
import { renderSection } from '@repo/modules/website-builder';

interface SectionRendererProps {
    layoutConfig: {
        sections: any[];
    };
}

/**
 * ModernSectionRenderer component for rendering CMS-driven site layouts.
 * It uses the shared renderSection utility to maintain consistency with the builder.
 */
export const ModernSectionRenderer: React.FC<SectionRendererProps> = ({ layoutConfig }) => {
    if (!layoutConfig || !layoutConfig.sections) {
        return null;
    }

    return (
        <div className="flex flex-col">
            {layoutConfig.sections.map((section, index) => {
                // Return common renderSection logic from shared module
                return (
                    <React.Fragment key={section.id || index}>
                        {renderSection(section)}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ModernSectionRenderer;
