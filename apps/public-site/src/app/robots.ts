import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function robots(): MetadataRoute.Robots {
    const headersList = headers();
    const domain = headersList.get('host') || 'localhost';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${domain}`;

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/_next/', '/search/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
