/**
 * ─── CREA DDF Compliance Layer ──────────────────────────────────────────────
 *
 * Ensures all listing responses comply with CREA DDF data display rules:
 *
 * 1. moreInformationLink is ALWAYS present on every listing
 * 2. Required fields validation (listingKey, standardStatus)
 * 3. Analytics tracking on detail views
 * 4. No listing data is modified — only extended safely
 *
 * CREA DDF Rules Reference:
 *   - Every listing must link back to REALTOR.ca via moreInformationLink
 *   - DDF data must not be altered, only supplemented
 *   - Analytics events must be fired on listing detail views
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface DDFComplianceResult {
    valid: boolean;
    violations: string[];
}

export interface DDFAnalyticsParams {
    ListingID: string;
    DestinationID: string;
    EventType: string;
    UUID: string;
    IP?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CREA_ANALYTICS_ENDPOINT = 'https://analytics.crea.ca/LogEvents.svc/LogEvents';
const REALTOR_CA_BASE_URL = 'https://www.realtor.ca';
const DDF_DESTINATION_ID = process.env.DDF_DESTINATION_ID || 'DDF_PLATFORM';

const REQUIRED_FIELDS = ['listingKey', 'standardStatus'] as const;

// ── 1. moreInformationLink Resolution ────────────────────────────────────────

/**
 * Resolves the moreInformationLink for a listing.
 * Priority:
 *   1. Existing moreInformationLink from DB
 *   2. ListingURL from rawData (DDF OData field)
 *   3. Constructed REALTOR.ca fallback URL
 *
 * NEVER modifies listing data — returns the resolved link separately.
 */
export function resolveMoreInformationLink(listing: {
    moreInformationLink?: string | null;
    listingKey?: string | null;
    listingId?: string | null;
    rawData?: any;
}): string {
    // Priority 1: Existing DB field
    if (listing.moreInformationLink && isValidUrl(listing.moreInformationLink)) {
        return listing.moreInformationLink;
    }

    // Priority 2: rawData.ListingURL (CREA DDF OData standard field)
    const raw = listing.rawData || {};
    if (raw.ListingURL && isValidUrl(raw.ListingURL)) {
        return raw.ListingURL;
    }

    // Priority 3: Construct REALTOR.ca fallback
    const id = listing.listingId || listing.listingKey;
    if (id) {
        return `${REALTOR_CA_BASE_URL}/real-estate/${id}`;
    }

    return REALTOR_CA_BASE_URL;
}

function isValidUrl(str: string): boolean {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

// ── 2. Listing Compliance Validation ─────────────────────────────────────────

/**
 * Validates that a listing has all required CREA DDF fields.
 * Does NOT reject listings — returns violations for logging.
 */
export function validateListingCompliance(listing: Record<string, any>): DDFComplianceResult {
    const violations: string[] = [];

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
        if (!listing[field] && listing[field] !== 0) {
            violations.push(`Missing required field: ${field}`);
        }
    }

    // Ensure moreInformationLink resolvability
    const link = resolveMoreInformationLink(listing);
    if (!link || link === REALTOR_CA_BASE_URL) {
        violations.push('moreInformationLink could not be resolved to a specific listing');
    }

    return {
        valid: violations.length === 0,
        violations,
    };
}

// ── 3. Analytics Tracking (Server-Side) ──────────────────────────────────────

/**
 * Fires a CREA analytics ping for listing detail views.
 * Fire-and-forget — never blocks or throws.
 *
 * Per CREA DDF spec: must be triggered on every property detail view.
 */
