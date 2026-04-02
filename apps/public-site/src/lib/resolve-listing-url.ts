/**
 * ─── resolveListingUrl ──────────────────────────────────────────────
 *
 * Client-safe utility to resolve the correct external listing URL.
 *
 * Priority:
 *   1. rawData.ListingURL (most reliable — direct from CREA DDF OData, includes slug)
 *   2. Top-level ListingURL (set by API enrichment layers)
 *   3. moreInformationLink (DB field — may be null)
 *
 * IMPORTANT: DDF returns ListingURL WITHOUT the protocol prefix
 * (e.g. "www.realtor.ca/real-estate/..."). We auto-prepend https://.
 *
 * We do NOT construct fallback URLs from listing IDs.
 * REALTOR.ca requires the full slug path — bare /real-estate/{id} URLs 404.
 *
 * Returns null if no valid URL is found — the UI should hide the link.
 */

/** Auto-prepend https:// if URL starts with www. (DDF returns protocol-less URLs) */
function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let url = raw.trim();
  if (url.startsWith('www.')) {
    url = 'https://' + url;
  }
  return url;
}


/** Normalize + validate, returns the valid https:// URL or null */
function resolveField(value: string | null | undefined): string | null {
  const normalized = normalizeUrl(value);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    if (url.protocol === 'http:' || url.protocol === 'https:') return normalized;
  } catch {}
  return null;
}

export function resolveListingUrl(listing: {
  rawData?: any;
  moreInformationLink?: string | null;
  ListingURL?: string | null;
  listingKey?: string | null;
  listingId?: string | null;
  mlsNumber?: string | null;
  ListingKey?: string | null;
  ListingId?: string | null;
}): string | null {
  // Priority 1: rawData.ListingURL (straight from DDF OData — includes full slug)
  const raw = listing.rawData || {};
  const fromRaw = resolveField(raw.ListingURL);
  if (fromRaw) return fromRaw;

  // Priority 2: Top-level ListingURL (sometimes set by enrichment layers)
  const fromTop = resolveField(listing.ListingURL);
  if (fromTop) return fromTop;

  // Priority 3: moreInformationLink DB field
  const fromDb = resolveField(listing.moreInformationLink);
  if (fromDb) return fromDb;

  // No valid URL found — return null so UI hides the button
  // We intentionally do NOT construct /real-estate/{id} — it 404s on realtor.ca
  return null;
}
