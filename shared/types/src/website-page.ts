import { BaseEntity } from './index';

export interface WebsitePageLayoutSection {
    type: string;
    config?: Record<string, any>;
}

export interface WebsitePageLayoutConfig {
    sections: WebsitePageLayoutSection[];
}

export interface WebsitePage extends BaseEntity {
    websiteId: string;
    title: string;
    slug: string;
    layoutConfig: WebsitePageLayoutConfig;
    customLayoutJson?: string;
    isPublished: boolean;
}
