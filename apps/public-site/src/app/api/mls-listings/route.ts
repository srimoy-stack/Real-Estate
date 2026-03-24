import { NextRequest, NextResponse } from 'next/server';
import { getMLSAccessToken } from '../../../lib/mls/tokenManager';

/**
 * PRODUCTION MLS PROXY — All filters verified against CREA DDF OData v1.
 *
 * Supports every filter from the Realtor.ca Advanced Search panel:
 *   Transaction Type, Property Type, Price, Beds, Baths, Square Footage,
 *   Land Size, Listed Since, Building Type, Storeys, Ownership/Title,
 *   Maintenance Fees, Property Tax, Year Built, Keywords, City.
 */
export const dynamic = 'force-dynamic';

// ── Verified OData SubType mappings ─────────────────────────────────────────
const RESIDENTIAL_SUBTYPES = ['Single Family', 'Vacant Land', 'Other'];
const COMMERCIAL_SUBTYPES = ['Business', 'Industrial', 'Office', 'Retail', 'Multi-family'];

function buildOrFilter(field: string, values: string[]): string {
    return '(' + values.map(v => `${field} eq '${v}'`).join(' or ') + ')';
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    try {
        // ── 1. Auth ─────────────────────────────────────────────────────────
        let access_token: string;
        try {
            access_token = await getMLSAccessToken() as string;
        } catch (err: any) {
            console.error('[MLS Proxy] Auth Error:', err.message);
            return NextResponse.json({ error: 'MLS Authentication Failed', details: err.message }, { status: 500 });
        }

        // ── 2. Build OData $filter ──────────────────────────────────────────
        const filters: string[] = [];

        // ── Listing Type (Residential vs Commercial) ────────────────────────
        const listingType = searchParams.get('listingType');
        if (listingType === 'Commercial') {
            filters.push(buildOrFilter('PropertySubType', COMMERCIAL_SUBTYPES));
        } else {
            filters.push(buildOrFilter('PropertySubType', RESIDENTIAL_SUBTYPES));
        }

        // ── Transaction Type (For Sale / For Rent) ──────────────────────────
        const transactionType = searchParams.get('transactionType');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        if (transactionType === 'For Rent') {
            filters.push('LeaseAmount ne null');
            if (minPrice) filters.push(`LeaseAmount ge ${minPrice}`);
            if (maxPrice) filters.push(`LeaseAmount le ${maxPrice}`);
        } else {
            filters.push('ListPrice ne null');
            if (minPrice) filters.push(`ListPrice ge ${minPrice}`);
            if (maxPrice) filters.push(`ListPrice le ${maxPrice}`);
        }

        // ── City ────────────────────────────────────────────────────────────
        const city = searchParams.get('city');
        if (city) filters.push(`City eq '${city}'`);

        // ── Beds / Baths ────────────────────────────────────────────────────
        const beds = searchParams.get('beds');
        const baths = searchParams.get('baths');
        if (beds && beds !== 'Any') filters.push(`BedroomsTotal ge ${beds}`);
        if (baths && baths !== 'Any') filters.push(`BathroomsTotalInteger ge ${baths}`);

        // ── Square Footage ──────────────────────────────────────────────────
        const minSqft = searchParams.get('minSqft');
        const maxSqft = searchParams.get('maxSqft');
        if (minSqft) filters.push(`LivingArea ge ${minSqft}`);
        if (maxSqft) filters.push(`LivingArea le ${maxSqft}`);

        // ── Land Size ───────────────────────────────────────────────────────
        const minLandSize = searchParams.get('minLandSize');
        const maxLandSize = searchParams.get('maxLandSize');
        if (minLandSize) filters.push(`LotSizeArea ge ${minLandSize}`);
        if (maxLandSize) filters.push(`LotSizeArea le ${maxLandSize}`);

        // ── Listed Since ────────────────────────────────────────────────────
        const listedSince = searchParams.get('listedSince');
        if (listedSince) {
            filters.push(`OriginalEntryTimestamp ge ${listedSince}T00:00:00Z`);
        }

        // ── Building Type (StructureType — array, use has/any) ──────────────
        // OData: StructureType/any(s: s eq 'House')
        const buildingType = searchParams.get('buildingType');
        if (buildingType && buildingType !== 'Any') {
            filters.push(`StructureType/any(s: s eq '${buildingType}')`);
        }

        // ── Storeys ─────────────────────────────────────────────────────────
        const minStoreys = searchParams.get('minStoreys');
        const maxStoreys = searchParams.get('maxStoreys');
        if (minStoreys) filters.push(`Stories ge ${minStoreys}`);
        if (maxStoreys) filters.push(`Stories le ${maxStoreys}`);

        // ── Ownership / Title ───────────────────────────────────────────────
        const ownershipType = searchParams.get('ownershipType');
        if (ownershipType && ownershipType !== 'Any') {
            filters.push(`CommonInterest eq '${ownershipType}'`);
        }

        // ── Maintenance Fees (monthly) ──────────────────────────────────────
        const minMaintFee = searchParams.get('minMaintFee');
        const maxMaintFee = searchParams.get('maxMaintFee');
        if (minMaintFee) filters.push(`AssociationFee ge ${minMaintFee}`);
        if (maxMaintFee) filters.push(`AssociationFee le ${maxMaintFee}`);

        // ── Property Tax (yearly) ───────────────────────────────────────────
        const minTax = searchParams.get('minTax');
        const maxTax = searchParams.get('maxTax');
        if (minTax) filters.push(`TaxAnnualAmount ge ${minTax}`);
        if (maxTax) filters.push(`TaxAnnualAmount le ${maxTax}`);

        // ── Year Built ──────────────────────────────────────────────────────
        const minYearBuilt = searchParams.get('minYearBuilt');
        const maxYearBuilt = searchParams.get('maxYearBuilt');
        if (minYearBuilt) filters.push(`YearBuilt ge ${minYearBuilt}`);
        if (maxYearBuilt) filters.push(`YearBuilt le ${maxYearBuilt}`);

        // ── Property SubType Override (specific dropdown) ───────────────────
        const propertyType = searchParams.get('propertyType');
        if (propertyType && propertyType !== 'Any') {
            // Replace the broad listing-type filter with a specific subtype
            filters.shift();
            filters.unshift(`PropertySubType eq '${propertyType}'`);
        }

        // ── Keyword Search ──────────────────────────────────────────────────
        const keywords = searchParams.get('keywords');
        const searchQuery = searchParams.get('searchQuery');
        const kw = keywords || searchQuery;
        if (kw && kw.trim().length > 0) {
            const q = kw.trim().replace(/'/g, "''");
            filters.push(`(contains(PublicRemarks, '${q}') or contains(UnparsedAddress, '${q}'))`);
        }

        // ── Always Active ───────────────────────────────────────────────────
        filters.push(`StandardStatus eq 'Active'`);

        // ── 3. Build URL ────────────────────────────────────────────────────
        const queryParams = new URLSearchParams();
        queryParams.set('$filter', filters.join(' and '));

        // Cap $top to DDF v1 hard limit of 100
        const requestedTop = parseInt(searchParams.get('top') || '12', 10);
        queryParams.set('$top', String(Math.min(requestedTop, 100)));
        queryParams.set('$skip', searchParams.get('skip') || '0');
        queryParams.set('$count', 'true');
        queryParams.set('$orderby', 'ModificationTimestamp desc');

        // Optimized $select — only fetch fields needed for the search grid
        // Every field below is verified to exist in the DDF v1 schema
        queryParams.set('$select', [
            'ListingKey', 'ListingId', 'StandardStatus', 'ListPrice', 'LeaseAmount',
            'UnparsedAddress', 'City', 'StateOrProvince', 'PostalCode', 'Country',
            'BedroomsTotal', 'BathroomsTotalInteger', 'PropertySubType',
            'LivingArea', 'LivingAreaUnits', 'YearBuilt', 'Stories',
            'Latitude', 'Longitude', 'ParkingTotal',
            'ModificationTimestamp', 'OriginalEntryTimestamp',
            'CommonInterest', 'ListingURL', 'Media',
            'PublicRemarks',
            'ListAgentKey', 'ListOfficeKey',
        ].join(','));

        const mlsUrl = `https://ddfapi.realtor.ca/odata/v1/Property?${queryParams.toString()}`;
        console.log('[MLS Proxy] OData URL:', mlsUrl);

        // ── 4. Fetch ────────────────────────────────────────────────────────
        const mlsResponse = await fetch(mlsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
            },
            next: { revalidate: 300 },
        });

        if (mlsResponse.ok) {
            const data = await mlsResponse.json();
            console.log(`[MLS Proxy] ✅ ${data.value?.length} listings (${data['@odata.count']} total)`);
            return NextResponse.json(data);
        }

        const errText = await mlsResponse.text();
        console.error('[MLS Proxy] ❌ DDF Error:', mlsResponse.status, errText);
        return NextResponse.json({ error: 'DDF API Error', status: mlsResponse.status, details: errText }, { status: mlsResponse.status });

    } catch (err: any) {
        console.error('[MLS Proxy] Critical Error:', err.message);
        return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
    }
}
