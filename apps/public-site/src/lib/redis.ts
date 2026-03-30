import Redis from 'ioredis';

let redis: Redis | null = null;

function getRedisClient(): Redis | null {
    if (redis) return redis;

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            connectTimeout: 3000,
            commandTimeout: 2000,
            lazyConnect: true,
            retryStrategy(times: number) {
                if (times > 3) return null; // Stop retrying after 3 attempts
                return Math.min(times * 200, 1000);
            },
        });

        redis.on('error', (err) => {
            console.warn('[Redis] Connection error (non-fatal):', err.message);
        });

        redis.connect().catch(() => {
            console.warn('[Redis] Initial connect failed — will fallback to DB');
            redis = null;
        });

        return redis;
    } catch {
        console.warn('[Redis] Failed to create client — will fallback to DB');
        return null;
    }
}

/**
 * Normalize query params for consistent cache keys.
 * Removes undefined/null/empty values & sorts keys alphabetically.
 */
function normalizeParams(params: Record<string, string>): string {
    const cleaned: Record<string, string> = {};
    const sortedKeys = Object.keys(params).sort();

    for (const key of sortedKeys) {
        const val = params[key];
        if (val !== undefined && val !== null && val !== '' && val !== 'undefined' && val !== 'null') {
            cleaned[key] = val;
        }
    }

    return JSON.stringify(cleaned);
}

/**
 * Build a deterministic cache key from search params.
 */
export function buildCacheKey(searchParams: URLSearchParams): string {
    const paramsObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        paramsObj[key] = value;
    });
    return `listings:${normalizeParams(paramsObj)}`;
}

/**
 * Try to get a cached response. Returns null on miss or Redis failure.
 */
export async function getCached(key: string): Promise<any | null> {
    try {
        const client = getRedisClient();
        if (!client) return null;

        const data = await client.get(key);
        if (!data) return null;

        return JSON.parse(data);
    } catch (err: any) {
        console.warn('[Redis] GET failed (falling back to DB):', err.message);
        return null;
    }
}

/**
 * Store a response in cache. Fails silently on Redis error.
 */
export async function setCache(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    try {
        const client = getRedisClient();
        if (!client) return;

        await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err: any) {
        console.warn('[Redis] SET failed (non-fatal):', err.message);
    }
}

/**
 * Flush all listing cache keys after sync.
 * Uses SCAN-based deletion to only remove `listings:*` keys.
 * Fails silently — sync must never crash because of Redis.
 */
export async function flushListingsCache(): Promise<void> {
    try {
        const client = getRedisClient();
        if (!client) return;

        let cursor = '0';
        let totalDeleted = 0;

        do {
            const [nextCursor, keys] = await client.scan(cursor, 'MATCH', 'listings:*', 'COUNT', 200);
            cursor = nextCursor;
            if (keys.length > 0) {
                await client.del(...keys);
                totalDeleted += keys.length;
            }
        } while (cursor !== '0');

        console.log(`[Redis] 🧹 Flushed ${totalDeleted} listing cache keys after sync`);
    } catch (err: any) {
        console.warn('[Redis] Cache flush failed (non-fatal):', err.message);
    }
}
