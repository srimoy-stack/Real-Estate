# Project Architecture Document: Real Estate Platform

## 1. Executive Summary
The **Real Estate Platform** is a multi-tenant SaaS application designed to enable real estate brands to launch their own customized, SEO-friendly websites. The platform is built on a high-performance monorepo architecture, prioritizing code reusability, consistent branding, and scalable multi-tenancy.

---

## 2. Technology Stack
- **Root Orchestration**: [Turborepo](https://turbo.build/repo)
- **Frontend Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Linting/Formatting**: ESLint & Prettier
- **State Management**: React Context & Hooks (Zustand integrated for complex modules)

---

## 3. Project Structure (Monorepo)

The repository follows a workspace-based structure to share code efficiently between the customer-facing site and the administration panels.

```text
/
├── apps/
│   ├── public-site/     # Customer-facing website (Multi-tenant)
│   ├── super-admin/     # Platform-level management (Billing, Tenants, Global Settings)
│   └── client-admin/    # Tenant-level management (Listings, Lead Tracking, Brand Settings)
├── shared/
│   ├── ui/              # Design system & shared React components
│   ├── types/           # Centralized TypeScript interfaces & Enums
│   ├── utils/           # Shared helper functions (formatters, validators)
│   └── hooks/           # Reusable React hooks
├── turbo.json           # Build pipeline configuration
└── package.json         # Workspace orchestration
```

---

## 4. Core Architecture Patterns

### 4.1 Multi-Tenant Detection
The platform uses **Hostname-based Tenancy**. The `public-site` identifies the brand based on the request domain.
- **Middleware Layer**: Intercepts requests to extract the `host` header.
- **Tenant Resolution**: Fetches configuration (Brand colors, Logo, Features) based on the domain.
- **Metadata Injection**: Injects `x-website-id` and configuration into request headers for Server Components.

### 4.2 Shared Design System
To maintain a "premium" feel across all applications:
- Components in `shared/ui` are built with Tailwind but remain flexible via props.
- Common layout elements like `Navbar` and `Footer` are shared between `public-site` and `admin` portals where appropriate.

### 4.3 Type-Safe Data Flow
- **Centralized Types**: All domain entities (Listings, Tenants, Users) are defined in `shared/types`.
- **API Consistency**: Standardized `ApiResponse<T>` and `PaginatedResponse<T>` interfaces.

---

## 5. Implementation Status (Completed Milestones)

### ✅ Infrastructure & Foundation
- [x] Turborepo initialization with `apps` and `shared` synergy.
- [x] Unified TypeScript configuration across all workspaces.
- [x] Tailwind CSS and PostCSS integration.

### ✅ Public Site (v1 Refactor)
- [x] **Next.js App Router Conversion**: Fully migrated from old structure.
- [x] **Multi-Tenant Middleware**: Domain-based tenant resolution is active.
- [x] **Dynamic Branding System**: Homepage sections (Hero, Banners) render based on tenant config.
- [x] **SEO Engine**: Dynamic metadata generation for different tenants.
- [x] **Layout System**: Implementation of shared Navbar/Footer in `(public)` group.

### ✅ Shared Modules
- [x] **Core UI Library**: Initial set of components (Banners, Sliders, Nav).
- [x] **Schema Definitions**: Base entities for Users, Roles, and Tenants.

---

## 6. Current Focus & Roadmap
1.  **Listing Engine**: Developing the property search, filter, and detail views in `public-site`.
2.  **Client Dashboard**: Building out the `client-admin` to allow brokers to manage properties.
3.  **Super Admin**: Implementing tenant onboarding and platform analytics.
4.  **Auth Integration**: Implementing shared authentication across the monorepo.
