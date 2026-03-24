import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getWebsiteByDomain } from './lib/tenant/getWebsiteByDomain';
import type { WebsiteConfig } from '@repo/types';

// ─── Production root domain (set via env or hardcode) ───────────────
const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? 'platform.com';

/**
 * Resolve the tenant identifier from the incoming hostname.
 *
 * Priority:
 *  1. Production subdomain  → broker1.platform.com  → "broker1"
 *  2. Localhost              → localhost:3000        → "local"
 *  3. Netlify preview        → *.netlify.app         → "demo"
 *  4. Unknown                                        → "demo"
 */
function resolveTenantFromHostname(hostname: string): string {
  // Strip port (e.g. "localhost:3000" → "localhost")
  const domain = hostname.split(':')[0].toLowerCase();

  // ── Localhost / local dev ──────────────────────────────────────────
  if (domain === 'localhost' || domain === '127.0.0.1') {
    return 'local';
  }

  // ── Netlify preview domains ────────────────────────────────────────
  // Matches: something.netlify.app  OR  branch--something.netlify.app
  if (domain.endsWith('.netlify.app')) {
    return 'demo';
  }

  // ── Production subdomain ───────────────────────────────────────────
  // e.g. broker1.platform.com → subdomain = "broker1"
  if (domain.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = domain.replace(`.${ROOT_DOMAIN}`, '');
    // Ignore "www" as a tenant
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
  }

  // ── Bare root domain ──────────────────────────────────────────────
  if (domain === ROOT_DOMAIN || domain === `www.${ROOT_DOMAIN}`) {
    return 'demo';
  }

  // ── Fallback: treat the full domain as the tenant key ─────────────
  // This supports custom domains mapped to tenants (e.g. broker1.com)
  return domain;
}

/**
 * Multi-tenant middleware.
 *
 * 1. Extracts the hostname from the request.
 * 2. Resolves the tenant identifier from the hostname.
 * 3. Looks up the WebsiteConfig for that domain/tenant.
 * 4. If no config found → returns 404.
 * 5. If SUSPENDED → returns a branded suspension page.
 * 6. If active → injects tenant ID + full config into request headers
 *    for server components to consume.
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? 'localhost';
  const domain = hostname.split(':')[0]; // strip port

  // ── Resolve tenant ─────────────────────────────────────────────────
  const tenantId = resolveTenantFromHostname(hostname);

  // ── Resolve website config ─────────────────────────────────────────
  const website: WebsiteConfig | null = await getWebsiteByDomain(domain);

  console.log(`[Middleware] Resolved tenant: ${tenantId}, Domain: ${domain}, Website Found: ${!!website}`);

  if (!website) {
    return new NextResponse('Website not found', { status: 404 });
  }

  // ── Enforce Suspension ─────────────────────────────────────────────
  if (website.status === 'SUSPENDED') {
    return new NextResponse(
      `
      <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #FFFFFF; color: #111; text-align: center; padding: 2rem;">
        <div style="max-width: 500px;">
          <div style="width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, #059669, #0d9488); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-weight: 700; font-size: 1.25rem;">RE</div>
          <h1 style="font-size: 1.75rem; font-weight: 700; letter-spacing: -0.025em; margin-bottom: 0.75rem;">Website <span style="color: #059669;">Temporarily Unavailable</span></h1>
          <p style="color: #6b7280; line-height: 1.7; font-weight: 400; font-size: 0.95rem;">
            This website is currently offline for maintenance or administrative reasons.
            Access will be restored shortly.
          </p>
          <div style="margin-top: 2rem; padding: 0.75rem 1.25rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background: #f9fafb; font-size: 0.75rem; color: #9ca3af;">
            Ref: SYSTEM_RESTRICTION_T3 &bull; Tenant: ${tenantId}
          </div>
        </div>
      </div>
      `,
      {
        status: 451,
        headers: { 'content-type': 'text/html' },
      }
    );
  }

  // ── Inject headers for downstream server components ────────────────
  const requestHeaders = new Headers(request.headers);
  const encodedConfig = Buffer.from(JSON.stringify(website)).toString('base64');

  requestHeaders.set('x-website-id', website.websiteId);
  requestHeaders.set('x-website-config', encodedConfig);
  requestHeaders.set('x-tenant-id', tenantId);
  requestHeaders.set('x-tenant-domain', website.domain);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Match all page routes. Exclude static assets, API routes, and Next internals.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|images|fonts|listings-demo).*)',
  ],
};
