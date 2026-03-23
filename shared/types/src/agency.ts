import { BaseEntity } from './index';

export interface Agency extends BaseEntity {
    agencyId: string;
    organizationTemplateId: string;
    agentTemplates: string[];
}

export interface OrganizationWebsite {
    type: 'organization';
    templateId: string;
    pages: any[];
    navigation: any[];
}

export interface AgentWebsite extends BaseEntity {
    type: 'agent';
    agentId: string;
    templateId: string;
    config: Record<string, any>;
}

export type BuilderMode = 'organization' | 'agent';
