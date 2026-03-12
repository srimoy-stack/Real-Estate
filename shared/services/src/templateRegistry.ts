import { Template, TemplateLayoutConfig, TemplateSectionType } from '@repo/types';

// ─── Template Layouts ──────────────────────────────

const modernRealtyLayout: TemplateLayoutConfig = {
    sections: [
        { type: 'hero', enabled: true },
        { type: 'listings', enabled: true },
        { type: 'about', enabled: true },
        { type: 'communities', enabled: true },
        { type: 'testimonials', enabled: false },
        { type: 'contact', enabled: true },
        { type: 'footer', enabled: true },
    ],
};

const luxuryEstateLayout: TemplateLayoutConfig = {
    sections: [
        { type: 'hero', enabled: true },
        { type: 'listings', enabled: true },
        { type: 'about', enabled: true },
        { type: 'testimonials', enabled: true },
        { type: 'contact', enabled: true },
        { type: 'footer', enabled: true },
    ],
};

const corporateBrokerageLayout: TemplateLayoutConfig = {
    sections: [
        { type: 'hero', enabled: true },
        { type: 'listings', enabled: true },
        { type: 'about', enabled: true },
        { type: 'blog', enabled: true },
        { type: 'contact', enabled: true },
        { type: 'footer', enabled: true },
    ],
};

const agentPortfolioLayout: TemplateLayoutConfig = {
    sections: [
        { type: 'hero', enabled: true },
        { type: 'listings', enabled: true },
        { type: 'testimonials', enabled: true },
        { type: 'contact', enabled: true },
        { type: 'footer', enabled: true },
    ],
};

const minimalRealtyLayout: TemplateLayoutConfig = {
    sections: [
        { type: 'hero', enabled: true },
        { type: 'listings', enabled: true },
        { type: 'contact', enabled: true },
        { type: 'footer', enabled: true },
    ],
};

// ─── Platform Templates ────────────────────────────

export const PLATFORM_TEMPLATES: Template[] = [
    {
        id: 'tpl_001',
        templateName: 'Modern Realty',
        templateKey: 'modern-realty',
        previewImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        defaultLayoutConfig: modernRealtyLayout,
        sections: ['hero', 'listings', 'about', 'communities', 'testimonials', 'contact', 'footer'] as TemplateSectionType[],
        isActive: true,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2025-11-20T14:30:00Z',
    },
    {
        id: 'tpl_002',
        templateName: 'Luxury Estate',
        templateKey: 'luxury-estate',
        previewImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
        defaultLayoutConfig: luxuryEstateLayout,
        sections: ['hero', 'listings', 'about', 'testimonials', 'contact', 'footer'] as TemplateSectionType[],
        isActive: true,
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2025-12-01T09:15:00Z',
    },
    {
        id: 'tpl_003',
        templateName: 'Corporate Brokerage',
        templateKey: 'corporate-brokerage',
        previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
        defaultLayoutConfig: corporateBrokerageLayout,
        sections: ['hero', 'listings', 'about', 'blog', 'contact', 'footer'] as TemplateSectionType[],
        isActive: true,
        createdAt: '2024-03-22T12:00:00Z',
        updatedAt: '2025-10-05T16:45:00Z',
    },
    {
        id: 'tpl_004',
        templateName: 'Agent Portfolio',
        templateKey: 'agent-portfolio',
        previewImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
        defaultLayoutConfig: agentPortfolioLayout,
        sections: ['hero', 'listings', 'testimonials', 'contact', 'footer'] as TemplateSectionType[],
        isActive: true,
        createdAt: '2024-05-18T09:00:00Z',
        updatedAt: '2026-01-10T11:20:00Z',
    },
    {
        id: 'tpl_005',
        templateName: 'Minimal Realty',
        templateKey: 'minimal-realty',
        previewImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
        defaultLayoutConfig: minimalRealtyLayout,
        sections: ['hero', 'listings', 'contact', 'footer'] as TemplateSectionType[],
        isActive: true,
        createdAt: '2024-07-01T14:00:00Z',
        updatedAt: '2026-02-28T08:00:00Z',
    },
];

export function getTemplateByKey(key: string): Template | undefined {
    return PLATFORM_TEMPLATES.find(t => t.templateKey === key);
}

export async function getTemplates(): Promise<Template[]> {
    return PLATFORM_TEMPLATES;
}

export async function getTemplateById(id: string): Promise<Template | undefined> {
    return PLATFORM_TEMPLATES.find(t => t.id === id);
}
