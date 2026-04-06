import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';
import { communitiesService } from '@repo/services';
import { Community } from '@repo/types';
import { CommunityCard } from '@/components/communities/CommunityCard';

export const metadata = {
    title: 'Explore Communities | Luxury Neighborhoods',
    description: 'Discover the most desirable locations and exclusive neighborhoods where luxury meets lifestyle.',
};

export default async function CommunitiesPage() {
    const communities = await communitiesService.getCommunities();

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <section className="pt-32 pb-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Neighborhood Guides</span>
                        <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                        Elite <span className="text-emerald-500 italic">Communities</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium leading-relaxed">
                        From the vibrant energy of downtown sky-rises to the tranquil privacy of mountain retreats, explore the neighborhoods that define modern luxury.
                    </p>
                </div>
            </section>

            {/* Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
                        {communities.map((community: Community) => (
                            <CommunityCard key={community.id} community={community} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Map Placeholder/CTA */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900 rounded-[3rem] overflow-hidden flex flex-col lg:flex-row items-center">
                        <div className="p-12 lg:p-20 space-y-8 flex-1">
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-tight italic">
                                Visualize <br /> Your Next <span className="text-emerald-400">Move</span>
                            </h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                Use our interactive map to filter by school districts, commute times, and local lifestyle amenities.
                            </p>
                            <Link
                                href="/map-search"
                                className="inline-flex items-center justify-center h-16 px-12 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-200"
                            >
                                Open Interactive Map
                            </Link>
                        </div>
                        <div className="flex-1 w-full lg:h-[600px] h-[300px] bg-slate-800 relative">
                            <SafeImage
                                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200"
                                fill
                                className="object-cover opacity-50 grayscale"
                                alt="Map"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 text-white text-center">
                                    <p className="font-black italic uppercase tracking-widest text-[10px] mb-2">Coming Soon</p>
                                    <h3 className="text-2xl font-black tracking-tighter">Interactive Navigator</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
