import React from 'react';
import { SectionRenderer } from '../../components/website/SectionRenderer';
import { useTemplate } from '../TemplateContext';
import * as Template from './index';

export const ListingsPage: React.FC = () => {
    const { pageSections } = useTemplate();
    const rawSections = pageSections?.listings || Template.structure.listings || [];
    const sections = rawSections.map((s: any, idx: number) => ({
        id: s.id || `section-listings-${idx}`,
        type: s.type,
        config: s.config,
        isVisible: true,
        order: idx
    })) as any;
    return <SectionRenderer sections={sections} components={Template as any} />;
};
