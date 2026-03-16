import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedListings } from '@/components/sections/FeaturedListings';
import { PropertyCategories } from '@/components/sections/PropertyCategories';
import { CommunitiesSection } from '@/components/sections/CommunitiesSection';
import { CTASection } from '@/components/sections/CTASection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { ContactSection } from '@/components/sections/ContactSection';

export default async function HomePage() {
  const website = getWebsiteFromHeaders();
  if (!website) return null;

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <FeaturedListings />
      <PropertyCategories />
      <CommunitiesSection />
      <CTASection />
      <TestimonialsSection />
      <BlogSection />
      <ContactSection />
    </>
  );
}
