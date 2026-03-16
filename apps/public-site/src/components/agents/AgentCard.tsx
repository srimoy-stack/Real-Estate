import React from 'react';
import Link from 'next/link';
import { Agent } from '@repo/types';

interface AgentCardProps {
    agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
    return (
        <div className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
            <div className="relative aspect-[4/5] overflow-hidden">
                <img
                    src={agent.profilePhoto || 'https://via.placeholder.com/400x500'}
                    alt={agent.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">{agent.title || 'Real Estate Advisor'}</p>
                    <h3 className="text-xl font-black text-white tracking-tight">{agent.name}</h3>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-slate-500">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-xs font-bold">{agent.phone}</span>
                    </div>
                </div>
                <Link
                    href={`/agents/${agent.slug}`}
                    className="block w-full py-4 bg-slate-50 hover:bg-indigo-600 hover:text-white text-center text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all border border-slate-100 hover:border-indigo-600 shadow-sm"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
};
