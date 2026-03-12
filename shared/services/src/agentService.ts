import { Agent } from '@repo/types';
import { useNotificationStore } from './notificationStore';

// Mock database for agents
let agents: Agent[] = [
    {
        id: 'agent-1',
        organizationId: 'org-1',
        name: 'John Smith',
        email: 'john.smith@realty.com',
        phone: '555-0201',
        bio: 'Expert in Toronto luxury real estate with over 15 years of experience.',
        profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'agent-2',
        organizationId: '1',
        name: 'Jane Doe',
        email: 'jane.doe@realty.com',
        phone: '555-0202',
        bio: 'Passionate about helping first-time home buyers find their dream homes.',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const agentService = {
    getAgentsByOrganization: async (organizationId: string): Promise<Agent[]> => {
        // Simulate API call
        return agents.filter(a => a.organizationId === organizationId);
    },

    getAgentById: async (id: string): Promise<Agent | undefined> => {
        return agents.find(a => a.id === id);
    },

    createAgent: async (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> => {
        const newAgent: Agent = {
            ...data,
            id: `agent_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        agents.push(newAgent);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Added',
            message: `${newAgent.name} has been added to the team.`
        });

        return newAgent;
    },

    updateAgent: async (id: string, data: Partial<Agent>): Promise<Agent> => {
        const index = agents.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Agent not found');

        agents[index] = { ...agents[index], ...data, updatedAt: new Date().toISOString() };

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Updated',
            message: `${agents[index].name}'s profile has been updated.`
        });

        return agents[index];
    },

    deleteAgent: async (id: string): Promise<void> => {
        const agent = agents.find(a => a.id === id);
        agents = agents.filter(a => a.id !== id);

        useNotificationStore.getState().addNotification({
            type: 'success',
            title: 'Agent Deleted',
            message: agent ? `${agent.name} has been removed from the team.` : 'Agent record deleted.'
        });
    }
};
