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

    const [
      exactCities,
      partialCities,
      prefixCities,
      exactAddresses,
      prefixAddresses,
      exactTypes,
      partialTypes,
    ] = await Promise.all([
      // ── CITIES ────────────────────────────────
      // 1. Exact contains
      prisma.listing.findMany({
        where: { city: { contains: primary, mode: 'insensitive' }, isActive: true },
        select: { city: true },
        distinct: ['city'],
        take: 5,
      }),
      // 2. Partial (fallback) contains
      primary !== fallback
        ? prisma.listing.findMany({
            where: { city: { contains: fallback, mode: 'insensitive' }, isActive: true },
            select: { city: true },
            distinct: ['city'],
            take: 5,
          })
        : Promise.resolve([]),
      // 3. Prefix (index-friendly fast path)
      prisma.listing.findMany({
        where: { city: { startsWith: fallback, mode: 'insensitive' }, isActive: true },
        select: { city: true },
        distinct: ['city'],
        take: 5,
      }),

      // ── ADDRESSES ─────────────────────────────
      // 1. Exact contains
      prisma.listing.findMany({
        where: { address: { contains: primary, mode: 'insensitive' }, isActive: true },
        select: { address: true, city: true },
        take: 5,
      }),
      // 2. Prefix (index-friendly)
      prisma.listing.findMany({
        where: { address: { startsWith: fallback, mode: 'insensitive' }, isActive: true },
        select: { address: true, city: true },
        take: 5,
      }),

      // ── PROPERTY TYPES ────────────────────────
      // 1. Exact contains
      prisma.listing.findMany({
        where: { normalized_property_type: { contains: primary, mode: 'insensitive' }, isActive: true },
        select: { normalized_property_type: true },
        distinct: ['normalized_property_type'],
        take: 5,
      }),
      // 2. Partial (fallback)
      prisma.listing.findMany({
        where: { normalized_property_type: { contains: fallback, mode: 'insensitive' }, isActive: true },
        select: { normalized_property_type: true },
        distinct: ['normalized_property_type'],
        take: 5,
      }),
    ]);

    // ── MERGE + DEDUPE ──────────────────────────────────────
    const mergedCities = uniqueStrings([
      ...exactCities.map(l => l.city),
      ...prefixCities.map(l => l.city),
      ...(Array.isArray(partialCities) ? partialCities.map(l => l.city) : []),
    ]);

    const mergedAddresses = uniqueStrings([
      ...exactAddresses.map(l => l.address),
      ...prefixAddresses.map(l => l.address),
    ]);

    const mergedTypes = uniqueStrings([
      ...exactTypes.map(l => l.normalized_property_type),
      ...partialTypes.map(l => l.normalized_property_type),
    ]);

    // ── FALLBACK GUARANTEE ──────────────────────────────────
    // If exact cities returned nothing but partial/prefix did, flag it.
    const fallbackUsed = exactCities.length === 0 && mergedCities.length > 0;

    const queryMs = Date.now() - startTime;

    return NextResponse.json({
      cities: mergedCities.slice(0, 8),
      addresses: mergedAddresses.slice(0, 5),
      types: mergedTypes.slice(0, 5),
      meta: {
        fallbackUsed,
        fallbackTerm: fallbackUsed ? fallback : null,
        queryMs,
      },
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    const queryMs = Date.now() - startTime;
    return NextResponse.json(
      { cities: [], addresses: [], types: [], meta: { error: true, queryMs } },
      { status: 500 }
    );
  }
}
