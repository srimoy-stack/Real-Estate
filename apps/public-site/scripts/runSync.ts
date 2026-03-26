import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
    console.log('[Runner] Starting MLS synchronization script...');
    try {
        const { syncListings } = await import('../src/lib/syncListings');
        await syncListings();
        console.log('[Runner] Sync process COMPLETED successfully.');
    } catch (err) {
        console.error('[Runner] Sync process FAILED:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
})();
