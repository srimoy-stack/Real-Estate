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
  tenantId?: string;
  avatarUrl?: string;
  isActive: boolean;
}

// ─── Multi-Tenant ──────────────────────────────────
export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  isActive: boolean;
  settings: TenantSettings;
  branding: TenantBranding;
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

export * from './listings';
export * from './ddf';
export * from './listings-settings';
export * from './leads';
export * from './website';
export * from './templates';
export * from './websiteFactory';
export * from './configResolver';
export * from './notifications';

