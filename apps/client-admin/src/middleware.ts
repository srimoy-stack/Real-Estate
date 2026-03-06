import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Production root domain (set via env or hardcode) ───────────────
const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? 'platform.com';

/**
 * Resolve the tenant identifier from the incoming hostname.
 *
 * Priority:
 *  1. Production subdomain  → broker1.platform.com  → "broker1"
 *  2. Localhost              → localhost:3002        → "local"
 *  3. Netlify preview        → *.netlify.app         → "demo"
 *  4. Unknown                                        → "demo"
 */
function resolveTenantFromHostname(hostname: string): string {
    const domain = hostname.split(':')[0].toLowerCase();

    // ── Localhost / local dev ──────────────────────────────────────────
    if (domain === 'localhost' || domain === '127.0.0.1') {
        return 'local';
    }

    // ── Netlify preview domains ────────────────────────────────────────
    if (domain.endsWith('.netlify.app')) {
        return 'demo';
    }

    // ── Production subdomain ───────────────────────────────────────────
    if (domain.endsWith(`.${ROOT_DOMAIN}`)) {
        const subdomain = domain.replace(`.${ROOT_DOMAIN}`, '');
        if (subdomain && subdomain !== 'www') {
            return subdomain;
        }
    }

    // ── Fallback ──────────────────────────────────────────────────────
    return 'demo';
}

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') ?? 'localhost';
    const tenantId = resolveTenantFromHostname(hostname);

    // ── Check Auth/Suspension Status in Cookies ────────────────────────
    const authCookie = request.cookies.get('auth-storage');
    if (authCookie) {
        try {
            const authState = JSON.parse(decodeURIComponent(authCookie.value));
            const user = authState?.state?.user;

            // Enforce suspension redirect
            if (user?.tenantStatus === 'SUSPENDED' && !request.nextUrl.pathname.startsWith('/suspended')) {
                return NextResponse.redirect(new URL('/suspended', request.url));
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    // ── Inject Tenant ID Header ────────────────────────────────────────
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenantId);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|suspended).*)',
    ],
};
