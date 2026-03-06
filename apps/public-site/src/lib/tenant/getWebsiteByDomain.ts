import type { WebsiteConfig } from '@repo/types';
import { createWebsiteConfig } from '@repo/types';

/**
 * Mock website registry keyed by domain.
 * In production, replace with an API call or DB lookup.
 *
 * Uses the canonical WebsiteConfig model from @repo/types.
 */

// Helper: create and then customize configs from the factory
function buildModernBrokerage(): WebsiteConfig {
  const config = createWebsiteConfig({
    tenantId: 'tenant_brokerage_001',
    domain: 'brokerage.local',
    brandName: 'Skyline Estates',
    templateId: 'modern',
    logoUrl: '/images/brokerage-logo.png',
  });
  config.status = 'ACTIVE';
  config.websiteId = 'ws_brokerage_001';
  config.branding = {
    ...config.branding,
    mode: 'modern',
    primaryColor: '#0F172A',
    accentColor: '#2563EB',
    fontHeading: 'Inter',
    fontBody: 'Inter',
  };
  config.seo = {
    ...config.seo,
    defaultTitle: 'Skyline Estates | Luxury Real Estate',
    defaultDescription: 'Discover premium properties and exclusive listings in the heart of the city.',
  };
  config.navigation = {
    ...config.navigation,
    headerLinks: [
      { id: 'nav-home', label: 'Home', href: '/', isExternal: false, order: 0, isVisible: true },
      { id: 'nav-listings', label: 'Listings', href: '/listings', isExternal: false, order: 1, isVisible: true },
      { id: 'nav-about', label: 'About Us', href: '/about', isExternal: false, order: 2, isVisible: true },
      { id: 'nav-contact', label: 'Contact', href: '/contact', isExternal: false, order: 3, isVisible: true },
    ],
    footerLinks: [
      { id: 'foot-privacy', label: 'Privacy Policy', href: '/privacy', isExternal: false, order: 0, isVisible: true },
      { id: 'foot-terms', label: 'Terms', href: '/terms', isExternal: false, order: 1, isVisible: true },
    ],
  };
  return config;
}

function buildLuxuryAgent(): WebsiteConfig {
  const config = createWebsiteConfig({
    tenantId: 'tenant_agent_001',
    domain: 'agent.local',
    brandName: 'Julianne Reed Luxury',
    templateId: 'luxury',
    logoUrl: '/images/agent-logo.png',
  });
  config.status = 'ACTIVE';
  config.websiteId = 'ws_agent_001';
  config.branding = {
    ...config.branding,
    mode: 'luxury',
    primaryColor: '#0F172A',
    luxuryAccent: '#C8A951',
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
  };
  config.seo = {
    ...config.seo,
    defaultTitle: 'Julianne Reed | Exclusive Real Estate',
    defaultDescription: 'Curated luxury estates for the discerning buyer.',
  };
  return config;
}

function buildSuspendedTenant(): WebsiteConfig {
  const config = createWebsiteConfig({
    tenantId: 'tenant_suspended_666',
    domain: 'suspended.local',
    brandName: 'Restricted Realty',
    templateId: 'modern',
  });
  config.status = 'SUSPENDED';
  config.websiteId = 'ws_suspended_666';
  return config;
}

const websiteRegistry: Record<string, WebsiteConfig> = {
  'brokerage.local': buildModernBrokerage(),
  'agent.local': buildLuxuryAgent(),
  'suspended.local': buildSuspendedTenant(),
};

/**
 * Resolve website config by domain.
 * Falls back to localhost → brokerage.local for development.
 */
export async function getWebsiteByDomain(
  domain: string
): Promise<WebsiteConfig | null> {
  const key = domain === 'localhost' ? 'brokerage.local' : domain;
  return websiteRegistry[key] ?? null;
}
