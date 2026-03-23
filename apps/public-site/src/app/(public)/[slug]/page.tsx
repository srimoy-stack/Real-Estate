import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { orgWebsiteService } from '@repo/services';
import { notFound } from 'next/navigation';
import { ModernSectionRenderer } from '@/components/section-renderer';
import { Metadata } from 'next';

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const website = getWebsiteFromHeaders() as any;
    if (!website) return {};

    const page = await orgWebsiteService.getPageBySlug('org-1', 'ws_brokerage_001', params.slug);
    if (!page) return {};

    const seo = page.seo;
    const title = seo?.metaTitle || page.title;
    const description = seo?.metaDescription;

    const domain = website?.domain || 'skyline-estates.com';
    const baseUrl = `https://${domain}`;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: seo?.canonicalUrl || `${baseUrl}/${params.slug === '/' ? '' : params.slug}`,
        },
        openGraph: {
            title: seo?.ogTitle || title,
            description: seo?.ogDescription || description,
            images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
            type: 'website',
            url: `${baseUrl}/${params.slug === '/' ? '' : params.slug}`,
        },
        robots: {
            index: !seo?.noIndex,
            follow: !seo?.noIndex,
        }
    };
}


export default async function DynamicPage({ params }: PageProps) {
    const website = getWebsiteFromHeaders();
    if (!website) return notFound();

    const { slug } = params;

    // Fetch the page dynamically from orgWebsiteService
    const page = await orgWebsiteService.getPageBySlug(website.tenantId, website.websiteId, slug);

    if (!page || !page.isPublished) {
        return notFound();
    }

    const jsonLd = page.seo?.schemaType ? {
        '@context': 'https://schema.org',
        '@type': page.seo.schemaType,
        name: page.seo.metaTitle || page.title,
        description: page.seo.metaDescription,
        url: `https://${website.domain || 'skyline-estates.com'}/${slug === '/' ? '' : slug}`,
    } : null;


    return (
        <div className="space-y-12 pb-24">
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}

            {/* Page Header */}
            <header className="py-20 bg-slate-50 border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        {page.title}
                    </h1>
                </div>
            </header>

            {/* Section Placeholders (SectionRenderer to be implemented later by user request) */}
            <ModernSectionRenderer layoutConfig={page.layoutConfig as any} />
        </div>
    );
}
