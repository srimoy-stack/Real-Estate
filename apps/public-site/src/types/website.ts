/**
 * Public-site website types.
 *
 * Re-exports the canonical WebsiteConfig from @repo/types.
 * This file exists for backwards compatibility — prefer importing
 * directly from '@repo/types' in new code.
 */
export type {
  WebsiteConfig,
  BrandingConfig,
  SectionConfig,
  SectionType,
  SectionContent,
  NavLink,
  NavigationConfig,
  FooterColumn,
  WebsiteSeoConfig,
  PageSeoConfig,
  CustomPage,
  PageBlock,
  BlockType,
  TemplateId,
  ThemeMode,
  SocialLinksConfig,
} from '@repo/types';
