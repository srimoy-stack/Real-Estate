import React from 'react';
import { SectionRenderer } from '../../components/website/SectionRenderer';
import { useTemplate } from '../TemplateContext';
import * as Template from './index';

export const CommunitiesPage: React.FC = () => {
    const { pageSections } = useTemplate();
    const rawSections = pageSections?.communities || Template.structure.communities || [];
    const sections = rawSections.map((s: any, idx: number) => ({
        id: s.id || `section-communities-${idx}`,
        type: s.type,
        config: s.config,
        isVisible: true,
        order: idx
    })) as any;
    return <SectionRenderer sections={sections} components={Template as any} />;
};
