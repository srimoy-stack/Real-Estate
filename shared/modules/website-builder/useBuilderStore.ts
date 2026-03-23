/**
 * useBuilderStore — Central Zustand store for the Website Builder.
 *
 * This is the single source of truth for:
 *   • which website is loaded
 *   • the list of pages and which page is active
 *   • per-page Craft.js snapshots (serialized JSON strings)
 *
 * Craft.js still owns the *live* rendering tree.  The store caches
 * each page's serialised JSON so that switching pages is instant.
 */

import { create } from 'zustand';

import { SeoConfig } from '@repo/types';

// ─── Types ────────────────────────────────────────────────────────
export interface BuilderSection {
    id: string;
    type: string;
    config: Record<string, any>;
    content?: Record<string, any>;
    seoConfig?: SeoConfig;
}

export interface BuilderPage {
    id: string;
    name: string;
    slug: string;
    isPublic: boolean;
    pageType: 'static' | 'listing' | 'agent';
    sections: BuilderSection[];
    overrideSections?: boolean;
    seoConfig?: SeoConfig;
}

export type BuilderMode = 'organization' | 'agent' | 'agent-advanced';

export interface BuilderState {
    // ── Website-level ────────────────────────────────────
    website: any | null;
    templateId: string;
    builderMode: BuilderMode;

    // ── Pages ────────────────────────────────────────────
    pages: Record<string, BuilderPage>;
    activePageId: string;

    // ── Craft.js page snapshots (pageId → serialised JSON)
    pageSnapshots: Record<string, string>;

    // ── Agent-specific navigation (agent-advanced mode) ────
    agentNavigation: { label: string; slug: string; children?: { label: string; slug: string }[] }[];

    // ── Global Sections (Header/Footer) ──────────────────
    globalSections: {
        header: { type: string; props: Record<string, any> };
        footer: { type: string; props: Record<string, any> };
    };

    // ── Initialisation flag ──────────────────────────────
    initialised: boolean;

    // ── Actions ──────────────────────────────────────────
    /** Replace the whole website object (fetched from services) */
    setWebsite: (website: any) => void;

    /** Set the template key, e.g. 'modern-realty' */
    setTemplateId: (id: string) => void;

    /** Replace the full pages map (typically after first fetch) */
    setPages: (pages: BuilderPage[]) => void;

    /** Switch the active page */
    setActivePage: (pageId: string) => void;

    /** Add a new page */
    addPage: (page: BuilderPage) => void;

    /** Remove a page by id */
    removePage: (pageId: string) => void;

    /** Partially update an existing page (title, slug, etc.) */
    updatePage: (pageId: string, updates: Partial<Omit<BuilderPage, 'id'>>) => void;

    /** Overwrite the sections list for a given page */
    setSections: (pageId: string, sections: BuilderSection[]) => void;

    /** Add a section to a page (at end) */
    addSection: (pageId: string, section: BuilderSection) => void;

    /** Remove a section from a page */
    removeSection: (pageId: string, sectionId: string) => void;

    /** Update a section's config */
    updateSectionConfig: (pageId: string, sectionId: string, config: Record<string, any>) => void;

    /** Reorder sections for a page */
    reorderSections: (pageId: string, sections: BuilderSection[]) => void;

    /** Save the serialised Craft.js JSON for a page (called when switching pages) */
    savePageSnapshot: (pageId: string, json: string) => void;

    /** Get the snapshot for the active page (or undefined) */
    getActivePageSnapshot: () => string | undefined;

    /** Retrieve the currently active page object (with fallback) */
    getActivePage: () => BuilderPage | undefined;

    /** Mark the store as initialised */
    setInitialised: (v: boolean) => void;

    /** Set the builder mode */
    setBuilderMode: (mode: BuilderMode) => void;

    /** Set agent-specific navigation (agent-advanced mode) */
    setAgentNavigation: (nav: { label: string; slug: string; children?: { label: string; slug: string }[] }[]) => void;

    /** Update global sections (Header/Footer) */
    updateGlobalSection: (section: 'header' | 'footer', updates: { type?: string; props?: Record<string, any> }) => void;

    /** Update global branding configuration */
    updateBrandingConfig: (updates: any) => void;

    /** Full reset (for unmount / navigation away) */
    reset: () => void;
}

// ─── Initial values ───────────────────────────────────────────────
const INITIAL: {
    website: any | null;
    templateId: string;
    builderMode: BuilderMode;
    pages: Record<string, BuilderPage>;
    activePageId: string;
    pageSnapshots: Record<string, string>;
    agentNavigation: { label: string; slug: string; children?: { label: string; slug: string }[] }[];
    globalSections: {
        header: { type: string; props: Record<string, any> };
        footer: { type: string; props: Record<string, any> };
    };
    initialised: boolean;
} = {
    website: null,
    templateId: 'modern-realty',
    builderMode: 'organization',
    pages: {},
    activePageId: '',
    pageSnapshots: {},
    agentNavigation: [],
    globalSections: {
        header: { type: 'header-v1', props: {} },
        footer: { type: 'footer-v1', props: {} },
    },
    initialised: false,
};

