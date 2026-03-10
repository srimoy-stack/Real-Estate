'use client';

import React from 'react';
import { HeroSection, FeaturedListings, AgentSection, mockListings, mockAgents } from '../shared';

export const Homepage: React.FC = () => (
    <>
        <HeroSection variant="minimal" title="Less is more. Find your space." subtitle="A curated approach to discovering properties that match your lifestyle." ctaText="Explore Properties" />

        <FeaturedListings listings={mockListings} variant="minimal" title="Selected Properties" />

        {/* Philosophy */}
        <section className="py-20 bg-slate-50">
            <div className="max-w-3xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-light text-slate-900">Our Philosophy</h2>
                <div className="h-px w-12 bg-slate-900 mx-auto mt-6 mb-8" />
                <p className="text-slate-400 leading-relaxed">We believe in the power of simplicity. Great properties speak for themselves — our role is to connect you with spaces that resonate with your vision of home.</p>
            </div>
        </section>

        <AgentSection agents={mockAgents.slice(0, 2)} variant="minimal" title="Our Advisors" />

        <section className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-3xl mx-auto px-6 text-center">
                <h2 className="text-2xl font-light text-slate-900">Get in touch</h2>
                <p className="text-slate-400 mt-3 text-sm">We'd love to help you find your next space.</p>
                <a href="/contact" className="inline-block mt-8 text-sm font-medium text-slate-900 border-b border-slate-900 pb-1 hover:text-slate-600 hover:border-slate-600 transition-colors">Contact us →</a>
            </div>
        </section>
    </>
);
