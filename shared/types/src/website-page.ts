import { BaseEntity } from './index';

export interface WebsitePageLayoutSection {
    type: string;
    config?: Record<string, any>;
    seoConfig?: SeoConfig; // Section-level SEO override
}

export interface WebsitePageLayoutConfig {
    sections: WebsitePageLayoutSection[];
}

export interface SeoConfig {
    title: string;
    description: string;
    slug?: string;
    canonical?: string;
    noIndex?: boolean;
    ogImage?: string;
    autoGenerate?: boolean; // Toggle for auto vs manual
    template?: {
        titleTemplate?: string;
        descriptionTemplate?: string;
    };
}

export interface WebsitePage extends BaseEntity {
    websiteId: string;
    title: string;
    slug: string;
    layoutConfig: WebsitePageLayoutConfig;
    customLayoutJson?: string;
    isPublished: boolean;
    seoConfig?: SeoConfig;
}
