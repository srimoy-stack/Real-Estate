import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { orgWebsiteService } from '@repo/services';
import { notFound } from 'next/navigation';
import { ModernSectionRenderer } from '@/components/section-renderer';

interface PageProps {
    params: {
        slug: string;
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

    return (
        <div className="space-y-12 pb-24">
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
