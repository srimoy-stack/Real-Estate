import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { getVisibleSections } from '@repo/types';
import { SectionRenderer } from '@repo/ui';
import { orgWebsiteService } from '@repo/services';
import { ModernSectionRenderer } from '@/components/section-renderer';

export default async function HomePage() {
  const website = getWebsiteFromHeaders();
  if (!website) return null;

  // Try to fetch dynamic Home page
  const dynamicHomePage = await orgWebsiteService.getPageBySlug(website.tenantId, website.websiteId, '/');

  const { brandName, seo, domain } = website;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: brandName,
    description: seo.defaultDescription,
    url: `https://${domain}`,
    logo: `https://${domain}${website.branding.logoUrl}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CA',
    },
  };

  // If we have a dynamic home page, render it with placeholders as requested
  if (dynamicHomePage && dynamicHomePage.isPublished) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ModernSectionRenderer layoutConfig={dynamicHomePage.layoutConfig as any} />
      </>
    );
  }

  // Fallback to existing functionality
  const visibleSections = getVisibleSections(website);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionRenderer sections={visibleSections} organizationId={website.tenantId} />
    </>
  );
}
