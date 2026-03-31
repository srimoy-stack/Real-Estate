/**
 * GROUP FILTER VERIFICATION — API vs Direct DB Count
 * 
 * Tests 4-5 filters combined simultaneously.
 * For EACH combo:
 *   1. Calls the API endpoint with combined filters
 *   2. Runs a DIRECT Prisma DB count with the equivalent WHERE clause
 *   3. Compares both totals — they MUST match
 *   4. Validates returned listings satisfy ALL filter criteria
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000/api/internal-listings';

interface GroupTestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  apiTotal: number;
  dbTotal: number;
  match: boolean;
  returned: number;
  violations: string[];
  params: Record<string, string>;
}

const results: GroupTestResult[] = [];

// ── API Fetch ──────────────────────────────────────────────────────────────
async function fetchAPI(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).substring(0, 300)}`);
  return res.json();
}

// ── Direct DB Count ────────────────────────────────────────────────────────
async function directDBCount(where: Prisma.ListingWhereInput): Promise<number> {
  return prisma.listing.count({ where: { ...where, isActive: true } });
}

// ── Row-level Validation ───────────────────────────────────────────────────
function validateListing(l: any, params: Record<string, string>): string[] {
  const v: string[] = [];
  const id = l.ListingId || l.listingId || l.ListingKey || '?';

  if (params.city) {
    const city = (l.City || l.city || '').toLowerCase();
    if (!city.startsWith(params.city.toLowerCase()))
      v.push(`[${id}] City="${l.City}" ≠ "${params.city}"`);
  }
  if (params.minPrice) {
    const price = l.ListPrice ?? l.listPrice ?? 0;
    if (price < parseFloat(params.minPrice))
      v.push(`[${id}] Price=$${price} < min=$${params.minPrice}`);
  }
  if (params.maxPrice) {
    const price = l.ListPrice ?? l.listPrice ?? 0;
    if (price > 0 && price > parseFloat(params.maxPrice))
      v.push(`[${id}] Price=$${price} > max=$${params.maxPrice}`);
  }
  if (params.beds) {
    const beds = l.BedroomsTotal ?? l.bedroomsTotal ?? 0;
    if (beds < parseInt(params.beds))
      v.push(`[${id}] Beds=${beds} < min=${params.beds}`);
  }
  if (params.baths) {
    const baths = l.BathroomsTotalInteger ?? l.bathroomsTotal ?? 0;
    if (baths < parseInt(params.baths))
      v.push(`[${id}] Baths=${baths} < min=${params.baths}`);
  }
  if (params.minSqft) {
    const sqft = l.LivingArea ?? l.livingArea ?? null;
    if (sqft !== null && sqft < parseFloat(params.minSqft))
      v.push(`[${id}] Sqft=${sqft} < min=${params.minSqft}`);
  }
  if (params.maxSqft) {
    const sqft = l.LivingArea ?? l.livingArea ?? null;
    if (sqft !== null && sqft > parseFloat(params.maxSqft))
      v.push(`[${id}] Sqft=${sqft} > max=${params.maxSqft}`);
  }
  if (params.minYearBuilt) {
    const year = l.YearBuilt ?? l.yearBuilt ?? null;
    if (year !== null && year < parseInt(params.minYearBuilt))
      v.push(`[${id}] Year=${year} < min=${params.minYearBuilt}`);
  }
  if (params.maxYearBuilt) {
    const year = l.YearBuilt ?? l.yearBuilt ?? null;
    if (year !== null && year > parseInt(params.maxYearBuilt))
      v.push(`[${id}] Year=${year} > max=${params.maxYearBuilt}`);
  }

  return v;
}

// ── Test Runner ────────────────────────────────────────────────────────────
async function testGroupFilter(
  name: string,
  apiParams: Record<string, string>,
  dbWhere: Prisma.ListingWhereInput
) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🧪 ${name}`);
  console.log(`   Filters: ${Object.entries(apiParams).filter(([k]) => !['page','limit'].includes(k)).map(([k,v]) => `${k}=${v}`).join(' & ')}`);

  try {
    // Parallel: API call + Direct DB count
    const [apiData, dbCount] = await Promise.all([
      fetchAPI({ ...apiParams, page: '1', limit: '20' }),
      directDBCount(dbWhere),
    ]);

    const apiTotal = apiData.total ?? apiData.meta?.total ?? 0;
    const listings = apiData.listings || [];
    const match = apiTotal === dbCount;

    // Row-level validation
    const allViolations: string[] = [];
    for (const l of listings) {
      allViolations.push(...validateListing(l, apiParams));
    }

    const status: 'PASS' | 'FAIL' = match && allViolations.length === 0 ? 'PASS' : 'FAIL';

    results.push({
      name, status, apiTotal, dbTotal: dbCount, match,
      returned: listings.length, violations: allViolations, params: apiParams,
    });

    console.log(`   API Total:  ${apiTotal.toLocaleString()}`);
    console.log(`   DB  Total:  ${dbCount.toLocaleString()}`);
    console.log(`   Match:      ${match ? '✅ YES' : '❌ NO (MISMATCH!)'}`);
    console.log(`   Returned:   ${listings.length} listings`);
    console.log(`   Violations: ${allViolations.length === 0 ? '✅ None — all rows valid' : `❌ ${allViolations.length} violations`}`);
    if (allViolations.length > 0) {
      allViolations.slice(0, 5).forEach(v => console.log(`     • ${v}`));
    }
    console.log(`   Result:     ${status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  } catch (err: any) {
    results.push({
      name, status: 'ERROR', apiTotal: -1, dbTotal: -1, match: false,
      returned: 0, violations: [err.message], params: apiParams,
    });
    console.log(`   ❌ ERROR: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE — 4-5 filter combos with direct DB verification
// ═══════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║      GROUP FILTER VERIFICATION — API vs Direct DB Count            ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`Database: PostgreSQL | Started: ${new Date().toISOString()}\n`);

  // ── COMBO 1: City + Price Range + Beds + Baths (4 filters) ──────────────
  await testGroupFilter(
    'Combo 1: Toronto + $400K–$800K + 3+ Beds + 2+ Baths',
    { city: 'Toronto', minPrice: '400000', maxPrice: '800000', beds: '3', baths: '2' },
    {
      city: { startsWith: 'Toronto', mode: 'insensitive' },
      listPrice: { gte: 400000, lte: 800000 },
      bedroomsTotal: { gte: 3 },
      bathroomsTotal: { gte: 2 },
    }
  );

  // ── COMBO 2: City + PropertyType + Beds + Price + YearBuilt (5 filters) ─
  await testGroupFilter(
    'Combo 2: Calgary + Residential + 2+ Beds + $200K–$500K + Built After 2000',
    { city: 'Calgary', propertyType: 'Residential', beds: '2', minPrice: '200000', maxPrice: '500000', minYearBuilt: '2000' },
    {
      city: { startsWith: 'Calgary', mode: 'insensitive' },
      OR: [
        { propertyType: { contains: 'Residential', mode: 'insensitive' } },
        { propertySubType: { contains: 'Single Family', mode: 'insensitive' } },
        { propertySubType: { contains: 'Multi-family', mode: 'insensitive' } },
        { propertySubType: { contains: 'Condo', mode: 'insensitive' } },
      ],
      bedroomsTotal: { gte: 2 },
      listPrice: { gte: 200000, lte: 500000 },
      yearBuilt: { gte: 2000 },
    }
  );

  // ── COMBO 3: City + MaxPrice + Beds + Baths + Sqft (5 filters) ──────────
  await testGroupFilter(
    'Combo 3: Vancouver + Under $1M + 2+ Beds + 2+ Baths + 1000+ Sqft',
    { city: 'Vancouver', maxPrice: '1000000', beds: '2', baths: '2', minSqft: '1000' },
    {
      city: { startsWith: 'Vancouver', mode: 'insensitive' },
      listPrice: { lte: 1000000 },
      bedroomsTotal: { gte: 2 },
      bathroomsTotal: { gte: 2 },
      livingArea: { gte: 1000 },
    }
  );

  // ── COMBO 4: City + Price + Beds + YearBuilt + Baths (5 filters) ────────
  await testGroupFilter(
    'Combo 4: Ottawa + $300K–$600K + 3+ Beds + 1+ Baths + Built 2010+',
    { city: 'Ottawa', minPrice: '300000', maxPrice: '600000', beds: '3', baths: '1', minYearBuilt: '2010' },
    {
      city: { startsWith: 'Ottawa', mode: 'insensitive' },
      listPrice: { gte: 300000, lte: 600000 },
      bedroomsTotal: { gte: 3 },
      bathroomsTotal: { gte: 1 },
      yearBuilt: { gte: 2010 },
    }
  );

  // ── COMBO 5: Price + Beds + Baths + Sqft (4 filters, no city) ───────────
  await testGroupFilter(
    'Combo 5: All Cities + $500K–$1M + 4+ Beds + 3+ Baths + 1500+ Sqft',
    { minPrice: '500000', maxPrice: '1000000', beds: '4', baths: '3', minSqft: '1500' },
    {
      listPrice: { gte: 500000, lte: 1000000 },
      bedroomsTotal: { gte: 4 },
      bathroomsTotal: { gte: 3 },
      livingArea: { gte: 1500 },
    }
  );

  // ── COMBO 6: City + PropertyType + Price + Beds + Baths (5 filters) ─────
  await testGroupFilter(
    'Combo 6: Toronto + Commercial + $1M+ + 0+ Beds + 1+ Baths',
    { city: 'Toronto', propertyType: 'Commercial', minPrice: '1000000', baths: '1' },
    {
      city: { startsWith: 'Toronto', mode: 'insensitive' },
      OR: [
        { propertyType: { contains: 'Commercial', mode: 'insensitive' } },
        { propertySubType: { contains: 'Industrial', mode: 'insensitive' } },
        { propertySubType: { contains: 'Office', mode: 'insensitive' } },
        { propertySubType: { contains: 'Retail', mode: 'insensitive' } },
        { propertySubType: { contains: 'Business', mode: 'insensitive' } },
      ],
      listPrice: { gte: 1000000 },
      bathroomsTotal: { gte: 1 },
    }
  );

  // ── COMBO 7: City + Price + MaxSqft + MaxYearBuilt + Beds (5 filters) ───
  await testGroupFilter(
    'Combo 7: Calgary + Under $400K + 2+ Beds + Max 2000 Sqft + Built Before 2015',
    { city: 'Calgary', maxPrice: '400000', beds: '2', maxSqft: '2000', maxYearBuilt: '2015' },
    {
      city: { startsWith: 'Calgary', mode: 'insensitive' },
      listPrice: { lte: 400000 },
      bedroomsTotal: { gte: 2 },
      livingArea: { lte: 2000 },
      yearBuilt: { lte: 2015 },
    }
  );

  // ── COMBO 8: City + Ownership + Baths + Price + Beds (5 filters) ────────
  await testGroupFilter(
    'Combo 8: Toronto + Condo/Strata + 2+ Beds + 2+ Baths + Under $800K',
    { city: 'Toronto', ownershipType: 'Condo/Strata', beds: '2', baths: '2', maxPrice: '800000' },
    {
      city: { startsWith: 'Toronto', mode: 'insensitive' },
      rawData: { path: ['CommonInterest'], string_contains: 'Condo/Strata' },
      bedroomsTotal: { gte: 2 },
      bathroomsTotal: { gte: 2 },
      listPrice: { lte: 800000 },
    }
  );

  // ── COMBO 9: Beds + Baths + YearBuilt Range + Price (4 filters) ─────────
  await testGroupFilter(
    'Combo 9: 3+ Beds + 2+ Baths + Built 2005–2020 + $300K–$700K',
    { beds: '3', baths: '2', minYearBuilt: '2005', maxYearBuilt: '2020', minPrice: '300000', maxPrice: '700000' },
    {
      bedroomsTotal: { gte: 3 },
      bathroomsTotal: { gte: 2 },
      yearBuilt: { gte: 2005, lte: 2020 },
      listPrice: { gte: 300000, lte: 700000 },
    }
  );

  // ── COMBO 10: City + Beds + Sqft Range + Baths + Price (5 filters) ──────
  await testGroupFilter(
    'Combo 10: Toronto + 4+ Beds + 3+ Baths + 2000–4000 Sqft + $800K–$2M',
    { city: 'Toronto', beds: '4', baths: '3', minSqft: '2000', maxSqft: '4000', minPrice: '800000', maxPrice: '2000000' },
    {
      city: { startsWith: 'Toronto', mode: 'insensitive' },
      bedroomsTotal: { gte: 4 },
      bathroomsTotal: { gte: 3 },
      livingArea: { gte: 2000, lte: 4000 },
      listPrice: { gte: 800000, lte: 2000000 },
    }
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RESULTS SUMMARY
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n\n' + '═'.repeat(70));
  console.log('                    FINAL RESULTS SUMMARY');
  console.log('═'.repeat(70) + '\n');

  const passed = results.filter(r => r.status === 'PASS');
  const failed = results.filter(r => r.status === 'FAIL');
  const errors = results.filter(r => r.status === 'ERROR');

  // Summary table
  console.log('┌─────┬───────────────────────────────────────────────────────┬───────────┬───────────┬─────────┬────────┐');
  console.log('│  #  │ Test Name                                             │ API Total │ DB Total  │  Match  │ Status │');
  console.log('├─────┼───────────────────────────────────────────────────────┼───────────┼───────────┼─────────┼────────┤');
  results.forEach((r, i) => {
    const num = String(i + 1).padStart(3);
    const name = r.name.substring(0, 55).padEnd(55);
    const api = String(r.apiTotal).padStart(9);
    const db = String(r.dbTotal).padStart(9);
    const match = r.match ? '  ✅   ' : '  ❌   ';
    const status = r.status === 'PASS' ? '  ✅  ' : r.status === 'FAIL' ? '  ❌  ' : '  💀  ';
    console.log(`│ ${num} │ ${name} │ ${api} │ ${db} │${match}│${status} │`);
  });
  console.log('└─────┴───────────────────────────────────────────────────────┴───────────┴───────────┴─────────┴────────┘');

  console.log(`\n✅ PASSED: ${passed.length}/${results.length}`);
  console.log(`❌ FAILED: ${failed.length}`);
  console.log(`💀 ERROR:  ${errors.length}`);

  if (failed.length > 0) {
    console.log('\n── FAILED DETAILS ──');
    for (const r of failed) {
      console.log(`\n  ❌ ${r.name}`);
      console.log(`     API: ${r.apiTotal} | DB: ${r.dbTotal} | Match: ${r.match}`);
      if (r.violations.length > 0) {
        console.log(`     Violations:`);
        r.violations.slice(0, 10).forEach(v => console.log(`       • ${v}`));
      }
    }
  }

  if (errors.length > 0) {
    console.log('\n── ERROR DETAILS ──');
    for (const r of errors) {
      console.log(`  💀 ${r.name}: ${r.violations[0]}`);
    }
  }

  const allMatch = results.every(r => r.match);
  const allValid = results.every(r => r.violations.length === 0);
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`API ↔ DB Count Match:    ${allMatch ? '✅ ALL MATCH' : '❌ SOME MISMATCH'}`);
  console.log(`Row-Level Validation:    ${allValid ? '✅ ALL VALID' : '❌ SOME VIOLATIONS'}`);
  console.log(`Overall:                 ${passed.length === results.length ? '🟢 ALL TESTS PASSED' : '🔴 SOME TESTS FAILED'}`);
  console.log('═'.repeat(70));

  await prisma.$disconnect();
  process.exit(failed.length + errors.length > 0 ? 1 : 0);
}

runAllTests().catch(async err => {
  console.error('Fatal:', err);
  await prisma.$disconnect();
  process.exit(1);
});
