import { blogService as mockApi } from '../../mock-api/services/blogService';
import { BlogPost, BlogCategory } from '@repo/types';

export const blogService = {
    getPosts: async (tenantId?: string): Promise<BlogPost[]> => {
        return await mockApi.getPosts(tenantId);
    },
    getPostById: async (id: string): Promise<BlogPost | null> => {
        return await mockApi.getPostById(id);
    },
    getPostBySlug: async (tenantId: string, slug: string): Promise<BlogPost | null> => {
        return await mockApi.getPostBySlug(tenantId, slug);
    },
    createPost: async (post: Partial<BlogPost>): Promise<BlogPost> => {
        return await mockApi.createPost(post);
    },
    updatePost: async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
        return await mockApi.updatePost(id, updates);
    },
    deletePost: async (id: string): Promise<void> => {
        return await mockApi.deletePost(id);
    },
    getCategories: async (tenantId: string): Promise<BlogCategory[]> => {
        return await mockApi.getCategories(tenantId);
    },
    createCategory: async (category: Partial<BlogCategory>): Promise<BlogCategory> => {
        return await mockApi.createCategory(category);
    }
};
