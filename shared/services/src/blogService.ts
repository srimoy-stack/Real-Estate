import { blogService as mockApi } from '../../mock-api/services/blogService';

export const blogService = {
    getPosts: async () => {
        return await mockApi.getPosts();
    },
    getPostBySlug: async (slug: string) => {
        return await mockApi.getPostBySlug(slug);
    }
};
