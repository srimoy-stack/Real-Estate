import { OrgPageSectionConfig } from '@repo/types';

export const listingPageTemplate = {
    sections: [
        { type: 'listing-detail' as const, config: {} },
        { type: 'featured_listings' as const, config: { title: 'Similar Properties' }, limit: 4 }
    ]
};

export const agentPageTemplate = {
    sections: [
        { type: 'agent-detail' as const, config: {} },
        { type: 'listings' as const, config: { title: 'My Active Listings' }, limit: 6 }
    ]
};

export const pageTemplates = {
    listing: listingPageTemplate,
    agent: agentPageTemplate,
    static: { sections: [] as OrgPageSectionConfig[] }
};
