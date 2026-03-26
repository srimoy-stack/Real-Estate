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

// Singleton promise to prevent redundant concurrent token requests
let tokenPromise: Promise<string> | null = null;

/**
 * Returns a valid access token.
 * Prevents "thundering herd" problem by using a shared promise for background refreshes.
 */
export async function getMLSAccessToken() {
    const now = Date.now();

    // 1. Check if valid token exists in memory (with 2m buffer)
    if (cache.token && cache.expiresAt && now < cache.expiresAt - 120000) {
        return cache.token;
    }

    // 2. If a fetch is already in progress, wait for it
    if (tokenPromise) {
        console.log('[TokenManager] Waiting for existing token request...');
        return tokenPromise;
    }

    // 3. Start a new singleton promise
    tokenPromise = fetchNewToken()
        .then(token => {
            tokenPromise = null;
            return token;
        })
        .catch(err => {
            tokenPromise = null;
            throw err;
        });

    return tokenPromise;
}

/**
 * Perform actual token exchange with CREA Identity Provider.
 * Includes a retry mechanism for improved reliability.
 */
async function fetchNewToken(retries = 2): Promise<string> {
    const clientId = process.env.MLS_CLIENT_ID;
    const clientSecret = process.env.MLS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('MLS_CLIENT_ID or MLS_CLIENT_SECRET NOT CONFIGURED');
    }

    let lastError: any = null;

    for (let i = 0; i <= retries; i++) {
        try {
            if (i > 0) console.log(`[TokenManager] Retry ${i}/${retries}...`);

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
                // Use a standard 10s timeout
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Auth failed (${response.status}): ${errText}`);
            }

            const data = await response.json();

            // Cache for subsequent calls
            const token = data.access_token;
            if (!token) throw new Error('No access_token returned from CREA');

            cache = {
                token: token,
                expiresAt: Date.now() + (data.expires_in * 1000),
            };

            console.log(`[TokenManager] ✅ New token cached. Expires in ${data.expires_in}s`);
            return token;


        } catch (err: any) {
            lastError = err;
            console.warn(`[TokenManager] Attempt ${i + 1} failed:`, err.message);
            if (i < retries) await new Promise(r => setTimeout(r, 1500));
        }
    }

    throw lastError || new Error('Token fetch failed after retries');
}

