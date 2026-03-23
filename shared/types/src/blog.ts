import { BaseEntity } from './index';
import { PageSeoConfig } from './website';

export type BlogPostStatus = 'Draft' | 'Published';

export interface BlogPost extends BaseEntity {
    tenantId: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    author: string;
    category: string;
    tags: string[];
    status: BlogPostStatus;
    seo: PageSeoConfig;
    publishedAt?: string;
}

export interface BlogCategory extends BaseEntity {
    tenantId: string;
    name: string;
    slug: string;
    description?: string;
}
