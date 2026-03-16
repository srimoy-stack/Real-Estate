import { mockBlogPosts, BlogPost } from '../mock/blogMock';

export const blogService = {
    getPosts: async (): Promise<BlogPost[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockBlogPosts;
    },
    getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockBlogPosts.find(p => p.slug === slug) || null;
    }
};
