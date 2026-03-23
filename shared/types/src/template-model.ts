// ═══════════════════════════════════════════════════════════
//  TEMPLATE MODEL
//  The database-level Template model that the Super Admin
//  sees when managing templates. Templates are pre-built
//  and exist in the system (like a ThemeForest marketplace).
//  The Super Admin can view and assign them, but NOT create.
// ═══════════════════════════════════════════════════════════

/**
 * All the section types a template can include.
 */
export type TemplateSectionType =
    | 'hero'
    | 'listings'
    | 'about'
    | 'communities'
    | 'testimonials'
    | 'blog'
    | 'contact'
    | 'footer';

/**
 * A section entry inside the defaultLayoutConfig.
 */
export interface TemplateLayoutSection {
    type: TemplateSectionType;
    enabled: boolean;
    /**
     * Optional dynamic configuration for this section.
     * Supports future per-section settings (e.g. layout variants, theme overrides).
     * Defaults to {} when not provided — existing template sections are unaffected.
     */
    config?: Record<string, any>;
}

/**
 * The default layout configuration JSON shape.
 */
export interface TemplateLayoutConfig {
    sections: TemplateLayoutSection[];
}

/**
 * The Template database model.
 *
 * Templates already exist in the system.
 * Super Admin only views and assigns them — does NOT create them.
 */
export interface Template {
    /** Unique identifier */
    id: string;
    /** Human-readable template name */
    templateName: string;
    /** Machine-readable key (slug) */
    templateKey: string;
    /** Preview image URL */
    previewImage: string;
    /** Default layout configuration as JSON */
    defaultLayoutConfig: TemplateLayoutConfig;
    /** Array of section types this template supports */
    sections: TemplateSectionType[];
    /** Whether this template is currently active / available */
    isActive: boolean;
    /** ISO timestamp */
    createdAt: string;
    /** ISO timestamp */
    updatedAt: string;
}

/**
 * Join model that represents a template assigned to a brokerage/client (Tenant).
 * A Super Admin assigns templates to a Brokerage.
 * A Brokerage can have multiple templates assigned.
 */
export interface TenantTemplate {
    /** Unique record ID */
    id: string;
    /** The brokerage/client ID */
    organizationId: string;
    /** The template ID */
    templateId: string;
    /** User ID of the super admin who assigned this */
    assignedBy: string;
    /** Creation timestamp */
    createdAt: string;
    /** Whether the assignment is active */
    isActive: boolean;
}
