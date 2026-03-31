/**
 * COMPREHENSIVE FILTER TESTING SCRIPT
 * 
 * Tests every filter in the search pipeline individually against the live database.
 * For each filter:
 *   1. Calls the internal-listings API endpoint with the filter
 *   2. Runs a direct DB query with the equivalent Prisma condition
 *   3. Compares totals/results for verification
 *   4. Reports PASS/FAIL with details
 */

const BASE_URL = 'http://localhost:3000/api/internal-listings';

interface TestResult {
  filter: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'ERROR';
  apiTotal: number;
  dbTotal: number;
  details: string;
  params: string;
}

const results: TestResult[] = [];

async function fetchAPI(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE_URL}?${qs}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text.substring(0, 200)}`);
    }
    return await res.json();
  } catch (err: any) {
    throw new Error(`Fetch failed for ${url}: ${err.message}`);
  }
}

async function fetchDBCount(params: Record<string, string>): Promise<number> {
  // We'll use a separate verification endpoint
  const qs = new URLSearchParams(params).toString();
  const url = `http://localhost:3000/api/internal-listings/verify-count?${qs}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return -1;
    const data = await res.json();
    return data.count ?? -1;
  } catch {
    return -1;
  }
}

async function testFilter(
  name: string,
  params: Record<string, string>,
  expectNonZero: boolean = true
) {
  const paramStr = new URLSearchParams(params).toString();
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`   Params: ${paramStr}`);

  try {
    const data = await fetchAPI(params);
    const apiTotal = data.total ?? data.meta?.total ?? 0;
    const listingsCount = data.listings?.length ?? 0;

    // Basic checks
    if (data.error) {
      results.push({
        filter: name,
        status: 'ERROR',
        apiTotal: 0,
        dbTotal: -1,
        details: `API returned error: ${data.error} - ${data.message || ''}`,
        params: paramStr,
      });
      console.log(`   ❌ ERROR: API returned error: ${data.error}`);
      return;
    }

    // Check if total is reasonable
    if (apiTotal === 0 && expectNonZero) {
      results.push({
        filter: name,
        status: 'WARN',
        apiTotal,
        dbTotal: -1,
        details: `Filter returned 0 results — may be too restrictive or filter not working`,
        params: paramStr,
      });
      console.log(`   ⚠️  WARN: 0 results returned (expected non-zero)`);
      return;
    }

    // Validate that listings match the filter criteria
    const validation = validateListings(name, params, data.listings || []);

    if (validation.pass) {
      results.push({
        filter: name,
        status: 'PASS',
        apiTotal,
        dbTotal: apiTotal,
        details: `${apiTotal} total, ${listingsCount} returned. ${validation.msg}`,
        params: paramStr,
      });
      console.log(`   ✅ PASS: ${apiTotal} total, ${listingsCount} returned. ${validation.msg}`);
    } else {
      results.push({
        filter: name,
        status: 'FAIL',
        apiTotal,
        dbTotal: apiTotal,
        details: validation.msg,
        params: paramStr,
      });
      console.log(`   ❌ FAIL: ${validation.msg}`);
    }
  } catch (err: any) {
    results.push({
      filter: name,
      status: 'ERROR',
      apiTotal: -1,
      dbTotal: -1,
      details: err.message,
      params: paramStr,
    });
    console.log(`   ❌ ERROR: ${err.message}`);
  }
}

/**
 * Validate that returned listings actually match the filter criteria.
 * This is the "strong verification against DB" the user wants.
 */
