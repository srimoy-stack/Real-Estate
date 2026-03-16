'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@repo/auth';
import { agentService, websiteInstanceService } from '@repo/services';
import { Agent } from '@repo/types';

export default function AgentsPage() {
    const { user } = useAuth();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [agentTemplateMap, setAgentTemplateMap] = useState<Record<string, string>>({});

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        profilePhoto: ''
    });

    const fetchData = useCallback(async () => {
        if (!user?.organizationId) return;
        setLoading(true);
        try {
            const agentsData = await agentService.getAgentsByOrganization(user.organizationId);
            setAgents(agentsData);

            // Build a map of agentId -> templateId from website instances
            const templateMap: Record<string, string> = {};
            for (const agent of agentsData) {
                try {
                    const website = await websiteInstanceService.getWebsiteByAgentId(agent.id);
                    if (website) {
                        templateMap[agent.id] = website.templateId;
                    }
                } catch { }
            }
            setAgentTemplateMap(templateMap);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.organizationId]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organizationId) return;

        try {
            if (editingAgent) {
                await agentService.updateAgent(editingAgent.id, formData);
            } else {
                await agentService.createAgent({
                    ...formData,
                    slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    organizationId: user.organizationId
                });
            }
            setIsModalOpen(false);
            setEditingAgent(null);
            setFormData({ name: '', email: '', phone: '', bio: '', profilePhoto: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to save agent:', error);
        }
    };

    const handleEdit = (agent: Agent) => {
        setEditingAgent(agent);
        setFormData({
            name: agent.name,
            email: agent.email,
            phone: agent.phone,
            bio: agent.bio || '',
            profilePhoto: agent.profilePhoto || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to remove this agent from the team?')) {
            await agentService.deleteAgent(id);
            fetchData();
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Team <span className="text-indigo-600">Agents</span></h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Manage your brokerage professionals</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAgent(null);
                        setFormData({ name: '', email: '', phone: '', bio: '', profilePhoto: '' });
                        setIsModalOpen(true);
                    }}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Agent
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-100 rounded-[40px] animate-pulse" />
                    ))
                ) : agents.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="text-6xl mb-6 opacity-20">👥</div>
                        <h3 className="text-xl font-bold text-slate-400">No agents in your team yet</h3>
                        <p className="text-slate-400 mt-2">Start building your brokerage by adding talented agents</p>
                    </div>
                ) : (
                    agents.map((agent) => (
                        <div key={agent.id} className="group bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 hover:shadow-indigo-500/10 transition-all duration-500 border border-slate-50 overflow-hidden flex flex-col">
                            <div className="p-8 pb-4 flex items-center gap-6">
                                <div className="h-20 w-20 rounded-[32px] overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                    {agent.profilePhoto ? (
                                        <img src={agent.profilePhoto} className="w-full h-full object-cover" alt={agent.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 font-black text-2xl uppercase">
                                            {agent.name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate uppercase italic tracking-tighter">{agent.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 truncate">{agent.email}</p>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{agent.phone}</p>
                                </div>
                            </div>

                            <div className="px-8 flex-1">
                                <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                    {agent.bio || 'No biography provided yet for this agent.'}
                                </p>
                            </div>

                            <div className="p-8 pt-4 flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleEdit(agent)}
                                        className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => handleDelete(agent.id)}
                                        className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl transition-all"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                                <Link
                                    href={`/website-builder?agentId=${agent.id}&templateId=${agentTemplateMap[agent.id] || 'modern-realty'}` as any}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg text-center"
                                >
                                    Website Builder
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Creation/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-3xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                                    {editingAgent ? 'Edit' : 'Add'} <span className="text-indigo-600">Agent</span>
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
                                    {editingAgent ? 'Update agent profile information' : 'Register a new agent to your brokerage'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 bg-white hover:bg-rose-50 hover:text-rose-500 rounded-2xl flex items-center justify-center text-slate-400 font-black transition-all shadow-sm">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900"
                                        placeholder="Agent's full name"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900"
                                        placeholder="agent@brokerage.com"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900"
                                        placeholder="555-0000"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Photo URL</label>
                                    <input
                                        type="url"
                                        value={formData.profilePhoto}
                                        onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Bio</label>
                                    <textarea
                                        rows={4}
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900 resize-none"
                                        placeholder="A brief introduction for the agent's profile..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 transition-all hover:scale-[1.02] transform active:scale-[0.98]"
                            >
                                {editingAgent ? 'Update Profile' : 'Confirm Registration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
