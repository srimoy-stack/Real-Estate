import { Agency } from '@repo/types';

const mockAgency: Agency = {
    id: 'agency-1',
    agencyId: 'agency-001',
    organizationTemplateId: 'modern-realty',
    agentTemplates: ['agent-portfolio', 'corporate-brokerage'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

export const agencyService = {
    getAgency: async (_agencyId: string): Promise<Agency> => {
        return mockAgency;
    },
    updateAgency: async (_agencyId: string, data: Partial<Agency>): Promise<Agency> => {
        return { ...mockAgency, ...data };
    }
};
