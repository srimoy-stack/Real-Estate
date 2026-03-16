'use client';

import React, { useEffect, useState } from 'react';
import { Agent, Listing } from '@repo/types';
import { agentService, listingService } from '@repo/services';
import { AgentProfileBanner } from '@/components/agents/AgentProfileBanner';
import { AgentContactForm } from '@/components/agents/AgentContactForm';
import { PropertyCard } from '@/components/sections/PropertyCard';
import { notFound } from 'next/navigation';

interface AgentProfilePageProps {
    params: { slug: string };
}

export default function AgentProfilePage({ params }: AgentProfilePageProps) {
    const { slug } = params;
    const [agent, setAgent] = useState<Agent | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const agentData = await agentService.getAgentBySlug(slug);
                if (agentData) {
                    setAgent(agentData);
                    const listingResponse = await listingService.search({
                        agentName: agentData.name,
                        limit: 6
                    });
                    if (listingResponse.success) {
                        setListings(listingResponse.data);
                    }
                } else {
                    setAgent(null);
                }
            } catch (error) {
                console.error('Failed to fetch agent profile data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (loading) {
        return <div className="min-h-screen bg-slate-900 animate-pulse" />;
    }

    if (!agent) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Banner Section */}
            <AgentProfileBanner agent={agent} />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-24">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-1 space-y-20">
                        {/* Bio / About */}
                        <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6 italic">
                                About <span className="text-indigo-600">{agent.name.split(' ')[0]}</span>
                            </h2>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-600 font-medium leading-relaxed text-lg whitespace-pre-line">
                                    {agent.bio || `${agent.name} is a dedicated real estate professional serving the ${agent.city} area. With a focus on client satisfaction and deep market knowledge, ${agent.name.split(' ')[0]} helps buyers and sellers achieve their real estate goals with confidence.`}
                                </p>
                            </div>
                        </section>

                        {/* Recent Listings */}
                        <section>
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">
                                        Recent <span className="text-indigo-600">Listings</span>
                                    </h2>
                                    <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">
                                        Hand-picked properties by {agent.name.split(' ')[0]}
                                    </p>
                                </div>
                                <div className="h-px flex-1 bg-slate-200 mx-8 hidden md:block" />
                                <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">
                                    View All
                                </button>
                            </div>

                            {listings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {listings.map((listing) => (
                                        <PropertyCard key={listing.id} listing={listing} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100">
                                    <p className="text-slate-400 font-bold italic">No active listings at the moment.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar / Contact */}
                    <div className="lg:w-[400px] flex-shrink-0">
                        <div className="sticky top-32">
                            <AgentContactForm agentName={agent.name} agentId={agent.id} />

                            {/* Additional Info */}
                            <div className="mt-8 bg-slate-900 rounded-[2rem] p-8 text-white">
                                <h4 className="text-lg font-black italic mb-4">Quick Info</h4>
                                <div className="space-y-4">
                                    {agent.licenseNumber && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">License</span>
                                            <span className="font-bold">{agent.licenseNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Service Area</span>
                                        <span className="font-bold">{agent.city}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Experience</span>
                                        <span className="font-bold">12+ Years</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
