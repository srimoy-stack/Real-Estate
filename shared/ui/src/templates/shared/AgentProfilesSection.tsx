import React from 'react';
import { AgentSection } from './AgentSection';

export interface AgentProfilesSectionProps {
    title?: string;
    description?: string;
    content?: {
        title?: string;
        description?: string;
    };
}

export const AgentProfilesSection: React.FC<AgentProfilesSectionProps> = ({
    title,
    description,
    content
}) => {
    return (
        <AgentSection
            title={content?.title || title}
            subtitle={content?.description || description}
        />
    );
};
