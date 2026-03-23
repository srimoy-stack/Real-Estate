import { mockBlogPosts, mockBlogCategories } from '../mock/blogMock';
import { BlogPost, BlogCategory } from '../../types/src/blog';

let posts = [...mockBlogPosts];
let categories = [...mockBlogCategories];

export const blogService = {
    getPosts: async (tenantId?: string): Promise<BlogPost[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (tenantId) {
            return posts.filter(p => p.tenantId === tenantId);
        }
        return posts;
    },
    getPostById: async (id: string): Promise<BlogPost | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return posts.find(p => p.id === id) || null;
    },
    getPostBySlug: async (tenantId: string, slug: string): Promise<BlogPost | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return posts.find(p => p.tenantId === tenantId && p.slug === slug) || null;
    },
    createPost: async (post: any): Promise<BlogPost> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newPost: BlogPost = {
            ...post,
            id: `post-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        posts.push(newPost);
        return newPost;
    },
    updatePost: async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = posts.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Post not found');
        posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() };
        return posts[index];
    },
    deletePost: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        posts = posts.filter(p => p.id !== id);
    },
    getCategories: async (tenantId: string): Promise<BlogCategory[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return categories.filter(c => c.tenantId === tenantId);
    },
    createCategory: async (category: any): Promise<BlogCategory> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newCategory: BlogCategory = {
            ...category,
            id: `cat-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        categories.push(newCategory);
        return newCategory;
    }
};
