import { Agent } from '@repo/types';
import { useNotificationStore } from './notificationStore';
import { agentsService as mockApi } from '../../mock-api/services/agentsService';

export const agentService = {
    getAllAgents: async (): Promise<Agent[]> => {
        return await mockApi.getAgents();
    },

    getAgents: async (): Promise<Agent[]> => {
        try {
            const baseUrl = typeof window === 'undefined' 
                ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
                : '';
            const response = await fetch(`${baseUrl}/api/internal-agents`, { cache: 'no-store' });
            const agents = await response.json();
            if (!Array.isArray(agents) || agents.length === 0) {
                console.warn('[Agent Service] No real agents returned, using mock data.');
                return await mockApi.getAgents();
            }
            return agents;
        } catch (error) {
            console.error('[Agent Service] Failed to fetch real agents:', error);
            return await mockApi.getAgents();
        }
    },

    getAgentsByOrganization: async (organizationId: string): Promise<Agent[]> => {
        const agents = await mockApi.getAgents();
        return agents.filter(a => a.organizationId === organizationId);
    },

    getAgentById: async (id: string): Promise<Agent | undefined> => {
        const agents = await agentService.getAgents();
        return agents.find(a => a.id === id);
    },

    getAgentBySlug: async (slug: string): Promise<Agent | undefined> => {
        const agents = await agentService.getAgents();
        return agents.find(a => a.slug === slug);
    },

    createAgent: async (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> => {
        const newAgent: Agent = {
            ...data,
            id: `agent_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await mockApi.createAgent(newAgent);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Onboarded',
            message: `${newAgent.name} has been successfully onboarded.`
        });

        return newAgent;
    },

    updateAgent: async (id: string, data: Partial<Agent>): Promise<Agent> => {
        const updated = await mockApi.updateAgent(id, data);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Updated',
            message: `${updated.name}'s profile has been updated.`
        });

        return updated;
    },

    deleteAgent: async (id: string): Promise<void> => {
        await mockApi.deleteAgent(id);
        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Deleted',
            message: 'Agent record deleted.'
        });
    }
};
