import { Agent } from '@repo/types';

export const mockAgents: Agent[] = [
    {
        id: 'A1',
        organizationId: 'org-1',
        name: 'Sarah Mitchell',
        slug: 'sarah-mitchell',
        title: 'Senior Realtor & Luxury Specialist',
        email: 'sarah.m@modernrealty.ca',
        phone: '(416) 555-0123',
        bio: 'With over 12 years of experience and $150M in sales volume, Sarah Mitchell provides elite real estate services across Toronto\'s most prestigious neighborhoods. Her expertise in luxury marketing and strategic negotiation has consistently delivered exceptional results for her discerning clientele.',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        licenseNumber: 'RE-2024-0012',
        city: 'Toronto',
        socialLinks: {
            linkedin: 'https://linkedin.com',
            instagram: 'https://instagram.com',
            facebook: 'https://facebook.com'
        },
        templateId: 'agent-portfolio',
        websiteStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'A2',
        organizationId: 'org-1',
        name: 'Marcus Chen',
        slug: 'marcus-chen',
        title: 'Commercial & Residential Advisor',
        email: 'm.chen@modernrealty.ca',
        phone: '(604) 555-0987',
        bio: 'Marcus is a strategic negotiator with deep roots in the Vancouver market. His approach is data-driven, ensuring his clients always get the best value, whether they are first-time buyers or seasoned commercial investors.',
        profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
        licenseNumber: 'RE-2024-0034',
        city: 'Vancouver',
        socialLinks: {
            linkedin: 'https://linkedin.com',
            twitter: 'https://twitter.com'
        },
        templateId: 'corporate-brokerage',
        websiteStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'A3',
        organizationId: 'org-1',
        name: 'Jessica Reynolds',
        slug: 'jessica-reynolds',
        title: 'Family Homes Expert',
        email: 'j.reynolds@modernrealty.ca',
        phone: '(403) 555-0456',
        bio: 'Jessica is passionate about finding the perfect homes for families. Her extensive knowledge of school districts and community amenities makes her an invaluable asset to anyone looking to settle in Calgary\'s growing suburbs.',
        profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
        licenseNumber: 'RE-2024-0056',
        city: 'Calgary',
        socialLinks: {
            instagram: 'https://instagram.com',
            facebook: 'https://facebook.com'
        },
        templateId: 'minimal-realty',
        websiteStatus: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];
