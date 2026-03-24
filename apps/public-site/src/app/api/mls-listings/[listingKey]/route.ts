import { NextRequest, NextResponse } from 'next/server';
import { getMLSAccessToken } from '../../../../lib/mls/tokenManager';

export const dynamic = 'force-dynamic';

export async function GET(
    _request: NextRequest,
    { params }: { params: { listingKey: string } }
) {
    const { listingKey } = params;

    if (!listingKey) {
        return NextResponse.json({ error: 'ListingKey is required' }, { status: 400 });
    }

    try {
        const access_token = await getMLSAccessToken() as string;

        // Use Property('KEY') syntax for OData single-item lookup
        // Media is a complex property, not needing $expand in v1
        const mlsUrl = `https://ddfapi.realtor.ca/odata/v1/Property('${listingKey}')`;

        console.log('[MLS Detail Proxy] Fetching Property:', listingKey);

        const mlsResponse = await fetch(mlsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
            },
            next: { revalidate: 3600 }, // 1 hour detail cache
        });

        if (mlsResponse.ok) {
            const data = await mlsResponse.json();
            return NextResponse.json(data);
        }

        const errText = await mlsResponse.text();
        console.error('[MLS Detail Proxy] CREA Error:', mlsResponse.status, errText);
        return NextResponse.json({ error: 'Property not found', status: mlsResponse.status }, { status: mlsResponse.status });

    } catch (err: any) {
        console.error('[MLS Detail Proxy] Critical Error:', err.message);
        return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
    }
}
