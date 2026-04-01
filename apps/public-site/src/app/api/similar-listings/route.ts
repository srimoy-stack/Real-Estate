import { NextRequest, NextResponse } from 'next/server';
import { getSimilarListings } from '@/lib/similar-listings';
import { enrichListingsWithCompliance } from '@/lib/ddf-compliance';
import { getCached, setCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const CACHE_TTL_SECONDS = 300; // 5 minutes — similar listings don't change often

export async function GET(request: NextRequest) {
  const start = performance.now();
  const { searchParams } = new URL(request.url);

  try {
    const listingKey = searchParams.get('listingKey');
    const limit = Math.min(parseInt(searchParams.get('limit') || '8', 10), 20);

    if (!listingKey) {
      return NextResponse.json({ error: 'Missing listingKey' }, { status: 400 });
    }

    // ── Cache Efficiency Normalization ──────────────────────────
    // Round coords to 4 decimals (approx 11m) to increase cache hits
    const cacheKey = `similar:${listingKey}:${limit}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      const duration = performance.now() - start;
      console.log(`[Similar API] CACHE HIT | Key: ${listingKey} | ${duration.toFixed(1)}ms`);
      return NextResponse.json(cached);
    }

    // ── Fetch Similar Listings ──────────────────────────────────
    const similarRaw = await getSimilarListings(listingKey, limit);

    // ── DDF Compliance ──────────────────────────────────────────
    const similar = enrichListingsWithCompliance(similarRaw);

    const duration = performance.now() - start;
    console.log(
      `[Similar API] CACHE MISS | Ref: ${listingKey} | Results: ${similar.length} | ${duration.toFixed(1)}ms`
    );

    const responseBody = {
      referenceListingKey: listingKey,
      similar,
      total: similar.length,
      meta: {
        durationMs: parseFloat(duration.toFixed(2)),
        limit,
      },
    };

    // Cache the response
    setCache(cacheKey, responseBody, CACHE_TTL_SECONDS);

    return NextResponse.json(responseBody);
  } catch (err: any) {
    console.error('[Similar API] Error:', err.message);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message },
      { status: 500 }
    );
  }
}
