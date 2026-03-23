/**
 * @module website-builder
 * 
 * Shared Website Builder module used by both Client Admin and Super Admin.
 * 
 * Usage:
 *   import WebsiteBuilderPage from '@repo/modules/website-builder';
 *   // or
 *   import { WebsiteBuilderPage } from '@repo/modules/website-builder';
 */

export { default as WebsiteBuilderPage } from './WebsiteBuilderPage';
export { default as SectionRenderer, renderSection } from './SectionRenderer';
export { useBuilderStore } from './useBuilderStore';
export type { BuilderPage, BuilderSection, BuilderMode, BuilderState } from './useBuilderStore';

// Re-export all section components for use outside the builder (e.g. public site rendering)
export {
    HeroSection,
    ListingsSection,
    AgentProfilesSection,
    ContactSection,
    TextSection,
    ImageSection,
    HeadingSection,
    SpacerSection,
    DividerSection,
    ButtonSection,
    VideoSection,
    TestimonialsSection,
    StatsSection,
    FAQSection,
    NewsletterSection,
    GallerySection,
    MapSection,
    FeaturedListingsSection,
    ListingDetailSection,
    AgentDetailSection,
    CommunitiesSection,
} from './CraftSections';
