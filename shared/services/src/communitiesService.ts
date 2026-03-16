import { communitiesService as mockApi } from '../../mock-api/services/communitiesService';

export const communitiesService = {
    getCommunities: async () => {
        return await mockApi.getCommunities();
    },
    getCommunityBySlug: async (slug: string) => {
        return await mockApi.getCommunityBySlug(slug);
    }
};
