/**
 * Helper to fetch a fresh access token from CREA Identity Server.
 */
export async function getMLSAccessToken() {
    const clientId = process.env.MLS_CLIENT_ID || process.env.DDF_CLIENT_ID;
    const clientSecret = process.env.MLS_CLIENT_SECRET || process.env.DDF_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('MLS_CLIENT_ID or MLS_CLIENT_SECRET (or DDF_ equivalents) is not configured in environment variables.');
    }

    const tokenUrl = 'https://identity.crea.ca/connect/token';

    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('client_id', clientId);
    body.append('client_secret', clientSecret);
    body.append('scope', 'DDFApi_Read');

    console.log('[MLS Token] Fetching fresh token...');

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
        // Token generation should probably not be cached globally by Next.js in a way that returns expired tokens
        cache: 'no-store',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[MLS Token] Failed to fetch token:', response.status, errorText);
        throw new Error(`Token generation failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[MLS Token] Token fetched successfully');
    return data.access_token;
}
