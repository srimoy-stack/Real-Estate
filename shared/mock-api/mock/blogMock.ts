export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    authorImage: string;
    date: string;
    category: string;
    readTime: string;
    tags: string[];
}

export const mockBlogPosts: BlogPost[] = [
    {
        id: '1',
        title: '7 Tips for First-Time Home Buyers in 2024',
        slug: 'tips-for-first-time-home-buyers',
        excerpt: 'Navigating the real estate market for the first time can be daunting. Here are our top tips to help you secure your dream home.',
        content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
        author: 'Sarah Mitchell',
        authorImage: 'https://i.pravatar.cc/150?u=sarah',
        date: 'March 10, 2024',
        category: 'Buying Guide',
        readTime: '5 min read',
        tags: ['Buying', 'First-Time', 'Finance']
    },
    {
        id: '2',
        title: 'The Rise of Modern Minimalist Architecture',
        slug: 'modern-minimalist-architecture',
        excerpt: 'Discover why more homeowners are opting for clean lines and open spaces in their next property purchase.',
        content: '<p>Minimalism is more than just a trend; it\'s a lifestyle choice that is reshaping the modern real estate landscape...</p>',
        image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800',
        author: 'Marcus Chen',
        authorImage: 'https://i.pravatar.cc/150?u=marcus',
        date: 'March 8, 2024',
        category: 'Architecture',
        readTime: '8 min read',
        tags: ['Design', 'Modern', 'Luxury']
    },
    {
        id: '3',
        title: 'How to Stage Your Home for a Quick Sale',
        slug: 'stage-your-home-for-quick-sale',
        excerpt: 'First impressions matter. Learn the professional secrets to making your home irresistible to potential buyers.',
        content: '<p>Staging your home effectively can potentially increase the selling price and decrease the time on the market...</p>',
        image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
        author: 'Julianne Reed',
        authorImage: 'https://i.pravatar.cc/150?u=julianne',
        date: 'March 5, 2024',
        category: 'Selling Guide',
        readTime: '6 min read',
        tags: ['Selling', 'Staging', 'Real Estate Tips']
    },
    {
        id: '4',
        title: 'Market Report: Regional Trends and Forecasts',
        slug: 'market-report-2024',
        excerpt: 'Stay ahead of the curve with our quarterly deep dive into current real estate market values and future projections.',
        content: '<p>The real estate market continues to evolve. In this report, we analyze the latest data from major metropolitan areas...</p>',
        image: 'https://images.unsplash.com/photo-1460472178825-e5240623abe5?auto=format&fit=crop&q=80&w=800',
        author: 'Robert Taylor',
        authorImage: 'https://i.pravatar.cc/150?u=robert',
        date: 'March 1, 2024',
        category: 'Market Trends',
        readTime: '10 min read',
        tags: ['Market', 'Finance', 'Investment']
    }
];
