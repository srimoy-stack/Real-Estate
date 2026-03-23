import React from 'react';
import { SectionRenderer } from '../../components/website/SectionRenderer';
import { useTemplate } from '../TemplateContext';
import * as Template from './index';

export const CommunityDetailPage: React.FC<{ community?: any }> = ({ community }) => {
    const { pageSections } = useTemplate();
    const rawSections = pageSections?.['community-detail'] || [
        { type: 'community_detail', config: { variant: 'corporate' } },
        { type: 'featured_listings', config: { title: 'Market Mandates', variant: 'corporate' } }
    ];

    const sections = rawSections.map((s: any, idx: number) => ({
        id: s.id || `section-community-detail-${idx}`,
        type: s.type,
        config: s.config,
        isVisible: true,
        order: idx
    })) as any;

    return <SectionRenderer sections={sections} components={Template as any} context={{ community }} />;
};
