import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { getVisibleSections } from '@repo/types';
import { SectionRenderer } from '@repo/ui';

export default function HomePage() {
  const website = getWebsiteFromHeaders();
  if (!website) return null;

  const { brandName, seo, domain } = website;
  const visibleSections = getVisibleSections(website);

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionRenderer sections={visibleSections} />
    </>
  );
}
