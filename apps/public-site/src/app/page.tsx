import { getWebsiteFromHeaders } from '@/lib/tenant/getWebsiteFromHeaders';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedListings } from '@/components/sections/FeaturedListings';
import { PropertyCategories } from '@/components/sections/PropertyCategories';
import { CommunitiesSection } from '@/components/sections/CommunitiesSection';
import { CTASection } from '@/components/sections/CTASection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { BlogSection } from '@/components/sections/BlogSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { orgWebsiteService } from '@repo/services';
import { Metadata } from 'next';


export async function generateMetadata(): Promise<Metadata> {
  const website = getWebsiteFromHeaders() as any;
  if (!website) return {};

  const page = await orgWebsiteService.getPageBySlug(website.tenantId, website.websiteId, '/');

  const seo = page?.seo || website.seo;

  const title = seo?.metaTitle || website.seo?.defaultTitle || 'Skyline Estates';
  const description = seo?.metaDescription || website.seo?.defaultDescription;
  const domain = website.domain || 'skyline-estates.com';

  return {
    title: title,
    description: description,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : (website.seo?.ogImage ? [{ url: website.seo.ogImage }] : []),
      type: 'website',
      url: `https://${domain}`,
    },
    alternates: {
      canonical: seo?.canonicalUrl || `https://${domain}`,
    }
  };
}


export default async function HomePage() {
  const website = getWebsiteFromHeaders() as any;
  if (!website) return null;

  const { brandName, seo, domain } = website;

  const page = await orgWebsiteService.getPageBySlug(website.tenantId, website.websiteId, '/');

  const pageSeo = page?.seo;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': pageSeo?.schemaType || 'RealEstateAgent',
    name: pageSeo?.metaTitle || seo?.defaultTitle || brandName,
    description: pageSeo?.metaDescription || seo?.defaultDescription,
    url: `https://${domain || 'skyline-estates.com'}`,
    logo: `https://${domain || 'skyline-estates.com'}${website.branding?.logoUrl || '/logo.png'}`,
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
