'use client';

import React from 'react';
import { useTemplate } from '../TemplateContext';
import { Agent } from './AgentSection';

export interface AgentCardProps {
    agent: Agent;
    variant?: 'default' | 'luxury' | 'minimal' | 'corporate';
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, variant = 'default' }) => {
    const { onNavigate } = useTemplate();

    const handleAgentClick = (e: React.MouseEvent) => {
        if (onNavigate) {
            e.preventDefault();
            onNavigate(`/agent/${agent.id}`);
        }
    };

    if (variant === 'luxury') {
        return (
            <div onClick={handleAgentClick} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-slate-800 rounded-3xl mb-4 overflow-hidden flex items-center justify-center group-hover:shadow-2xl transition-all duration-500 border border-transparent group-hover:border-amber-500/30">
                    {agent.image ? (
                        <img src={agent.image} alt={agent.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <span className="text-slate-600 text-sm">Photo</span>
                    )}
                </div>
                <h3 className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors">{agent.name}</h3>
                <p className="text-amber-400/70 text-sm font-medium">{agent.title}</p>
                <p className="text-white/30 text-xs mt-2">{agent.listings} Active Listings</p>
            </div>
        );
    }

    if (variant === 'corporate') {
        return (
            <div onClick={handleAgentClick} className="text-center border border-slate-200 rounded-xl p-6 hover:shadow-xl transition-all bg-white cursor-pointer group">
                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-blue-600 transition-all">
                    {agent.image ? (
                        <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-slate-400 text-xs">Photo</span>
                    )}
                </div>
                <h3 className="text-slate-900 font-bold group-hover:text-blue-700 transition-colors">{agent.name}</h3>
                <p className="text-blue-700 text-sm font-medium">{agent.title}</p>
                <p className="text-slate-400 text-xs mt-2">{agent.phone}</p>
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div onClick={handleAgentClick} className="flex gap-6 items-center cursor-pointer group">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-all">
                    {agent.image ? (
                        <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-slate-400 text-xs">Photo</span>
                    )}
                </div>
                <div>
                    <h3 className="text-slate-900 font-medium group-hover:text-slate-600 transition-colors">{agent.name}</h3>
                    <p className="text-slate-400 text-sm">{agent.title}</p>
                    <p className="text-slate-500 text-sm mt-1">{agent.phone}</p>
                </div>
            </div>
        );
    }

    // Default
    return (
        <div onClick={handleAgentClick} className="group text-center cursor-pointer">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden group-hover:shadow-2xl group-hover:scale-105 transition-all duration-500 border-4 border-white shadow-lg">
                {agent.image ? (
                    <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-indigo-400 text-sm font-bold">Photo</span>
                )}
            </div>
            <h3 className="text-slate-900 font-bold text-lg group-hover:text-indigo-600 transition-colors">{agent.name}</h3>
            <p className="text-indigo-600 text-sm font-medium">{agent.title}</p>
            <p className="text-slate-400 text-xs mt-2 font-semibold tracking-wide uppercase">{agent.listings} Active Listings</p>
        </div>
    );
};
