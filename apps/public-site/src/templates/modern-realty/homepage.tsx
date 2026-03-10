'use client';

import React from 'react';
import { HeroSection, FeaturedListings, AgentSection, mockListings, mockAgents } from '../shared';

export const Homepage: React.FC = () => (
    <>
        <HeroSection variant="default" title="Find Your Dream Home" subtitle="Explore premium properties curated for modern living." />
        <FeaturedListings listings={mockListings} variant="default" title="Featured Properties" />

        {/* About Section */}
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1">
                    <div className="h-1 w-12 bg-indigo-600 mb-6" />
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-6">Expertise in Every <span className="text-indigo-600">Transaction</span></h2>
                    <p className="text-slate-500 leading-relaxed text-lg mb-8">Our team of dedicated professionals brings decades of collective experience to help you navigate the complex world of real estate. From first-time buyers to seasoned investors, we provide the insights you need.</p>
                    <div className="flex gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1">
                            <p className="text-2xl font-black text-indigo-600">20+</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Years Experience</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1">
                            <p className="text-2xl font-black text-indigo-600">1.5k</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Properties Sold</p>
                        </div>
                    </div>
                </div>
                <div className="order-1 md:order-2">
                    <div className="aspect-square rounded-[40px] bg-slate-100 overflow-hidden shadow-2xl skew-y-3">
                        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" alt="About" className="w-full h-full object-cover -skew-y-3 scale-110" />
                    </div>
                </div>
            </div>
        </section>

        {/* Communities Section */}
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Explore Communities</h2>
                        <p className="text-slate-500 font-medium">Find the neighborhood that perfectly matches your lifestyle.</p>
                    </div>
                    <button className="text-indigo-600 font-black text-sm uppercase tracking-widest flex items-center gap-2">View All Areas →</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { name: 'Forest Hill', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600', count: 42 },
                        { name: 'Yorkville', img: 'https://images.unsplash.com/photo-1448630360428-65476f8a614e?auto=format&fit=crop&q=80&w=600', count: 28 },
                        { name: 'The Annex', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600', count: 35 },
                        { name: 'High Park', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600', count: 19 },
                    ].map(c => (
                        <div key={c.name} className="group relative rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer">
                            <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className="text-white text-xl font-black tracking-tight">{c.name}</h3>
                                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mt-1">{c.count} Active Listings</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Stats Band */}
        <section className="py-16 bg-indigo-600">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[{ n: '2,500+', l: 'Happy Clients' }, { n: '850+', l: 'Properties Sold' }, { n: '15+', l: 'Years of Trust' }, { n: '$1.2B', l: 'Total Volume' }].map(s => (
                    <div key={s.l}><p className="text-4xl font-black text-white tracking-tighter">{s.n}</p><p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-2">{s.l}</p></div>
                ))}
            </div>
        </section>

        <AgentSection agents={mockAgents} variant="default" title="Meet Our Team" />

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-4xl font-black text-white tracking-tighter">Ready to find your next home?</h2>
                <p className="text-indigo-200 mt-4">Our agents are standing by to assist you with your real estate journey.</p>
                <a href="/contact" className="inline-block mt-8 px-10 py-4 bg-white text-indigo-700 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl">Get In Touch</a>
            </div>
        </section>
    </>
);
