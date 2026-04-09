import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── Input Normalization ──────────────────────────────────────
// "Toronto (West Hill)" → primary="toronto (west hill)", fallback="toronto"
// "123 King St"         → primary="123 king st",         fallback="123"
function normalizeInput(raw: string): { primary: string; fallback: string } {
  const trimmed = raw.trim().toLowerCase();
  // Extract base term before parentheses, commas, or dashes
  const fallback = trimmed
    .replace(/\s*[\(\[\{].*$/, '')  // remove (...)
    .replace(/\s*[,\-–—].*$/, '')  // remove after comma/dash
    .trim();
  return { primary: trimmed, fallback: fallback || trimmed };
}

// ─── Dedup helper ─────────────────────────────────────────────
function uniqueStrings(arr: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of arr) {
    if (!item) continue;
    const key = item.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item.trim());
  }
  return result;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({
      cities: [],
      addresses: [],
      types: [],
      meta: { fallbackUsed: false, queryMs: 0 },
    });
  }

  const { primary, fallback } = normalizeInput(q);

  try {
    // ──────────────────────────────────────────────────────────
    // STRATEGY: 3-tier parallel query → merge → dedupe → limit
    //   1. exact   — ILIKE '%primary%'  (best match)
    //   2. partial — ILIKE '%fallback%' (broader match)
    //   3. prefix  — ILIKE 'fallback%'  (index-friendly)
    // All queries use indexed fields ONLY, LIMIT 5 each.
    // ──────────────────────────────────────────────────────────

    // ─── OPTIMIZED QUERY STRATEGY ─────────────────────────────
    // Combine multiple conditions into fewer parallel queries to 
    // reduce connection pressure (Neon pool-friendly).
    const [cityMatches, addressMatches, typeMatches] = await Promise.all([
      // 1. CITIES (Combined contains + prefix)
      prisma.listing.findMany({
        where: {
          city: { contains: fallback, mode: 'insensitive' },
          isActive: true,
        },
        select: { city: true },
        distinct: ['city'],
        take: 10,
      }),

      // 2. ADDRESSES (Prefix priority, fallback to contains)
      prisma.listing.findMany({
        where: {
          OR: [
            { address: { startsWith: primary, mode: 'insensitive' } },
            { address: { contains: fallback, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        select: { address: true, city: true },
        take: 8,
      }),

      // 3. PROPERTY TYPES
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

    const mergedCities = uniqueStrings(cityMatches.map(l => l.city));
    const mergedAddresses = uniqueStrings(addressMatches.map(l => l.address));
    const mergedTypes = uniqueStrings(typeMatches.map(l => l.normalizedPropertyType));

    const queryMs = Date.now() - startTime;

    return NextResponse.json({
      cities: mergedCities,
      addresses: mergedAddresses,
      types: mergedTypes,
      meta: {
        queryMs,
      },
    });
  } catch (error) {
    console.error('Search suggestions fail-safe triggered:', error);
    return NextResponse.json({
      cities: [],
      addresses: [],
      types: [],
      meta: { error: true, queryMs: Date.now() - startTime }
    });
  }
}
