import React from 'react';
import { SectionRenderer } from '../../components/website/SectionRenderer';
import { useTemplate } from '../TemplateContext';
import * as Template from './index';
import { Listing } from '@repo/types';

export const ListingDetailPage: React.FC<{ listing?: Listing }> = ({ listing }) => {
    const { pageSections } = useTemplate();
    const rawSections = pageSections?.['listing-detail'] || Template.structure['listing-detail'] || [];
    const sections = rawSections.map((s: any, idx: number) => ({
        id: s.id || `section-listing-detail-${idx}`,
        type: s.type,
        config: s.config,
        isVisible: true,
        order: idx
    })) as any;
    return <SectionRenderer sections={sections} components={Template as any} context={{ listing }} />;
};
