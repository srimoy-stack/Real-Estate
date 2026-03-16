import { mockPages } from '../mock/pagesMock';
import { OrgWebsitePage } from '@repo/types';

export const pagesService = {
    getPageBySlug: async (slug: string): Promise<OrgWebsitePage | null> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));

        // Handle "/" vs "" slug
        const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
        const finalSlug = normalizedSlug === '//' ? '/' : normalizedSlug;

        const page = mockPages.find(p => p.slug === finalSlug || p.slug === slug);
        if (!page) return null;

        return {
            id: `page-${Math.random().toString(36).substr(2, 9)}`,
            websiteId: 'ws-1',
            slug: page.slug,
            title: page.title,
            layoutConfig: page.layoutConfig as any,
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
};
