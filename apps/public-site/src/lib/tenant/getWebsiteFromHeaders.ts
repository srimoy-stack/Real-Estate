import { headers } from 'next/headers';
import type { WebsiteConfig } from '@repo/types';

/**
 * Read the website config that was injected by middleware.
 * Use this in server components / generateMetadata.
 */
export function getWebsiteFromHeaders(): WebsiteConfig | null {
  const headersList = headers();
  const raw = headersList.get('x-website-config');
  if (!raw) return null;

  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf-8');
    return JSON.parse(decoded) as WebsiteConfig;
  } catch (error) {
    console.error('Failed to parse website config from headers:', error);
    return null;
  }
}
