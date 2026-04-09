import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── In-Memory Cache ──────────────────────────────────────────
// Key: normalized query string, Value: { data, expiry }
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 45_000; // 45 seconds

function getCached(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any) {
  // Evict old entries if cache grows too large (memory safety)
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now > v.expiry) cache.delete(k);
    }
    // If still too large, clear oldest half
    if (cache.size > 400) {
      const keys = [...cache.keys()];
      keys.slice(0, keys.length / 2).forEach(k => cache.delete(k));
    }
  }
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

// ─── Input Normalization ──────────────────────────────────────
// "Toronto (West Hill)" → primary="toronto (west hill)", fallback="toronto"
// "123 King St"         → primary="123 king st",         fallback="123"
function normalizeInput(raw: string): { primary: string; fallback: string } {
  const trimmed = raw.trim().toLowerCase();
  const fallback = trimmed
    .replace(/\s*[\(\[\{].*$/, '')  // remove (...)
    .replace(/\s*[,\-–—].*$/, '')  // remove after comma/dash
    .trim();
  return { primary: trimmed, fallback: fallback || trimmed };
}

// ─── Dedup helper ─────────────────────────────────────────────
function dedup<T extends { label: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  return arr.filter(item => {
    const key = item.label.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({
      suggestions: [],
      meta: { queryMs: 0 },
    });
  }

  const { primary, fallback } = normalizeInput(q);
  const cacheKey = primary;

  // ── Check cache first ───────────────────────────────────────
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({
      ...cached,
      meta: { ...cached.meta, queryMs: Date.now() - startTime, cached: true },
    });
  }

  try {
    // ──────────────────────────────────────────────────────────
    // STRATEGY: Prefix-first parallel query → merge → dedupe
    //   1. Cities  — prefix match (index-friendly, fast)
    //   2. Cities  — contains fallback (broader, only if needed)
    //   3. Addresses — prefix match
    //   4. Property types — contains
    // All use indexed fields, LIMIT 8 per category.
    // ──────────────────────────────────────────────────────────

    const [
      cityPrefixResults,
      addressPrefixResults,
      typeResults,
    ] = await Promise.all([
      // 1. CITIES — prefix match with count (uses text_pattern_ops index)
      prisma.$queryRaw<{ city: string; count: bigint }[]>`
        SELECT city, COUNT(*) as count
        FROM "Listing"
        WHERE "isActive" = true
          AND city IS NOT NULL
          AND LOWER(city) LIKE ${fallback + '%'}
        GROUP BY city
        ORDER BY COUNT(*) DESC
        LIMIT 8
      `,

      // 2. ADDRESSES — prefix match
      prisma.$queryRaw<{ address: string; city: string }[]>`
        SELECT DISTINCT address, city
        FROM "Listing"
        WHERE "isActive" = true
          AND address IS NOT NULL
          AND LOWER(address) LIKE ${primary + '%'}
        LIMIT 5
      `,

      // 3. PROPERTY TYPES — contains match
      prisma.listing.findMany({
        where: {
          normalizedPropertyType: { contains: fallback, mode: 'insensitive' },
          isActive: true,
        },
        select: { normalizedPropertyType: true },
        distinct: ['normalizedPropertyType'],
        take: 5,
      }),
    ]);

    // ── Build suggestions array ─────────────────────────────────
    type Suggestion = {
      label: string;
      type: 'city' | 'address' | 'type';
      count?: number;
      city?: string;
    };

    let suggestions: Suggestion[] = [];

    // Cities with counts
    for (const row of cityPrefixResults) {
      if (row.city) {
        suggestions.push({
          label: row.city.trim(),
          type: 'city',
          count: Number(row.count),
        });
      }
    }

    // If no prefix results, try broader contains search (fallback)
    if (suggestions.length === 0 && fallback !== primary) {
      const cityContainsResults = await prisma.$queryRaw<{ city: string; count: bigint }[]>`
        SELECT city, COUNT(*) as count
        FROM "Listing"
        WHERE "isActive" = true
          AND city IS NOT NULL
          AND LOWER(city) LIKE ${'%' + fallback + '%'}
        GROUP BY city
        ORDER BY COUNT(*) DESC
        LIMIT 8
      `;
      for (const row of cityContainsResults) {
        if (row.city) {
          suggestions.push({
            label: row.city.trim(),
            type: 'city',
            count: Number(row.count),
          });
        }
      }
    }

    // Addresses
    for (const row of addressPrefixResults) {
      if (row.address) {
        suggestions.push({
          label: row.address.trim(),
          type: 'address',
          city: row.city?.trim() || undefined,
        });
      }
    }

    // Property types
    for (const row of typeResults) {
      if (row.normalizedPropertyType) {
        suggestions.push({
          label: row.normalizedPropertyType.trim(),
          type: 'type',
        });
      }
    }

    // Deduplicate
    suggestions = dedup(suggestions);

    // ── Priority sort ───────────────────────────────────────────
    // 1. Exact prefix match first
    // 2. Highest listing count
    // 3. Cities before addresses before types
    const typePriority = { city: 0, address: 1, type: 2 };
    suggestions.sort((a, b) => {
      const aExact = a.label.toLowerCase().startsWith(primary) ? 0 : 1;
      const bExact = b.label.toLowerCase().startsWith(primary) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      if (typePriority[a.type] !== typePriority[b.type]) {
        return typePriority[a.type] - typePriority[b.type];
      }
      return (b.count || 0) - (a.count || 0);
    });

    // Cap total suggestions
    suggestions = suggestions.slice(0, 8);

    const queryMs = Date.now() - startTime;
    const response = { suggestions, meta: { queryMs } };

    // ── Cache the result ────────────────────────────────────────
    setCache(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[SearchSuggestions] Error:', error);
    return NextResponse.json({
      suggestions: [],
      meta: { error: true, queryMs: Date.now() - startTime },
    });
  }
}
