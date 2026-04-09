import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { orgWebsiteService } from '@repo/services';
import { notFound } from 'next/navigation';
import { ModernSectionRenderer } from '@/components/section-renderer';
import { Metadata } from 'next';
import { seoEngine } from '@repo/modules/website-builder/SeoEngine';

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const website = getWebsiteFromHeaders() as any;
    if (!website) return {};

    const page = await orgWebsiteService.getPageBySlug(website.organizationId, website.websiteId, params.slug);
    if (!page) return {};

    // Use our new SEO engine for dynamic fallback logic
    const generated = seoEngine.generateDynamicSeo(page as any, website?.name || 'Prestige Realty');

    const seo = (page as any).seo || {};
    const auto = seo.autoGenerate !== false;

    const title = auto ? generated.title : (seo.title || page.title);
    const description = auto ? generated.description : seo.description;

    const domain = website?.domain || 'squareft.com';
    const baseUrl = `https://${domain}`;

    return {
        title,
        description,
        alternates: {
            canonical: seo.canonical || `${baseUrl}/${params.slug === '/' ? '' : params.slug}`,
        },
        openGraph: {
            title,
            description,
            images: website?.brandingConfig?.logoUrl ? [{ url: website.brandingConfig.logoUrl }] : [],
            type: 'website',
            url: `${baseUrl}/${params.slug === '/' ? '' : params.slug}`,
        },
        robots: {
            index: !seo.noIndex,
            follow: !seo.noIndex,
        }
    };
}


export default async function DynamicPage({ params }: PageProps) {
    const website = getWebsiteFromHeaders() as any;
    if (!website) return notFound();

    const { slug } = params;

    // Fetch the page dynamically from orgWebsiteService
    const page = await orgWebsiteService.getPageBySlug(website.organizationId, website.websiteId, slug);

    if (!page || !page.isPublic) {
        return notFound();
    }

    // Generate enriched JSON-LD Schema (Organization, Breadcrumb, Listing)
    const schemaJson = seoEngine.generateSchemaMarkup(page as any, website);

    return (
        <div className="space-y-12 pb-24 h-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: schemaJson }}
            />

            {/* Page Header */}
            <header className="py-20 bg-slate-50 border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        {page.title}
                    </h1>
                </div>
            </header>

            {/* Section Placeholders (SectionRenderer to be implemented later by user request) */}
            <ModernSectionRenderer layoutConfig={page.layoutConfig as any} />
        </div>
    );
}
