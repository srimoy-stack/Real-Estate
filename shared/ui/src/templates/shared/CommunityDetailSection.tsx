import React from 'react';
import Link from 'next/link';
import { PropertyCard } from './PropertyCard';
import { mockListings } from './mock-data';

const communityData = {
    name: 'Liberty Village',
    description: 'Liberty Village is one of Toronto\'s most dynamic and sought-after neighbourhoods. Originally an industrial area, it has been transformed into a vibrant community of modern condominiums, creative studios, and trendy restaurants.',
    longDescription: 'Known for its converted factories and loft-style living, Liberty Village offers a unique blend of historic charm and modern convenience. The area is home to numerous parks, off-leash dog areas, and community gardens.',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1600',
    stats: { avgPrice: '$780K', listings: 67, transitScore: 88, walkScore: 92 },
    highlights: [
        { title: 'Creative Hub', desc: 'Home to digital agencies and co-working spaces.', icon: '🎨' },
        { title: 'Foodie Paradise', desc: 'Craft breweries and artisan cafes.', icon: '🍜' },
        { title: 'Parks & Green', desc: 'Liberty Village Park and community gardens.', icon: '🌳' },
        { title: 'Transit Access', desc: 'King streetcar and GO station access.', icon: '🚊' },
    ],
};

export const CommunityDetailSection: React.FC<{ community?: any; variant?: string }> = ({ community, variant }) => {
    const data = community || communityData;
    const listings = mockListings.slice(0, 3);
    const isLuxury = variant === 'luxury';
    const isAgent = variant === 'agent';
    const isCorporate = variant === 'corporate';
    const isMinimal = variant === 'minimal';

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="relative h-[60vh] flex items-end overflow-hidden">
                <div className="absolute inset-0">
                    <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 ${isLuxury ? 'bg-black/60' : 'bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent'}`} />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-black text-white/60 mb-4 uppercase tracking-widest italic">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/communities" className="hover:text-white transition-colors">Communities</Link>
                        <span>/</span>
                        <span className="text-white">{data.name}</span>
                    </div>
                    <h1 className={`text-5xl md:text-7xl font-black text-white tracking-tighter italic ${isLuxury ? 'uppercase' : ''}`}>{data.name}</h1>
                    <p className="text-indigo-200 mt-4 text-xl font-medium italic">Greater Toronto Area, ON</p>
                </div>
            </section>

            {/* Stats Bar */}
            <section className={`${isLuxury ? 'bg-black text-white' : isAgent ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'} py-10 shadow-2xl`}>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    {[
                        { label: 'Avg Sale Price', value: data.stats.avgPrice },
                        { label: 'Market Velocity', value: `${data.stats.listings} Active` },
                        { label: 'Lifestyle Walkability', value: `${data.stats.walkScore}/100` },
                        { label: 'Transit Connectivity', value: `${data.stats.transitScore}/100` },
                    ].map(s => (
                        <div key={s.label} className="group">
                            <p className="text-3xl font-black italic tracking-tighter group-hover:scale-110 transition-transform duration-500">{s.value}</p>
                            <p className={`text-[10px] uppercase font-black tracking-widest mt-2 ${isLuxury ? 'text-white/40' : 'text-indigo-200/60'}`}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Narrative & Insights */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-24">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className={`h-1 w-12 ${isLuxury ? 'bg-amber-500' : 'bg-indigo-600'} rounded-full`} />
                                <span className={`${isLuxury ? 'text-amber-500' : 'text-indigo-600'} text-[10px] font-black uppercase tracking-widest italic`}>Market Narrative</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Experience {data.name}</h2>
                            <p className="text-xl text-slate-500 leading-relaxed font-medium italic">{data.description}</p>
                        </div>
                        <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 italic font-medium text-slate-600 leading-loose">
                            {data.longDescription}
                        </div>

                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                            {data.highlights.map((h: any) => (
                                <div key={h.title} className="group p-8 bg-white border border-slate-100 rounded-[40px] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                    <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{h.icon}</div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter italic mb-3">{h.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{h.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className={`p-10 ${isLuxury ? 'bg-slate-950 text-white' : 'bg-indigo-50 border border-indigo-100'} rounded-[48px] sticky top-24 shadow-xl`}>
                            <h3 className={`text-2xl font-black tracking-tighter mb-4 italic ${isLuxury ? 'text-white' : 'text-slate-900'}`}>{data.name} Market Report</h3>
                            <p className={`text-sm mb-8 leading-relaxed italic font-medium ${isLuxury ? 'text-white/60' : 'text-slate-500'}`}>Receive a curated selection of off-market pocket listings and historical sales data for this neighborhood.</p>
                            <form className="space-y-4">
                                <input type="text" placeholder="Full Name" className={`w-full px-6 py-4 rounded-2xl text-sm italic outline-none transition-all ${isLuxury ? 'bg-white/10 border-white/20 text-white focus:bg-white/20' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
                                <input type="email" placeholder="Email Address" className={`w-full px-6 py-4 rounded-2xl text-sm italic outline-none transition-all ${isLuxury ? 'bg-white/10 border-white/20 text-white focus:bg-white/20' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
                                <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest italic transition-all shadow-xl ${isLuxury ? 'bg-amber-500 text-black hover:bg-amber-400' : isAgent ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}>Request Report</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contemporary Listings */}
            {!isMinimal && !isCorporate && (
                <section className="py-24 bg-slate-950 text-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div className="space-y-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest italic ${isLuxury ? 'text-amber-500' : 'text-indigo-400'}`}>Curated Portfolio</span>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic">Active Mandates in {data.name}</h2>
                            </div>
                            <Link href="/listings" className={`px-10 py-4 font-black text-xs rounded-2xl transition-all border uppercase tracking-widest italic ${isLuxury ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20' : 'bg-white/10 hover:bg-white/20 text-white border-white/10'}`}>Inventory Access</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {listings.map((l: any) => (
                                <div key={l.id} className="group">
                                    <PropertyCard listing={l} variant={isLuxury ? 'luxury' : 'default'} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};
