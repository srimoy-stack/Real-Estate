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
    tenantId: 'org-1',
    domain: 'brokerage.local',
    brandName: 'SquareFT',
    templateId: 'modern-realty',
    logoUrl: '/images/brokerage-logo.png',
  });
  config.status = 'ACTIVE';
  config.websiteId = 'ws_brokerage_001';
  config.branding = {
    ...config.branding,
    mode: 'modern-realty',
    primaryColor: '#0F172A',
    accentColor: '#2563EB',
    fontHeading: 'Inter',
    fontBody: 'Inter',
  };
  config.seo = {
    ...config.seo,
    defaultTitle: 'SquareFT | Luxury Real Estate',
    defaultDescription: 'Discover premium properties and exclusive listings in the heart of the city.',
  };
  config.navigation = {
    ...config.navigation,
    headerLinks: [
      // ──── ACTIVE NAV ITEMS ────────────────────────────────
      { id: 'nav-home', label: 'Home', href: '/', isExternal: false, order: 0, isVisible: true },
      { id: 'nav-buy', label: 'Buy', href: '/search?transaction=buy', isExternal: false, order: 1, isVisible: true },
      { id: 'nav-lease', label: 'Lease', href: '/search?transaction=lease&category=commercial', isExternal: false, order: 2, isVisible: true },
      { id: 'nav-sell', label: 'Sell', href: '/sell', isExternal: false, order: 3, isVisible: true },

      // ──── HIDDEN NAV ITEMS (preserved for future use — DO NOT DELETE) ──
      {
        id: 'nav-properties',
        label: 'Properties',
        href: '/search',
        isExternal: false,
        order: 10,
        isVisible: false,
        children: [
          { id: 'sub-condos', label: 'Condos', href: '/search?type=CONDO', isExternal: false, order: 0, isVisible: true },
          { id: 'sub-detached', label: 'Detached', href: '/search?type=DETACHED', isExternal: false, order: 1, isVisible: true },
        ]
      },
      { id: 'nav-map', label: 'Interactive Map', href: '/map-search', isExternal: false, order: 11, isVisible: false },
      { id: 'nav-agents', label: 'Agents', href: '/agents', isExternal: false, order: 12, isVisible: false },
      {
        id: 'nav-communities',
        label: 'Communities',
        href: '/communities',
        isExternal: false,
        order: 13,
        isVisible: false,
        children: [
          { id: 'sub-toronto', label: 'Toronto', href: '/communities/toronto', isExternal: false, order: 0, isVisible: true },
          { id: 'sub-brampton', label: 'Brampton', href: '/communities/brampton', isExternal: false, order: 1, isVisible: true },
        ]
      },
      { id: 'nav-blog', label: 'Blog', href: '/blog', isExternal: false, order: 14, isVisible: false },
      { id: 'nav-contact', label: 'Contact', href: '/contact', isExternal: false, order: 15, isVisible: false },
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
    templateId: 'luxury-estate',
    logoUrl: '/images/agent-logo.png',
  });
  config.status = 'ACTIVE';
  config.websiteId = 'ws_agent_001';
  config.branding = {
    ...config.branding,
    mode: 'luxury-estate',
    primaryColor: '#0F172A',
    luxuryAccent: '#C8A951',
    fontHeading: 'Inter',
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
    templateId: 'modern-realty',
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
  // 1. Exact match in registry
  if (websiteRegistry[domain]) {
    return websiteRegistry[domain];
  }

  // 2. Fallback for Localhost
  if (domain === 'localhost' || domain === '127.0.0.1') {
    return websiteRegistry['brokerage.local'];
  }

  // 3. Fallback for Netlify Previews / Production
  if (domain.endsWith('.netlify.app')) {
    return websiteRegistry['brokerage.local'];
  }

  // 4. Final fallback for demo/testing
  return websiteRegistry['brokerage.local'] ?? null;
}
