'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { agentService, PLATFORM_TEMPLATES } from '@repo/services';
import { Agent, Template } from '@repo/types';
import { HeroSection, FeaturedListings, ContactSection } from '@repo/ui';

export default function AgentPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const agentId = params.id as string;
    const [agent, setAgent] = useState<Agent | null>(null);
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    useEffect(() => {
        (async () => {
            const data = await agentService.getAgentById(agentId);
            setAgent(data || null);
        })();
    }, [agentId]);

    if (!agent) return <div className="flex items-center justify-center min-h-[60vh]"><div className="h-12 w-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

    const template = PLATFORM_TEMPLATES.find((t: Template) => t.templateKey === agent.templateId);
    const widths: Record<string, string> = { desktop: '100%', tablet: '768px', mobile: '375px' };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/agents')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-colors flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>Back
                    </button>
                    <div className="h-5 w-px bg-slate-200" />
                    <h2 className="font-black text-slate-900">{agent.name} <span className="text-violet-600">Preview</span></h2>
                    {template && <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{template.templateName}</span>}
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    {(['desktop', 'tablet', 'mobile'] as const).map(d => (
                        <button key={d} onClick={() => setDevice(d)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${device === d ? 'bg-white text-violet-600 shadow' : 'text-slate-400 hover:text-slate-600'}`}>{d}</button>
                    ))}
                </div>
            </div>

            {/* Preview Frame */}
            <div className="flex justify-center">
                <div style={{ width: widths[device], maxWidth: '100%' }} className="transition-all duration-300 bg-white rounded-[24px] border border-slate-200 shadow-2xl overflow-hidden">
                    {/* Simulated Header */}
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-violet-600 rounded-lg" />
                            <span className="font-black text-slate-900 text-sm">{agent.name}</span>
                        </div>
                        <div className="flex gap-6">
                            {['Home', 'Listings', 'About', 'Contact'].map(link => (
                                <span key={link} className="text-xs font-bold text-slate-400">{link}</span>
                            ))}
                        </div>
                    </div>

                    {/* Sections */}
                    <div>
                        <HeroSection
                            title={`${agent.name} — Real Estate`}
                            subtitle={agent.bio || 'Your trusted real estate professional'}
                            variant="default"
                        />
                        <FeaturedListings
                            listings={[]}
                            title="Featured Properties"
                            variant="default"
                        />
                        <ContactSection
                            title="Get In Touch"
                            email={agent.email}
                            phone={agent.phone}
                            variant="default"
                        />
                    </div>

                    {/* Simulated Footer */}
                    <div className="px-8 py-8 bg-slate-900 text-white text-center">
                        <p className="font-black text-sm">{agent.name}</p>
                        <p className="text-slate-400 text-xs mt-1">{agent.email} · {agent.phone}</p>
                        <p className="text-slate-600 text-[10px] mt-4">© 2025 All rights reserved</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
