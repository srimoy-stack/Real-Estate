// ─── Common Entity Types ───────────────────────────
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ─── User / Auth ───────────────────────────────────
export type UserRole = 'super_admin' | 'client_admin' | 'agent' | 'viewer';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  password?: string; // For onboarding/auth purposes
  organizationId?: string; // Aligned with user request
  avatarUrl?: string;
  isActive: boolean;
}

// ─── Agent Model ───────────────────────────────────
export interface Agent extends BaseEntity {
  organizationId: string;
  name: string;
  slug: string;
  title?: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  bio?: string;
  userId?: string;
  licenseNumber?: string;
  city?: string;
  socialLinks?: SocialLinks;
  templateId?: string;
  websiteStatus?: 'ACTIVE' | 'DRAFT' | 'PENDING';
  domain?: string;
}

// ─── Multi-Tenant ──────────────────────────────────
export type OrganizationType = 'BROKERAGE' | 'INDIVIDUAL_AGENT';

export interface Organization extends BaseEntity {
  name: string;
  type: OrganizationType;
  email: string;
  phone: string;
  logo?: string;
  timezone: string;
  address?: string;
  isActive: boolean;
  settings?: TenantSettings;
  branding?: TenantBranding;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  headerFont: string;
  bodyFont: string;
  logoUrl: string;
  faviconUrl: string;
  tagline?: string;
  socialLinks: SocialLinks;
  officeLocations: OfficeLocation[];
}

export interface TenantSettings {
  locale?: string;
  timezone?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

// ─── API Response ──────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Navigation ────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

// ─── SEO ───────────────────────────────────────────
export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article' | 'profile';
}
// ─── Website ──────────────────────────────────────
export type WebsiteType = 'BROKERAGE_SITE' | 'AGENT_SITE';

export interface Website extends BaseEntity {
  organizationId: string;
  agentId?: string; // Optional (nullable per user request)
  templateId: string;
  domain: string;
  websiteType?: WebsiteType;
  defaultLanguage?: string;
  layoutConfig: any; // matches TemplateLayoutConfig
  brandingConfig: any; // matches BrandingConfig
}

export type WebsiteInstance = Website;

export * from './listings';
export * from './ddf';
export * from './listings-settings';
export * from './leads';
export * from './website';
export * from './templates';
export * from './websiteFactory';
export * from './configResolver';
export * from './notifications';
export * from './internal-listing';
export * from './shortcode';
export * from './template-model';
export * from './listings-section';
export * from './saved-items';
export * from './org-website';
export * from './website-page';
export * from './communities';