export async function fireDDFAnalyticsPing(params: {
    listingId: string;
    ip?: string;
}): Promise<void> {
    try {
        const uuid = `${params.listingId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        const queryParams = new URLSearchParams({
            ListingID: params.listingId,
            DestinationID: DDF_DESTINATION_ID,
            EventType: 'view',
            UUID: uuid,
        });

        if (params.ip) {
            queryParams.set('IP', params.ip);
        }

        const url = `${CREA_ANALYTICS_ENDPOINT}?${queryParams.toString()}`;

        // Fire-and-forget with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch(url, {
            method: 'GET',
            signal: controller.signal,
        })
            .catch(() => {
                // Silently swallow — analytics should never break user flow
            })
            .finally(() => clearTimeout(timeout));

        console.log(`[DDF Compliance] Analytics ping sent for listing: ${params.listingId}`);
    } catch {
        // Never throw from analytics
    }
}

// ── 4. Response Enrichment ───────────────────────────────────────────────────

/**
 * Enriches a single listing object with DDF compliance fields.
 * SAFE: Only adds fields — never modifies existing data.
 */
export function enrichListingWithCompliance<T extends Record<string, any>>(
    listing: T
): T & { moreInformationLink: string; ListingURL: string; _ddfCompliant: boolean } {
    const moreInformationLink = resolveMoreInformationLink(listing);
    const compliance = validateListingCompliance(listing);

    if (!compliance.valid) {
        console.warn(
            `[DDF Compliance] Violations for ${listing.listingKey || listing.ListingKey || 'unknown'}:`,
            compliance.violations
        );
    }

    return {
        ...listing,
        moreInformationLink,
        ListingURL: moreInformationLink,
        _ddfCompliant: compliance.valid,
    };
}

/**
 * Enriches an array of listings with DDF compliance fields.
 * SAFE: No data modification — only field additions.
 */
export function enrichListingsWithCompliance<T extends Record<string, any>>(
    listings: T[]
): (T & { moreInformationLink: string; ListingURL: string; _ddfCompliant: boolean })[] {
    return listings.map(enrichListingWithCompliance);
}

// ── 5. IP Extraction Helper (for Next.js API routes) ─────────────────────────

/**
 * Extracts client IP from Next.js request headers.
 * Follows X-Forwarded-For → X-Real-IP → connection fallback chain.
 */
export function extractClientIP(headers: Headers): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    return '0.0.0.0';
}

// ── 6. DDF Lead API Integration ──────────────────────────────────────────────

const DDF_IDENTITY_ENDPOINT = 'https://identity.crea.ca/connect/token';
const DDF_LEADS_ENDPOINT = 'https://ddfapi.realtor.ca/v1/Lead/CreateLead';

let ddfTokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Retrieves a DDF access token using client credentials.
 * Implements token caching to minimize authentication overhead.
 */
export async function getDDFToken(): Promise<string | null> {
    try {
        // 1. Check Cache
        if (ddfTokenCache && ddfTokenCache.expiresAt > Date.now() + 60000) {
            return ddfTokenCache.token;
        }

        const clientId = process.env.DDF_CLIENT_ID;
        const clientSecret = process.env.DDF_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error('[DDF Compliance] Missing DDF_CLIENT_ID or DDF_CLIENT_SECRET environment variables');
            return null;
        }

        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'DDFApi_Read',
        });

        const response = await fetch(DDF_IDENTITY_ENDPOINT, {
            method: 'POST',
            body: body.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[DDF Compliance] Token request failed:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        const token = data.access_token;
        const expiresIn = data.expires_in; // seconds

        // Cache the token
        ddfTokenCache = {
            token,
            expiresAt: Date.now() + expiresIn * 1000,
        };

        return token;
    } catch (err) {
        console.error('[DDF Compliance] Failed to retrieve DDF token:', err);
        return null;
    }
}

export interface DDFLeadSubmission {
    Culture?: string;
    MemberKey: string;
    ListingKey: string;
    SenderName: string;
    SenderEmailAddress: string;
    SenderPhoneNumber?: string | number;
    SenderPhoneExtension?: string | number;
    PreferredMethodContact?: 'email' | 'phone';
    Message: string;
}

/**
 * Submits a lead to the CREA DDF Lead API.
 * This is building a Bridge between our site and the listing REALTOR®.
 */
export async function submitDDFLead(lead: DDFLeadSubmission): Promise<{ success: boolean; message: string }> {
    try {
        const token = await getDDFToken();
        if (!token) {
            return { success: false, message: 'Could not authenticate with CREA API' };
        }

        const isTesting = process.env.NODE_ENV !== 'production';
        const url = `${DDF_LEADS_ENDPOINT}${isTesting ? '?SuppressEmail=true' : ''}`;

        const payload = {
            Culture: lead.Culture || 'en-CA',
            MemberKey: lead.MemberKey,
            ListingKey: lead.ListingKey,
            SenderName: lead.SenderName,
            SenderEmailAddress: lead.SenderEmailAddress,
            SenderPhoneNumber: lead.SenderPhoneNumber,
            SenderPhoneExtension: lead.SenderPhoneExtension,
            PreferredMethodContact: lead.PreferredMethodContact || 'email',
            Message: lead.Message,
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('[DDF Compliance] Lead successfully submitted to CREA for listing:', lead.ListingKey);
            return { success: true, message: 'Lead submitted to REALTOR.ca' };
        } else {
            console.error('[DDF Compliance] CREA Lead Submission failed:', data);
            return { success: false, message: data.message || 'CREA API error' };
        }
    } catch (err) {
        console.error('[DDF Compliance] Lead submission fatal error:', err);
        return { success: false, message: 'Internal Server Error during DDF submission' };
    }
}