// ─── Store ────────────────────────────────────────────────────────
export const useBuilderStore = create<BuilderState>((set, get) => ({
    ...INITIAL,

    // ── Setters ──────────────────────────────────────────────────
    setWebsite: (website) => set({ website }),

    setTemplateId: (id) => set({ templateId: id }),

    setPages: (pagesArray) => {
        const map: Record<string, BuilderPage> = {};
        for (const p of pagesArray) {
            map[p.id] = p;
        }
        // If there's no active page yet, default to the first one
        const state = get();
        const activePageId =
            state.activePageId && map[state.activePageId]
                ? state.activePageId
                : pagesArray[0]?.id ?? '';
        set({ pages: map, activePageId });
    },

    setActivePage: (pageId) => {
        const { pages } = get();
        if (pages[pageId]) {
            set({ activePageId: pageId });
        } else {
            // Fallback to first available page
            const first = Object.keys(pages)[0];
            if (first) set({ activePageId: first });
        }
    },

    addPage: (page) =>
        set((s) => ({
            pages: { ...s.pages, [page.id]: page },
        })),

    removePage: (pageId) =>
        set((s) => {
            const { [pageId]: _, ...rest } = s.pages;
            const { [pageId]: __, ...restSnaps } = s.pageSnapshots;
            let activePageId = s.activePageId;
            if (activePageId === pageId) {
                activePageId = Object.keys(rest)[0] ?? '';
            }
            return { pages: rest, pageSnapshots: restSnaps, activePageId };
        }),

    updatePage: (pageId, updates) =>
        set((s) => {
            const existing = s.pages[pageId];
            if (!existing) return s;
            return {
                pages: { ...s.pages, [pageId]: { ...existing, ...updates } },
            };
        }),

    setSections: (pageId, sections) =>
        set((s) => {
            const existing = s.pages[pageId];
            if (!existing) return s;
            return {
                pages: { ...s.pages, [pageId]: { ...existing, sections } },
            };
        }),

    addSection: (pageId, section) =>
        set((s) => {
            const existing = s.pages[pageId];
            if (!existing) return s;
            return {
                pages: {
                    ...s.pages,
                    [pageId]: { ...existing, sections: [...existing.sections, section] },
                },
            };
        }),

    removeSection: (pageId, sectionId) =>
        set((s) => {
            const existing = s.pages[pageId];
            if (!existing) return s;
            return {
                pages: {
                    ...s.pages,
                    [pageId]: {
                        ...existing,
                        sections: existing.sections.filter((sec) => sec.id !== sectionId),
                    },
                },
            };
        }),

    updateSectionConfig: (pageId, sectionId, config) =>
        set((s) => {
            const existing = s.pages[pageId];
            if (!existing) return s;
            return {
                pages: {
                    ...s.pages,
                    [pageId]: {
                        ...existing,
                        sections: existing.sections.map((sec) =>
                            sec.id === sectionId ? { ...sec, config: { ...sec.config, ...config } } : sec
                        ),
                    },
                },
            };
        }),

    reorderSections: (pageId, sections) =>
        set((s) => {
            const existing = s.pages[pageId];
            if (!existing) return s;
            return {
                pages: { ...s.pages, [pageId]: { ...existing, sections } },
            };
        }),

    savePageSnapshot: (pageId, json) =>
        set((s) => ({
            pageSnapshots: { ...s.pageSnapshots, [pageId]: json },
        })),

    getActivePageSnapshot: () => {
        const { activePageId, pageSnapshots } = get();
        return pageSnapshots[activePageId];
    },

    getActivePage: () => {
        const { activePageId, pages } = get();
        if (pages[activePageId]) return pages[activePageId];
        // Fallback to first page
        const first = Object.keys(pages)[0];
        return first ? pages[first] : undefined;
    },

    setInitialised: (v) => set({ initialised: v }),

    setBuilderMode: (mode) => set({ builderMode: mode }),

    setAgentNavigation: (nav) => set({ agentNavigation: nav }),

    updateGlobalSection: (section, updates) =>
        set((s) => ({
            globalSections: {
                ...s.globalSections,
                [section]: {
                    ...s.globalSections[section],
                    ...updates,
                    props: { ...s.globalSections[section].props, ...(updates.props || {}) }
                }
            }
        })),

    updateBrandingConfig: (updates) =>
        set((s) => {
            if (!s.website) return s;
            const brandingConfig = { ...(s.website.brandingConfig || {}), ...updates };
            return {
                website: { ...s.website, brandingConfig },
            };
        }),

    reset: () => set({ ...INITIAL }),
}));
