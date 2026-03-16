import { Community } from '@repo/types';
import { mockCommunities } from '../mock/communitiesMock';

export const communitiesService = {
    getCommunities: async (): Promise<Community[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockCommunities;
    },
    getCommunityBySlug: async (slug: string): Promise<Community | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockCommunities.find(c => c.slug === slug) || null;
    }
};
