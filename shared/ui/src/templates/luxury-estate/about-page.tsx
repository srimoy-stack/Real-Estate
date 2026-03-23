'use client';

import React from 'react';

import { SectionRenderer } from '../../components/website/SectionRenderer';
import { useTemplate } from '../TemplateContext';
import * as Template from './index';

export const AboutPage: React.FC = () => {
    const { pageSections } = useTemplate();

    // Use builder/database sections if available, otherwise template default
    const rawSections = pageSections?.about || Template.structure.about || [];

    // Convert to format for SectionRenderer
    const sections = rawSections.map((s: any, idx: number) => ({
        id: s.id || `section-about-${idx}`,
        type: s.type,
        config: s.config,
        isVisible: true,
        order: idx
    })) as any;

    return <SectionRenderer sections={sections} components={Template as any} />;
};