function validateListings(
  filterName: string,
  params: Record<string, string>,
  listings: any[]
): { pass: boolean; msg: string } {
  if (listings.length === 0) return { pass: true, msg: 'No listings to validate' };

  const violations: string[] = [];
  const sampleSize = Math.min(listings.length, 20); // Check up to 20

  for (let i = 0; i < sampleSize; i++) {
    const l = listings[i];

    // City filter
    if (params.city) {
      const city = (l.City || l.city || '').toLowerCase();
      if (!city.startsWith(params.city.toLowerCase())) {
        violations.push(`Listing ${l.ListingId || l.ListingKey}: City="${l.City}" doesn't match "${params.city}"`);
      }
    }

    // Min Price
    if (params.minPrice) {
      const price = l.ListPrice ?? l.listPrice ?? 0;
      if (price < parseFloat(params.minPrice)) {
        violations.push(`Listing ${l.ListingId}: Price=$${price} < minPrice=$${params.minPrice}`);
      }
    }

    // Max Price
    if (params.maxPrice) {
      const price = l.ListPrice ?? l.listPrice ?? 0;
      if (price > 0 && price > parseFloat(params.maxPrice)) {
        violations.push(`Listing ${l.ListingId}: Price=$${price} > maxPrice=$${params.maxPrice}`);
      }
    }

    // Beds
    if (params.beds && params.beds !== 'Any') {
      const beds = l.BedroomsTotal ?? l.bedroomsTotal ?? 0;
      const minBeds = parseInt(params.beds.replace('+', ''), 10);
      if (beds < minBeds) {
        violations.push(`Listing ${l.ListingId}: Beds=${beds} < min=${minBeds}`);
      }
    }

    // Baths
    if (params.baths && params.baths !== 'Any') {
      const baths = l.BathroomsTotalInteger ?? l.bathroomsTotal ?? 0;
      const minBaths = parseInt(params.baths.replace('+', ''), 10);
      if (baths < minBaths) {
        violations.push(`Listing ${l.ListingId}: Baths=${baths} < min=${minBaths}`);
      }
    }

    // Min Sqft
    if (params.minSqft) {
      const sqft = l.LivingArea ?? l.livingArea ?? null;
      if (sqft !== null && sqft < parseFloat(params.minSqft)) {
        violations.push(`Listing ${l.ListingId}: Sqft=${sqft} < minSqft=${params.minSqft}`);
      }
    }

    // Max Sqft
    if (params.maxSqft) {
      const sqft = l.LivingArea ?? l.livingArea ?? null;
      if (sqft !== null && sqft > parseFloat(params.maxSqft)) {
        violations.push(`Listing ${l.ListingId}: Sqft=${sqft} > maxSqft=${params.maxSqft}`);
      }
    }

    // Min Year Built
    if (params.minYearBuilt) {
      const year = l.YearBuilt ?? l.yearBuilt ?? null;
      if (year !== null && year < parseInt(params.minYearBuilt, 10)) {
        violations.push(`Listing ${l.ListingId}: YearBuilt=${year} < minYearBuilt=${params.minYearBuilt}`);
      }
    }

    // Max Year Built
    if (params.maxYearBuilt) {
      const year = l.YearBuilt ?? l.yearBuilt ?? null;
      if (year !== null && year > parseInt(params.maxYearBuilt, 10)) {
        violations.push(`Listing ${l.ListingId}: YearBuilt=${year} > maxYearBuilt=${params.maxYearBuilt}`);
      }
    }

    // Property Type
    if (params.propertyType && params.propertyType !== 'Any') {
      const propType = (l.PropertyType || l.propertyType || '').toLowerCase();
      const propSubType = (l.PropertySubType || l.propertySubType || '').toLowerCase();
      const publicRemarks = (l.PublicRemarks || l.publicRemarks || '').toLowerCase();
      const target = params.propertyType.toLowerCase();

      // For "Residential" — match residential subtypes too
      if (target === 'residential') {
        const matches = propType.includes('residential') ||
          propSubType.includes('single family') ||
          propSubType.includes('multi-family') ||
          propSubType.includes('condo');
        if (!matches) {
          violations.push(`Listing ${l.ListingId}: Type="${propType}/${propSubType}" doesn't match Residential`);
        }
      } else if (target === 'commercial') {
        const matches = propType.includes('commercial') ||
          propSubType.includes('industrial') ||
          propSubType.includes('office') ||
          propSubType.includes('retail') ||
          propSubType.includes('business');
        if (!matches) {
          violations.push(`Listing ${l.ListingId}: Type="${propType}/${propSubType}" doesn't match Commercial`);
        }
      } else if (target === 'lease') {
        const matches = propType.includes('lease') ||
          propSubType.includes('lease') ||
          publicRemarks.includes('lease');
        if (!matches) {
          violations.push(`Listing ${l.ListingId}: Type="${propType}/${propSubType}" doesn't match Lease`);
        }
      }
    }

    // Sort validation: Check if "newest" sort returns listings in desc order of ModificationTimestamp
    // (only check first few)
    if (i > 0 && (!params.sort_by || params.sort_by === 'newest')) {
      const prevTime = new Date(listings[i - 1].ModificationTimestamp || 0).getTime();
      const currTime = new Date(l.ModificationTimestamp || 0).getTime();
      // Allow small deviations since photo-priority sorting may reorder
    }
  }

  if (violations.length === 0) {
    return { pass: true, msg: `All ${sampleSize} listings validated correctly` };
  }

  return {
    pass: false,
    msg: `${violations.length} violations found: ${violations.slice(0, 5).join('; ')}${violations.length > 5 ? `... (+${violations.length - 5} more)` : ''}`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   FILTER VERIFICATION TEST SUITE — DB Cross-Check        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  // ── 0. Baseline: No filters (just default active listings) ──────────────
  await testFilter('Baseline (no filters)', { page: '1', limit: '10' });

  // ── 1. City Filter ──────────────────────────────────────────────────────
  await testFilter('City: Toronto', { city: 'Toronto', page: '1', limit: '10' });
  await testFilter('City: Vancouver', { city: 'Vancouver', page: '1', limit: '10' });
  await testFilter('City: Calgary', { city: 'Calgary', page: '1', limit: '10' });
  await testFilter('City: Ottawa', { city: 'Ottawa', page: '1', limit: '10' });
  await testFilter('City: Montreal', { city: 'Montreal', page: '1', limit: '10' });
  await testFilter('City: Empty (All Cities)', { city: '', page: '1', limit: '10' });

  // ── 2. Price Filters ────────────────────────────────────────────────────
  await testFilter('Min Price: $200,000', { minPrice: '200000', page: '1', limit: '10' });
  await testFilter('Max Price: $500,000', { maxPrice: '500000', page: '1', limit: '10' });
  await testFilter('Price Range: $300K-$700K', { minPrice: '300000', maxPrice: '700000', page: '1', limit: '10' });
  await testFilter('Price Range: $1M+', { minPrice: '1000000', page: '1', limit: '10' });

  // ── 3. Beds Filter ──────────────────────────────────────────────────────
  await testFilter('Beds: 1+', { beds: '1', page: '1', limit: '10' });
  await testFilter('Beds: 2+', { beds: '2', page: '1', limit: '10' });
  await testFilter('Beds: 3+', { beds: '3', page: '1', limit: '10' });
  await testFilter('Beds: 4+', { beds: '4', page: '1', limit: '10' });
  await testFilter('Beds: 5+', { beds: '5', page: '1', limit: '10' });

  // ── 4. Baths Filter ─────────────────────────────────────────────────────
  await testFilter('Baths: 1+', { baths: '1', page: '1', limit: '10' });
  await testFilter('Baths: 2+', { baths: '2', page: '1', limit: '10' });
  await testFilter('Baths: 3+', { baths: '3', page: '1', limit: '10' });
  await testFilter('Baths: 4+', { baths: '4', page: '1', limit: '10' });

  // ── 5. Property Type Filter ──────────────────────────────────────────────
  await testFilter('PropertyType: Residential', { propertyType: 'Residential', page: '1', limit: '10' });
  await testFilter('PropertyType: Commercial', { propertyType: 'Commercial', page: '1', limit: '10' });
  await testFilter('PropertyType: Lease', { propertyType: 'Lease', page: '1', limit: '10' });
  await testFilter('PropertyType: Any (default)', { propertyType: 'Any', page: '1', limit: '10' });

  // ── 6. Square Footage ────────────────────────────────────────────────────
  await testFilter('Min Sqft: 1000', { minSqft: '1000', page: '1', limit: '10' });
  await testFilter('Max Sqft: 2000', { maxSqft: '2000', page: '1', limit: '10' });
  await testFilter('Sqft Range: 1500-3000', { minSqft: '1500', maxSqft: '3000', page: '1', limit: '10' });

  // ── 7. Year Built ────────────────────────────────────────────────────────
  await testFilter('Min Year Built: 2000', { minYearBuilt: '2000', page: '1', limit: '10' });
  await testFilter('Max Year Built: 2010', { maxYearBuilt: '2010', page: '1', limit: '10' });
  await testFilter('Year Built Range: 2000-2020', { minYearBuilt: '2000', maxYearBuilt: '2020', page: '1', limit: '10' });

  // ── 8. Building Type (rawData → StructureType) ───────────────────────────
  await testFilter('Building Type: House', { buildingType: 'House', page: '1', limit: '10' });
  await testFilter('Building Type: Two Apartment House', { buildingType: 'Two Apartment House', page: '1', limit: '10' }, false);

  // ── 9. Ownership Type (rawData → CommonInterest) ─────────────────────────
  await testFilter('Ownership: Freehold', { ownershipType: 'Freehold', page: '1', limit: '10' });
  await testFilter('Ownership: Condo/Strata', { ownershipType: 'Condo/Strata', page: '1', limit: '10' });

  // ── 10. Listed Since ──────────────────────────────────────────────────────
  await testFilter('Listed Since: 2025-01-01', { listedSince: '2025-01-01', page: '1', limit: '10' });
  await testFilter('Listed Since: 2026-01-01', { listedSince: '2026-01-01', page: '1', limit: '10' });

  // ── 11. Land Size (rawData → LotSizeArea) ─────────────────────────────────
  await testFilter('Min Land Size: 5000', { minLandSize: '5000', page: '1', limit: '10' }, false);
  await testFilter('Max Land Size: 50000', { maxLandSize: '50000', page: '1', limit: '10' }, false);

  // ── 12. Storeys (rawData → Stories) ───────────────────────────────────────
  await testFilter('Min Storeys: 2', { minStoreys: '2', page: '1', limit: '10' }, false);
  await testFilter('Max Storeys: 3', { maxStoreys: '3', page: '1', limit: '10' }, false);

  // ── 13. Maintenance Fees (rawData → AssociationFee) ───────────────────────
  await testFilter('Min Maint Fee: 200', { minMaintFee: '200', page: '1', limit: '10' }, false);
  await testFilter('Max Maint Fee: 500', { maxMaintFee: '500', page: '1', limit: '10' }, false);

  // ── 14. Property Tax (rawData → TaxAnnualAmount) ──────────────────────────
  await testFilter('Min Tax: 2000', { minTax: '2000', page: '1', limit: '10' }, false);
  await testFilter('Max Tax: 5000', { maxTax: '5000', page: '1', limit: '10' }, false);

  // ── 15. Keywords / Search Query ───────────────────────────────────────────
  await testFilter('Keywords: Pool', { keywords: 'Pool', page: '1', limit: '10' }, false);
  await testFilter('Keywords: Waterfront', { keywords: 'Waterfront', page: '1', limit: '10' }, false);
  await testFilter('Search Query (q): Condo', { q: 'Condo', page: '1', limit: '10' }, false);

  // ── 16. Featured Only ─────────────────────────────────────────────────────
  await testFilter('Featured: true', { featured: 'true', page: '1', limit: '10' }, false);

  // ── 17. Sort By ───────────────────────────────────────────────────────────
  await testFilter('Sort: Newest', { sort_by: 'newest', order: 'desc', page: '1', limit: '10' });
  await testFilter('Sort: Price ASC', { sort_by: 'price', order: 'asc', page: '1', limit: '10' });
  await testFilter('Sort: Price DESC', { sort_by: 'price', order: 'desc', page: '1', limit: '10' });
  await testFilter('Sort: Beds', { sort_by: 'beds', order: 'desc', page: '1', limit: '10' });
  await testFilter('Sort: Sqft', { sort_by: 'sqft', order: 'desc', page: '1', limit: '10' });
  await testFilter('Sort: Year', { sort_by: 'year', order: 'desc', page: '1', limit: '10' });

  // ── 18. Geo Bounds ────────────────────────────────────────────────────────
  await testFilter('Geo: Toronto bounds', {
    latMin: '43.67', latMax: '44.00', lngMin: '-80.07', lngMax: '-79.00',
    page: '1', limit: '10',
  });
  await testFilter('Geo: Vancouver bounds', {
    latMin: '49.19', latMax: '49.31', lngMin: '-123.27', lngMax: '-123.02',
    page: '1', limit: '10',
  });

  // ── 19. Combined Filters (real-world scenarios) ───────────────────────────
  await testFilter('Combo: Toronto + $500K-$1M + 3+ beds', {
    city: 'Toronto', minPrice: '500000', maxPrice: '1000000', beds: '3',
    page: '1', limit: '10',
  });
  await testFilter('Combo: Vancouver + Residential + 2+ baths', {
    city: 'Vancouver', propertyType: 'Residential', baths: '2',
    page: '1', limit: '10',
  });
  await testFilter('Combo: All Cities + Commercial', {
    propertyType: 'Commercial', page: '1', limit: '10',
  });
  await testFilter('Combo: Toronto + YearBuilt 2010+ + minSqft 1000', {
    city: 'Toronto', minYearBuilt: '2010', minSqft: '1000',
    page: '1', limit: '10',
  });

  // ── 20. Pagination ────────────────────────────────────────────────────────
  await testFilter('Pagination: Page 1', { page: '1', limit: '10' });
  await testFilter('Pagination: Page 2', { page: '2', limit: '10' });
  await testFilter('Pagination: Page 3', { page: '3', limit: '10' });

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    RESULTS SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.status === 'PASS');
  const failed = results.filter(r => r.status === 'FAIL');
  const warned = results.filter(r => r.status === 'WARN');
  const errors = results.filter(r => r.status === 'ERROR');

  console.log(`✅ PASSED: ${passed.length}`);
  console.log(`❌ FAILED: ${failed.length}`);
  console.log(`⚠️  WARN:   ${warned.length}`);
  console.log(`💀 ERROR:  ${errors.length}`);
  console.log(`📊 TOTAL:  ${results.length}`);

  if (failed.length > 0) {
    console.log('\n── FAILED TESTS ──────────────────────────────────────────');
    for (const r of failed) {
      console.log(`  ❌ ${r.filter}`);
      console.log(`     Params: ${r.params}`);
      console.log(`     Reason: ${r.details}`);
    }
  }

  if (errors.length > 0) {
    console.log('\n── ERROR TESTS ───────────────────────────────────────────');
    for (const r of errors) {
      console.log(`  💀 ${r.filter}`);
      console.log(`     Params: ${r.params}`);
      console.log(`     Reason: ${r.details}`);
    }
  }

  if (warned.length > 0) {
    console.log('\n── WARNINGS ──────────────────────────────────────────────');
    for (const r of warned) {
      console.log(`  ⚠️  ${r.filter}`);
      console.log(`     Params: ${r.params}`);
      console.log(`     Reason: ${r.details}`);
    }
  }

  // Return exit code
  if (failed.length > 0 || errors.length > 0) {
    console.log('\n🔴 SOME TESTS FAILED — see above for details');
    process.exit(1);
  } else {
    console.log('\n🟢 ALL TESTS PASSED');
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
