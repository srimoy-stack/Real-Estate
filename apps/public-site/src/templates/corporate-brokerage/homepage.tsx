'use client';

import React from 'react';
import { HeroSection, FeaturedListings, AgentSection, mockListings, mockAgents } from '../shared';

export const Homepage: React.FC = () => (
    <>
        <HeroSection variant="corporate" title="Your Trusted Real Estate Partner" subtitle="50+ offices coast-to-coast. 200+ agents serving communities across Canada." ctaText="Find Properties" />
        <FeaturedListings listings={mockListings} variant="corporate" title="Featured Listings" subtitle="Explore our curated selection of premier properties." />

        {/* Services */}
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900">Our Services</h2>
                    <p className="text-slate-500 mt-2">Comprehensive real estate solutions for every need.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Residential Sales', desc: 'Expert guidance for buying and selling homes.', icon: '🏠' },
                        { title: 'Commercial Leasing', desc: 'Prime retail and office spaces available.', icon: '🏢' },
                        { title: 'Property Management', desc: 'Full-service management for your investments.', icon: '🔑' },
                        { title: 'Market Analysis', desc: 'Data-driven insights for informed decisions.', icon: '📊' },
                    ].map(s => (
                        <div key={s.title} className="p-8 border border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all group">
                            <span className="text-3xl">{s.icon}</span>
                            <h3 className="text-slate-900 font-bold text-lg mt-4 group-hover:text-blue-700 transition-colors">{s.title}</h3>
                            <p className="text-slate-500 text-sm mt-2">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <AgentSection agents={mockAgents} variant="corporate" title="Top Performing Agents" />

        <section className="py-20 bg-blue-700 text-center">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-black text-white">Ready to Get Started?</h2>
                <p className="text-blue-200 mt-3">Connect with one of our experienced agents today.</p>
                <div className="flex justify-center gap-4 mt-8">
                    <a href="/contact" className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all">Contact Us</a>
                    <a href="tel:18007328589" className="px-8 py-3 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all">1-800-REALTY</a>
                </div>
            </div>
        </section>
    </>
);
