/**
 * PRODUCTION-READY MLS TOKEN MANAGER
 * Handles token caching and automatic refresh before expiry.
 */

interface TokenCache {
    token: string | null;
    expiresAt: number | null;
}

// In-memory cache (works across requests on the same warm lambda instance)
let cache: TokenCache = {
    token: null,
    expiresAt: null,
};

export async function getMLSAccessToken() {
    const now = Date.now();

    // Return cached token if valid (with 2 minute buffer for safety)
    if (cache.token && cache.expiresAt && now < cache.expiresAt - 120000) {
        console.log('[TokenManager] Using cached MLS token');
        return cache.token;
    }

    return await fetchNewToken();
}

async function fetchNewToken() {
    const clientId = process.env.MLS_CLIENT_ID;
    const clientSecret = process.env.MLS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('MLS_CLIENT_ID or MLS_CLIENT_SECRET NOT CONFIGURED');
    }

    console.log('[TokenManager] Fetching new access token from CREA...');

    const response = await fetch('https://identity.crea.ca/connect/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'DDFApi_Read',
        }),
        cache: 'no-store',
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Token request failed: ${response.status} ${errText}`);
    }

    const data = await response.json();

    // Cache the new token
    cache = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
    };

    console.log(`[TokenManager] New token stored. Expires in ${data.expires_in}s`);
    return cache.token;
}
