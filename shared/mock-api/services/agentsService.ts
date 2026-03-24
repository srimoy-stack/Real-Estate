import { mockAgents as initialAgents } from '../mock/agentsMock';
import { Agent } from '@repo/types';

const STORAGE_KEY = 'platform_agents_v1';
const IS_SERVER = typeof window === 'undefined';

const getInitialAgents = (): Agent[] => {
    if (!IS_SERVER) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    }
    return initialAgents;
};

let memAgents: Agent[] = getInitialAgents();

const persistAgents = () => {
    if (!IS_SERVER) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memAgents));
    }
};

export const agentsService = {
    getAgents: async (): Promise<Agent[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return memAgents;
    },

    createAgent: async (data: Agent): Promise<Agent> => {
        memAgents.unshift(data);
        persistAgents();
        return data;
    },

    updateAgent: async (id: string, data: Partial<Agent>): Promise<Agent> => {
        const idx = memAgents.findIndex(a => a.id === id);
        if (idx === -1) throw new Error('Agent not found');
        memAgents[idx] = { ...memAgents[idx], ...data, updatedAt: new Date().toISOString() };
        persistAgents();
        return memAgents[idx];
    },

    deleteAgent: async (id: string): Promise<void> => {
        memAgents = memAgents.filter(a => a.id !== id);
        persistAgents();
    }
};
