// Template System - Master Index
// Usage: import { TemplateRenderer } from '@/templates';
//        <TemplateRenderer template="modern-realty" page="homepage" />

export { TemplateRenderer } from './TemplateRenderer';
export type { TemplateName, PageType, TemplateModule } from './TemplateRenderer';
export { templateRegistry } from './TemplateRenderer';

// Individual template exports for direct access
export * as ModernRealty from './modern-realty';
export * as LuxuryEstate from './luxury-estate';
export * as AgentPortfolio from './agent-portfolio';
export * as CorporateBrokerage from './corporate-brokerage';
export * as MinimalRealty from './minimal-realty';

// Shared components for building custom templates
export { PropertyCard, HeroSection, FeaturedListings, AgentSection } from './shared';
export { mockListings, mockAgents } from './shared';
