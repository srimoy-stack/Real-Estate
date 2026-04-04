/**
 * ═══════════════════════════════════════════════════════════════════════
 * NORMALIZE PROPERTY TYPE — One-time Backfill Script
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Classification based on ACTUAL DB analysis (92,442 active listings):
 *
 * RESIDENTIAL (81,615 → 88.3%):
 *   - Single Family: 79,860
 *   - Multi-family: 1,755
 *
 * COMMERCIAL (10,222 → 11.1%):
 *   - Vacant Land: 4,886 (98% no bedrooms)
 *   - Retail: 1,444
 *   - Business: 1,238
 *   - Office: 1,035
 *   - Industrial: 917
 *   - Parking: 38
 *   - Hospitality: 31
 *   - Institutional - Special Purpose: 12
 *
 * AMBIGUOUS (uses bedroom fallback):
 *   - Other: 591 (97% no beds → mostly commercial)
 *   - Agriculture: 452 (60% have beds → mixed)
 *   - Recreational: 178 (80% have beds → mixed)
 *   - null: 5
 *
 * LEASE DETECTION:
 *   No structured field exists. 2,167 listings mention "for lease/rent"
 *   in publicRemarks. Applied as overlay on top of commercial/residential.
 *
 * Usage:
 *   npx tsx scripts/normalize-property-type.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

// ── Classification Maps (from DB analysis) ──────────────────────────

const COMMERCIAL_SUBTYPES = new Set([
  'retail',
  'business',
  'office',
  'industrial',
  'vacant land',
  'parking',
  'hospitality',
  'institutional - special purpose',
  'mixed use',
  'hotel',
  'investment',
]);

const RESIDENTIAL_SUBTYPES = new Set([
  'single family',
  'multi-family',
  'condo',
  'condominium',
  'townhouse',
  'duplex',
  'triplex',
  '2 family',
  '3 family',
  '4 family',
  'apartment',
  'row / townhouse',
  'semi-detached',
  'detached',
  'mobile home',
  'manufactured home',
]);

const LEASE_KEYWORDS = [
  'for lease',
  'for rent',
  'lease available',
  'available for lease',
  'monthly rent',
  'net lease',
  'gross lease',
];

/**
 * Classify a single listing based on DB data
 */
function classifyListing(listing: {
  propertySubType: string | null;
  bedroomsTotal: number | null;
  publicRemarks: string | null;
}): 'commercial' | 'residential' | 'lease' {
  const subType = (listing.propertySubType || '').toLowerCase().trim();
  const beds = listing.bedroomsTotal ?? 0;
  const remarks = (listing.publicRemarks || '').toLowerCase();

  // 1. Check for lease indicators in publicRemarks
  const isLease = LEASE_KEYWORDS.some((kw) => remarks.includes(kw));
  if (isLease) return 'lease';

  // 2. Direct subtype match → commercial
  if (COMMERCIAL_SUBTYPES.has(subType)) return 'commercial';

  // 3. Direct subtype match → residential
  if (RESIDENTIAL_SUBTYPES.has(subType)) return 'residential';

  // 4. Ambiguous types → use bedroom fallback
  //    Agriculture: 60% have beds, Recreational: 80% have beds
  //    Other: 97% no beds, null: unknown
  if (beds > 0) return 'residential';

  // 5. Default: commercial (safer for "Other", null, etc.)
  return 'commercial';
}

// ── Main Backfill Logic ─────────────────────────────────────────────

const BATCH_SIZE = 1000;

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  NORMALIZE PROPERTY TYPE — Backfill Script');
  console.log('═══════════════════════════════════════════════════\n');

  const totalCount = await prisma.listing.count();
  console.log(`Total listings in DB: ${totalCount.toLocaleString()}`);

  let processed = 0;
  let stats = { commercial: 0, residential: 0, lease: 0 };
  let cursor: number | undefined = undefined;

  while (true) {
    const batch = await prisma.listing.findMany({
      where: { normalizedPropertyType: null },
      take: BATCH_SIZE,
      select: {
        id: true,
        propertySubType: true,
        bedroomsTotal: true,
        publicRemarks: true,
      },
      orderBy: { id: 'asc' },
    });

    if (batch.length === 0) break;

    // Build batch update operations
    const operations = batch.map((listing) => {
      const normalized = classifyListing(listing);
      stats[normalized]++;
      return prisma.listing.update({
        where: { id: listing.id },
        data: { normalizedPropertyType: normalized },
      });
    });

    // Execute in transaction for consistency
    await prisma.$transaction(operations);

    processed += batch.length;
    cursor = batch[batch.length - 1].id;

    // Progress indicator
    const pct = ((processed / totalCount) * 100).toFixed(1);
    process.stdout.write(
      `\r  ⏳ Processed ${processed.toLocaleString()} / ${totalCount.toLocaleString()} (${pct}%) | ` +
        `R: ${stats.residential.toLocaleString()} | C: ${stats.commercial.toLocaleString()} | L: ${stats.lease.toLocaleString()}`
    );
  }

  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('  ✅ BACKFILL COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Total processed: ${processed.toLocaleString()}`);
  console.log(`  Residential:     ${stats.residential.toLocaleString()}`);
  console.log(`  Commercial:      ${stats.commercial.toLocaleString()}`);
  console.log(`  Lease:           ${stats.lease.toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════\n');

  // ── Validation Query ──────────────────────────────────────────────
  console.log('Running validation...\n');
  const validation = await prisma.$queryRawUnsafe(`
    SELECT 
      "normalized_property_type" as type,
      COUNT(*) as count
    FROM "Listing"
    GROUP BY "normalized_property_type"
    ORDER BY count DESC
  `);
  console.log('=== VALIDATION: normalizedPropertyType Distribution ===');
  console.log(
    JSON.stringify(
      validation,
      (k, v) => (typeof v === 'bigint' ? Number(v) : v),
      2
    )
  );

  // Spot-check: Verify 0 residential in commercial bucket by checking
  // Single Family listings that got classified as commercial
  const misclassified = await prisma.listing.count({
    where: {
      propertySubType: 'Single Family',
      normalizedPropertyType: 'commercial',
    },
  });
  console.log(
    `\n🔍 Spot-check: Single Family classified as commercial = ${misclassified} (should be 0)`
  );

  // Check for "Other" with bedrooms classified correctly
  const otherWithBeds = await prisma.listing.count({
    where: {
      propertySubType: 'Other',
      bedroomsTotal: { gt: 0 },
      normalizedPropertyType: 'residential',
    },
  });
  console.log(
    `🔍 Spot-check: "Other" with bedrooms → residential = ${otherWithBeds}`
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ FATAL ERROR:', e);
  process.exit(1);
});
