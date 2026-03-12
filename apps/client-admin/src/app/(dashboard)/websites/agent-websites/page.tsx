'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@repo/auth';
import {
    agentService,
    websiteService,
    templateAssignmentService,
    PLATFORM_TEMPLATES
} from '@repo/services';
import { Agent, Website } from '@repo/types';

export default function AgentWebsitesPage() {
    const { user } = useAuth();
    const [websites, setWebsites] = useState<Website[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [assignedTemplateKeys, setAssignedTemplateKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        agentId: '',
        templateId: '',
        domain: '',
    });

    const fetchData = useCallback(async () => {
        if (!user?.organizationId) return;
        setLoading(true);
        try {
            const [wsData, agentsData, assignments] = await Promise.all([
                websiteService.getWebsitesByOrganization(user.organizationId),
                agentService.getAgentsByOrganization(user.organizationId),
                templateAssignmentService.getTemplatesByTenant(user.organizationId)
            ]);

            setWebsites(wsData.filter(w => w.websiteType === 'AGENT_SITE'));
            setAgents(agentsData);
            setAssignedTemplateKeys(assignments.map(a => a.templateId));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.organizationId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const availableTemplates = PLATFORM_TEMPLATES.filter(t =>
        assignedTemplateKeys.includes(t.templateKey)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organizationId) return;

        try {
            await websiteService.createWebsite({
                organizationId: user.organizationId,
                agentId: formData.agentId,
                templateId: formData.templateId,
                domain: formData.domain,
                websiteType: 'AGENT_SITE',
                defaultLanguage: 'English',
                brandingConfig: {} // Will be initialized by service
            });
            setIsModalOpen(false);
            setFormData({ agentId: '', templateId: '', domain: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to create website:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to deactivate this agent website?')) {
            await websiteService.deleteWebsite(id);
            fetchData();
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Agent <span className="text-indigo-600">Websites</span></h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Deploy micro-sites for your team</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Provision Agent Site
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-100 rounded-[40px] animate-pulse" />
                    ))
                ) : websites.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="text-6xl mb-6 opacity-20">🌐</div>
                        <h3 className="text-xl font-bold text-slate-400">No agent websites provisioned yet</h3>
                        <p className="text-slate-400 mt-2">Scale your presence by launching sites for your agents</p>
                    </div>
                ) : (
                    websites.map((ws) => {
                        const agent = agents.find(a => a.id === ws.agentId);
                        const template = PLATFORM_TEMPLATES.find(t => t.templateKey === ws.templateId);

                        return (
                            <div key={ws.id} className="group bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 hover:shadow-indigo-500/10 transition-all duration-500 border border-slate-50 overflow-hidden">
                                <div className="h-40 relative">
                                    <img
                                        src={template?.previewImage || 'https://images.unsplash.com/photo-1460472178825-e5240623abe5?auto=format&fit=crop&q=80&w=800'}
                                        className="w-full h-full object-cover"
                                        alt={template?.templateName}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-6">
                                        <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">Live Site</p>
                                        <h3 className="text-white font-black text-lg">{ws.domain}</h3>
                                    </div>
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-[8px] font-black text-white uppercase tracking-widest">
                                        {template?.templateName}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Assigned Agent</p>
                                            <p className="text-slate-900 font-black">{agent?.name || 'Unassigned'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            onClick={() => window.open(`http://${ws.domain}`, '_blank')}
                                            className="flex-1 py-3 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                                        >
                                            Launch Site
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ws.id)}
                                            className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl transition-all"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-3xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Provision <span className="text-indigo-600">Site</span></h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Deploy a new instance for your agent</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 bg-white hover:bg-rose-50 hover:text-rose-500 rounded-2xl flex items-center justify-center text-slate-400 font-black transition-all shadow-sm">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Agent</label>
                                    <select
                                        required
                                        value={formData.agentId}
                                        onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900"
                                    >
                                        <option value="">Select Agent...</option>
                                        {agents.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Design</label>
                                    <select
                                        required
                                        value={formData.templateId}
                                        onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900"
                                    >
                                        <option value="">Pick a Template...</option>
                                        {availableTemplates.map(t => (
                                            <option key={t.id} value={t.templateKey}>{t.templateName}</option>
                                        ))}
                                    </select>
                                    <p className="text-[9px] text-slate-400 font-medium italic">* Only showing templates assigned to your brokerage.</p>
                                </div>

                                <div className="col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Domain</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="text"
                                            value={formData.domain}
                                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900 pl-12"
                                            placeholder="e.g. johnsmith.homes"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                                <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] shrink-0 font-black">!</div>
                                <p className="text-xs text-indigo-900/70 font-medium leading-relaxed">
                                    Provisioning this site will automatically copy the <span className="font-bold text-indigo-600">default layout configurations</span> from the selected template. The agent can later customize their branding through their portal.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 transition-all hover:scale-[1.02] transform active:scale-[0.98]"
                            >
                                Deploy Website
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
