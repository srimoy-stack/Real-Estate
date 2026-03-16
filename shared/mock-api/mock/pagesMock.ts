import { OrgPageLayoutConfig } from '@repo/types';

export interface MockPage {
    slug: string;
    title: string;
    layoutConfig: OrgPageLayoutConfig;
}

export const mockPages: MockPage[] = [
    {
        slug: '/',
        title: 'Home',
        layoutConfig: {
            sections: [
                { type: 'hero' as any },
                { type: 'featured_listings' as any },
                { type: 'about' as any },
                { type: 'contact' as any }
            ]
        }
    },
    {
        slug: '/listings',
        title: 'Browse Listings',
        layoutConfig: {
            sections: [
                { type: 'heading' as any, content: { text: 'Available Properties', level: 'h1' } },
                { type: 'listings' as any, filters: { status: 'ACTIVE' } },
                { type: 'newsletter' as any }
            ]
        }
    },
    {
        slug: '/about',
        title: 'About Us',
        layoutConfig: {
            sections: [
                { type: 'hero' as any, content: { headline: 'Our Team', subheadline: 'Experienced agents at your service.' } },
                { type: 'team' as any },
                { type: 'text' as any, content: { text: 'Modern Realty has been a leader in the industry for over a decade.' } }
            ]
        }
    }
];
