import { ShortcodeConfig, UserRole } from '@repo/types';

/**
 * Service to manage configurable shortcodes across a multi-tenant environment.
 * 
 * Permissions logic:
 * - Super Admins: Can read/write ANY shortcode config across all tenants and websites.
 * - Client Admins (Brokerage): Can read/write shortcode configs for websites within THEIR organization (organizationId).
 * - Agents: Can READ only (consume) shortcode configs specific to their own websiteId.
 */
export class ShortcodeConfigService {
    // In-memory mock database keyed by config ID
    private db: Map<string, ShortcodeConfig> = new Map();

    constructor() {
        // Seed some initial data for demonstration
        this.createConfig({
            organizationId: 'org-1',
            websiteId: 'website-agent-1',
            createdByRole: 'client_admin',
            shortcodeName: 'featuredHomes',
            filters: {
                city: 'Mississauga',
                propertyType: 'Detached',
                status: 'FOR_SALE' as any,
                minPrice: 800000,
                maxPrice: 1500000,
            },
            limit: 9,
            sort: 'latest',
            isActive: true,
        });
    }

    /**
     * Create a new shortcode configuration.
     */
    public createConfig(params: Omit<ShortcodeConfig, 'id' | 'createdAt' | 'updatedAt'>): ShortcodeConfig {
        const id = `config_${Math.random().toString(36).substring(2, 9)}`;
        const now = new Date().toISOString();

        const newConfig: ShortcodeConfig = {
            ...params,
            id,
            createdAt: now,
            updatedAt: now,
        };

        this.db.set(id, newConfig);
        return newConfig;
    }

    /**
     * Update an existing shortcode configuration.
     * Must check permissions separately before calling.
     */
    public updateConfig(id: string, updates: Partial<Omit<ShortcodeConfig, 'id' | 'websiteId' | 'organizationId' | 'createdByRole' | 'createdAt'>>): ShortcodeConfig | null {
        const existing = this.db.get(id);
        if (!existing) return null;

        const updatedConfig: ShortcodeConfig = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.db.set(id, updatedConfig);
        return updatedConfig;
    }

    /**
     * Fetch a configuration by its exact name and websiteId.
     * Useful for the renderer parsing something like [listings config="featuredHomes"]
     */
    public getConfigByName(websiteId: string, shortcodeName: string): ShortcodeConfig | null {
        for (const config of this.db.values()) {
            if (config.websiteId === websiteId && config.shortcodeName === shortcodeName && config.isActive) {
                return config;
            }
        }
        return null;
    }

    /**
     * Query configurations securely bound by roles.
     */
    public getConfigs(query: { websiteId?: string; organizationId?: string; role: UserRole }): ShortcodeConfig[] {
        const results = Array.from(this.db.values());

        if (query.role === 'super_admin') {
            // Super admins see everything they ask for, filter by intent
            if (query.websiteId) {
                return results.filter(c => c.websiteId === query.websiteId);
            }
            if (query.organizationId) {
                return results.filter(c => c.organizationId === query.organizationId);
            }
            return results;
        }

        if (query.role === 'client_admin') {
            // Client Admins are locked strictly to their organization network
            if (!query.organizationId) throw new Error("organizationId is required for Client Admin queries");

            const organizationConfigs = results.filter(c => c.organizationId === query.organizationId);
            if (query.websiteId) {
                return organizationConfigs.filter(c => c.websiteId === query.websiteId);
            }
            return organizationConfigs;
        }

        if (query.role === 'agent') {
            // Agents can only see active configurations built for their specific website
            if (!query.websiteId) throw new Error("websiteId is required for Agent queries");
            return results.filter(c => c.websiteId === query.websiteId && c.isActive);
        }

        return [];
    }

    /**
     * Delete a config permanently.
     */
    public deleteConfig(id: string): boolean {
        return this.db.delete(id);
    }
}

export const shortcodeConfigService = new ShortcodeConfigService();
