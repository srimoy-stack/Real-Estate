import { mockAgents } from '../mock/agentsMock';
import { Agent } from '@repo/types';

export const agentsService = {
    getAgents: async (): Promise<Agent[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockAgents;
    }
};
