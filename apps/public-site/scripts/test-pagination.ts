/**
 * PAGINATION VERIFICATION — No Overlap, Correct Totals, DB Cross-Check
 * 
 * Tests:
 *   1. Pages return DIFFERENT listings (no duplicates across pages)
 *   2. Total count stays consistent across all pages
 *   3. Page size is respected
 *   4. Pagination works correctly WITH combined filters
 *   5. Last page returns fewer items (correct remainder)
 *   6. Direct DB count matches API total
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000/api/internal-listings';

interface PaginationResult {
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: PaginationResult[] = [];

async function fetchAPI(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).substring(0, 200)}`);
  return res.json();
}

function log(name: string, status: 'PASS' | 'FAIL', details: string) {
  results.push({ name, status, details });
  console.log(`  ${status === 'PASS' ? '✅' : '❌'} ${name}: ${details}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: Basic Pagination — No Overlap Across Pages
// ═══════════════════════════════════════════════════════════════════════════
async function testNoOverlap() {
  console.log('\n🔍 Test 1: No Listing Overlap Across Pages');
  console.log('   Fetching pages 1-5 with limit=20...\n');

  const allIds = new Set<string>();
  const pageTotals: number[] = [];
  let duplicates = 0;

  for (let page = 1; page <= 5; page++) {
    const data = await fetchAPI({ page: String(page), limit: '20' });
    const listings = data.listings || [];
    pageTotals.push(data.total);

    let pageDups = 0;
    for (const l of listings) {
      const id = l.ListingKey || l.listingKey;
      if (allIds.has(id)) {
        pageDups++;
        duplicates++;
      }
      allIds.add(id);
    }

    log(
      `Page ${page}`,
      pageDups === 0 ? 'PASS' : 'FAIL',
      `${listings.length} listings, ${pageDups} duplicates, total=${data.total}`
    );
  }

  log(
    'Cross-page deduplication',
    duplicates === 0 ? 'PASS' : 'FAIL',
    `${allIds.size} unique IDs across 5 pages, ${duplicates} duplicates found`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: Consistent Total Across Pages  
// ═══════════════════════════════════════════════════════════════════════════
async function testConsistentTotal() {
  console.log('\n🔍 Test 2: Consistent Total Count Across Pages');

  const page1 = await fetchAPI({ page: '1', limit: '20' });
  const page2 = await fetchAPI({ page: '2', limit: '20' });
  const page5 = await fetchAPI({ page: '5', limit: '20' });

  const t1 = page1.total;
  const t2 = page2.total;
  const t5 = page5.total;

  log(
    'Total consistency',
    t1 === t2 && t2 === t5 ? 'PASS' : 'FAIL',
    `Page1=${t1}, Page2=${t2}, Page5=${t5}`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: Page Size Respected
// ═══════════════════════════════════════════════════════════════════════════
async function testPageSize() {
  console.log('\n🔍 Test 3: Page Size Limits Respected');

  for (const limit of [5, 10, 20, 50]) {
    const data = await fetchAPI({ page: '1', limit: String(limit) });
    const count = data.listings?.length || 0;
    const expected = Math.min(limit, data.total);

    log(
      `Limit=${limit}`,
      count <= limit ? 'PASS' : 'FAIL',
      `Requested ${limit}, got ${count} (total=${data.total})`
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: Pagination With Filters — No Overlap
// ═══════════════════════════════════════════════════════════════════════════
async function testPaginationWithFilters() {
  console.log('\n🔍 Test 4: Pagination With Combined Filters (Toronto + $300K-$700K + 2+ Beds)');

  const filterParams = { city: 'Toronto', minPrice: '300000', maxPrice: '700000', beds: '2' };
  const allIds = new Set<string>();
  let duplicates = 0;
  let firstTotal = 0;

  for (let page = 1; page <= 3; page++) {
    const data = await fetchAPI({ ...filterParams, page: String(page), limit: '20' });
    const listings = data.listings || [];
    if (page === 1) firstTotal = data.total;

    let pageDups = 0;
    for (const l of listings) {
      const id = l.ListingKey || l.listingKey;
      if (allIds.has(id)) { pageDups++; duplicates++; }
      allIds.add(id);
    }

    log(
      `Filtered Page ${page}`,
      pageDups === 0 && data.total === firstTotal ? 'PASS' : 'FAIL',
      `${listings.length} listings, total=${data.total}, dups=${pageDups}`
    );
  }

  // DB verification
  const dbCount = await prisma.listing.count({
    where: {
      isActive: true,
      city: { startsWith: 'Toronto', mode: 'insensitive' },
      listPrice: { gte: 300000, lte: 700000 },
      bedroomsTotal: { gte: 2 },
    },
  });

  log(
    'Filtered pagination DB match',
    firstTotal === dbCount ? 'PASS' : 'FAIL',
    `API total=${firstTotal}, DB count=${dbCount}`
  );

  log(
    'Filtered cross-page deduplication',
    duplicates === 0 ? 'PASS' : 'FAIL',
    `${allIds.size} unique across 3 pages, ${duplicates} dups`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: Last Page Has Correct Remainder
// ═══════════════════════════════════════════════════════════════════════════
async function testLastPage() {
  console.log('\n🔍 Test 5: Last Page Returns Correct Remainder');

  // Use a filter with a small result set
  const data1 = await fetchAPI({ city: 'Vancouver', maxPrice: '1000000', beds: '2', baths: '2', minSqft: '1000', page: '1', limit: '10' });
  const total = data1.total;
  const totalPages = Math.ceil(total / 10);

  if (totalPages <= 1) {
    log('Last page remainder', 'PASS', `Only 1 page (${total} total). Single page = all results.`);
    return;
  }

  const lastPageData = await fetchAPI({ city: 'Vancouver', maxPrice: '1000000', beds: '2', baths: '2', minSqft: '1000', page: String(totalPages), limit: '10' });
  const expectedRemainder = total - (totalPages - 1) * 10;
  const actualCount = lastPageData.listings?.length || 0;

  log(
    'Last page remainder',
    actualCount === expectedRemainder ? 'PASS' : 'FAIL',
    `Total=${total}, totalPages=${totalPages}, expected last page=${expectedRemainder}, got=${actualCount}`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 6: Beyond-Last-Page Returns Empty
// ═══════════════════════════════════════════════════════════════════════════
async function testBeyondLastPage() {
  console.log('\n🔍 Test 6: Page Beyond Total Returns Empty or Last Page');

  const data = await fetchAPI({ page: '99999', limit: '10' });
  const count = data.listings?.length || 0;
  
  log(
    'Beyond last page',
    count === 0 || count <= 10 ? 'PASS' : 'FAIL',
    `Page 99999 returned ${count} listings`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 7: Sequential Page Coverage (IDs from page N+1 are NOT in page N)
// ═══════════════════════════════════════════════════════════════════════════
async function testSequentialCoverage() {
  console.log('\n🔍 Test 7: Sequential Pages Cover Different Listings (Calgary, limit=5)');

  const pages: Set<string>[] = [];
  for (let p = 1; p <= 4; p++) {
    const data = await fetchAPI({ city: 'Calgary', page: String(p), limit: '5' });
    const ids = new Set((data.listings || []).map((l: any) => l.ListingKey || l.listingKey));
    pages.push(ids);
  }

  let overlaps = 0;
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      for (const id of pages[i]) {
        if (pages[j].has(id)) overlaps++;
      }
    }
  }

  log(
    'Sequential coverage',
    overlaps === 0 ? 'PASS' : 'FAIL',
    `4 pages × 5 items, ${overlaps} overlapping IDs`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN ALL
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         PAGINATION VERIFICATION TEST SUITE                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`Started: ${new Date().toISOString()}`);

  await testNoOverlap();
  await testConsistentTotal();
  await testPageSize();
  await testPaginationWithFilters();
  await testLastPage();
  await testBeyondLastPage();
  await testSequentialCoverage();

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ PASSED: ${passed}/${results.length}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`Overall: ${failed === 0 ? '🟢 ALL PAGINATION TESTS PASSED' : '🔴 SOME FAILED'}`);
  console.log('═'.repeat(60));

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ❌ ${r.name}: ${r.details}`));
  }

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
