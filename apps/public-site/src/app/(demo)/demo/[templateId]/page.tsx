import { notFound } from 'next/navigation';
import { TemplateRenderer, TemplateName } from '@/templates/TemplateRenderer';
import { TEMPLATE_REGISTRY, createWebsiteConfig } from '@repo/types';
import { WebsiteProvider } from '@/lib/tenant/website-context';

interface DemoPageProps {
    params: {
        templateId: string;
    };
}

export default function DemoPage({ params }: DemoPageProps) {
    const { templateId } = params;

    const template = TEMPLATE_REGISTRY[templateId as any];

    // Validate template exists
    if (!template) {
        return notFound();
    }

    // Create a robust mock website config for the demo that includes all required preview sections
    const mockWebsite = createWebsiteConfig({
        tenantId: 'demo_tenant',
        domain: 'demo.local',
        brandName: 'Prestige Realty Group',
        templateId: templateId as any,
    });

    // Override the homepage sections specifically for this demo to ensure all requested areas are visible
    mockWebsite.homepage.sections = [
        {
            id: 'demo-hero',
            type: 'hero',
            title: 'Hero',
            isVisible: true,
            isLocked: true,
            order: 0,
            content: {
                _type: 'hero',
                headline: 'Find Your Place in the World',
                subheadline: 'Exclusive listings and bespoke real estate services tailored to your lifestyle.',
                buttonText: 'Explore Properties',
                buttonHref: '#',
                bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600',
            }
        },
        {
            id: 'demo-listings',
            type: 'featured_listings',
            title: 'Listings',
            isVisible: true,
            isLocked: true,
            order: 1,
            content: {
                _type: 'featured_listings',
                title: 'Curated Collection',
                subtitle: 'Discover our most sought-after properties.',
                maxItems: 3,
            }
        },
        {
            id: 'demo-about',
            type: 'about_banner',
            title: 'About',
            isVisible: true,
            isLocked: true,
            order: 2,
            content: {
                _type: 'about_banner',
                title: 'Expertise You Can Trust',
                description: 'With over 20 years of experience in the local market, we provide unparalleled guidance for buyers and sellers alike. Our mission is to make your real estate journey seamless and rewarding.',
                buttonText: 'Meet Our Team',
                buttonHref: '#',
                imageUrl: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb81?auto=format&fit=crop&q=80&w=800',
            }
        },
        {
            id: 'demo-communities',
            type: 'communities',
            title: 'Communities',
            isVisible: true,
            isLocked: true,
            order: 3,
            content: {
                _type: 'communities',
                title: 'Explore Communities',
                subtitle: 'Where do you want to live?',
                communities: [
                    {
                        name: 'Forest Hill',
                        description: 'Prestigious estates and tree-lined streets.',
                        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'
                    },
                    {
                        name: 'Yorkville',
                        description: 'Luxury shopping and high-end condo living.',
                        imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600'
                    },
                    {
                        name: 'The Annex',
                        description: 'Historic charm and cultural vibrancy.',
                        imageUrl: 'https://images.unsplash.com/photo-1448630360428-65476f8a614e?auto=format&fit=crop&q=80&w=600'
                    },
                    {
                        name: 'High Park',
                        description: 'Modern residences near the city\'s largest park.',
                        imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600'
                    },
                ]
            }
        },
        {
            id: 'demo-contact',
            type: 'contact_cta',
            title: 'Contact',
            isVisible: true,
            isLocked: true,
            order: 4,
            content: {
                _type: 'contact_cta',
                title: 'Schedule a Private Viewing',
                description: 'We are here to help you find your dream home. Contact us today for a consultation.',
                buttonLabel: 'Get In Touch',
                buttonHref: '#',
            }
        }
    ];

    return (
        <WebsiteProvider website={mockWebsite}>
            <TemplateRenderer
                template={templateId as TemplateName}
                page="homepage"
            />
        </WebsiteProvider>
    );
}
