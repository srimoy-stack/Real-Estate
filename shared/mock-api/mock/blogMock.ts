import { BlogPost, BlogCategory } from '../../types/src/blog';

export const mockBlogCategories: BlogCategory[] = [
    {
        id: 'cat-1',
        tenantId: 'org-1',
        name: 'Real Estate Tips',
        slug: 'real-estate-tips',
        description: 'Practical advice for home owners and seekers.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'cat-2',
        tenantId: 'org-1',
        name: 'Market Updates',
        slug: 'market-updates',
        description: 'Stay tuned with the latest market trends.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'cat-3',
        tenantId: 'org-1',
        name: 'Buying Guides',
        slug: 'buying-guides',
        description: 'Comprehensive guides for home buyers.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'cat-4',
        tenantId: 'org-1',
        name: 'Selling Tips',
        slug: 'selling-tips',
        description: 'Tips to sell your property faster and at a better price.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    }
];

export const mockBlogPosts: BlogPost[] = [
    {
        id: 'post-1',
        tenantId: 'org-1',
        title: '7 Tips for First-Time Home Buyers in 2024',
        slug: 'tips-for-first-time-home-buyers',
        excerpt: 'Navigating the real estate market for the first time can be daunting. Here are our top tips to help you secure your dream home.',
        content: '<p>Navigating the real estate market for the first time can be daunting. Here are our top tips to help you secure your dream home.</p><h2>1. Get Pre-approved</h2><p>Before you start looking, know how much you can afford...</p>',
        featuredImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
        author: 'Sarah Mitchell',
        category: 'Buying Guides',
        tags: ['Buying', 'First-Time', 'Finance'],
        status: 'Published',
        publishedAt: '2024-03-10T10:00:00Z',
        createdAt: '2024-03-10T09:00:00Z',
        updatedAt: '2024-03-10T10:00:00Z',
        seo: {
            metaTitle: '7 Tips for First-Time Home Buyers in 2024 | Real Estate Insights',
            metaDescription: 'Essential tips for first-time home buyers in 2024. Learn about pre-approval, market trends, and more.',
        }
    },
    {
        id: 'post-2',
        tenantId: 'org-1',
        title: 'The Rise of Modern Minimalist Architecture',
        slug: 'modern-minimalist-architecture',
        excerpt: 'Discover why more homeowners are opting for clean lines and open spaces in their next property purchase.',
        content: '<p>Minimalism is more than just a trend; it\'s a lifestyle choice that is reshaping the modern real estate landscape...</p>',
        featuredImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800',
        author: 'Marcus Chen',
        category: 'Market Updates',
        tags: ['Design', 'Modern', 'Luxury'],
        status: 'Published',
        publishedAt: '2024-03-08T15:00:00Z',
        createdAt: '2024-03-08T14:00:00Z',
        updatedAt: '2024-03-08T15:00:00Z',
        seo: {
            metaTitle: 'Modern Minimalist Architecture Trend 2024',
            metaDescription: 'Exploring the growing popularity of minimalist design in modern residential real estate.',
        }
    }
];
