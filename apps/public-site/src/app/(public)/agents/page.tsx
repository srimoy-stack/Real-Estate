'use client';

import React, { useEffect, useState } from 'react';
import { Agent } from '@repo/types';
import { agentService } from '@repo/services';
import { AgentCard } from '@/components/agents/AgentCard';

export default function AgentsDirectoryPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const data = await agentService.getAgents();
                setAgents(data);
            } catch (error) {
                console.error('Failed to fetch agents:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50 pt-32 pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 mb-6">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Our Team</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                        Meet the Experts Behind <span className="text-indigo-600 italic">Your New Home</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        Our dedicated team of professionals is here to guide you through every step of your real estate journey.
                    </p>
                </div>

                {/* Agents Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[3/4] rounded-[2rem] bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {agents.map((agent) => (
                            <AgentCard key={agent.id} agent={agent} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
