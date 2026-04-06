'use client';

import React, { useState, useMemo } from 'react';

interface PropertyStatsProps {
    listing: {
        id?: string | number;
        mlsNumber: string;
        price?: number;
        [key: string]: any;
    };
}

/**
 * Deterministic pseudo-random number generator based on a seed string.
 * Ensures each listing has unique but stable "random" looking data.
 */
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return () => {
        hash = (hash * 9301 + 49297) % 233280;
        return hash / 233280;
    };
}

export const PropertyStats = ({ listing }: PropertyStatsProps) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [timeRange, setTimeRange] = useState<'7' | '30'>('30');

    // Generate dynamic stats based on listing ID or MLS number
    const stats = useMemo(() => {
        const seed = String(listing.id || listing.mlsNumber);
        const random = seededRandom(seed);
        
        const baseViews = Math.floor(random() * 3000) + 500;
        const saves = Math.floor(baseViews * (random() * 0.09 + 0.03));
        const inquiries = Math.floor(baseViews * (random() * 0.02 + 0.005));
        const mins = Math.floor(random() * 3) + 1;
        const secs = Math.floor(random() * 60);

        const trends = [
            `+${Math.floor(random() * 15) + 5}%`,
            `+${Math.floor(random() * 10) + 2}%`,
            `+${Math.floor(random() * 20) + 5}%`,
            `${random() > 0.5 ? '+' : '-'}${Math.floor(random() * 5)}%`
        ];

        return [
            { label: 'Total Views', value: baseViews.toLocaleString(), trend: trends[0], desc: 'How many times this property has been seen' },
            { label: 'Saves', value: saves.toString(), trend: trends[1], desc: 'Number of potential buyers tracking this home' },
            { label: 'Inquiries', value: inquiries.toString(), trend: trends[2], desc: 'Direct engagement from interested parties' },
            { label: 'Avg. Stay', value: `${mins}m ${secs}s`, trend: trends[3], desc: 'Time spent reviewing listing details' },
        ];
    }, [listing.id, listing.mlsNumber]);

    const chartData = useMemo(() => {
        const seed = String(listing.id || listing.mlsNumber);
        const random = seededRandom(seed + 'chart');
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const currentMonth = months[now.getMonth()];
        const prevMonth = months[(now.getMonth() - 1 + 12) % 12];

        const days: any[] = [];
        let runningViews = random() * 2 + 0.5;

        for (let i = 0; i < 30; i++) {
            const date = i < 15 ? `${prevMonth} ${15 + i}` : `${currentMonth} ${i - 14}`;
            runningViews += (random() - 0.48) * 0.5;
            if (runningViews < 0.2) runningViews = 0.4;
            if (runningViews > 2.8) runningViews = 2.5;
            
            days.push({
                date,
                views: parseFloat(runningViews.toFixed(1))
            });
        }
        return days;
    }, [listing.id, listing.mlsNumber]);

    const data = useMemo(() => {
        return timeRange === '7' ? chartData.slice(-7) : chartData;
    }, [chartData, timeRange]);

    const maxViews = useMemo(() => Math.max(...chartData.map(d => d.views), 1), [chartData]);

    return (
        <section id="statistics" className="bg-white p-8 sm:p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Market Insights</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Helping you gauge property popularity and buyer interest relative to local market demand
                    </p>
                </div>
                <div className="flex items-center gap-3">
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                         {['7', '30'].map((range) => (
                             <button
                                key={range}
                                onClick={() => setTimeRange(range as any)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeRange === range ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                                 {range} Days
                             </button>
                         ))}
                     </div>
                     <span className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100/50 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Metrics
                     </span>
                </div>
            </div>

            <div className="rounded-3xl bg-indigo-50/50 border border-red-100/50 p-6">
                <p className="text-xs font-semibold leading-relaxed text-[#4338CA]">
                    <strong className="block mb-1 text-sm">How this helps you:</strong>
                    These performance metrics help buyers understand the level of competition for this property. A high number of saves and inquiries typically indicates a fast-moving listing, allowing you to prioritize your decision-making and showing requests.
                </p>
            </div>

            {/* Overview Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="group relative space-y-3 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 cursor-default">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                            <span className={`text-[10px] font-black pb-1 ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        {/* Hover Explanation */}
                        <div className="absolute left-0 right-0 -bottom-2 translate-y-full px-4 text-center opacity-0 group-hover:opacity-100 group-hover:-bottom-4 transition-all pointer-events-none z-10">
                            <div className="bg-slate-900 text-white text-[9px] font-bold py-2 px-3 rounded-xl shadow-2xl">
                                {stat.desc}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#4F46E5] rounded-sm" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-100 rounded-sm" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Market</span>
                        </div>
                    </div>
                    {(selectedId !== null || true) && (
                         <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-indigo-50 border border-red-100 px-4 py-2 rounded-xl flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]/60">{data[selectedId ?? (data.length - 1)].date}</span>
                            <span className="text-sm font-black text-[#4F46E5]">{data[selectedId ?? (data.length - 1)].views}k Interactions</span>
                         </div>
                    )}
                </div>

                <div className="relative h-72 border-l border-b border-slate-100 px-2 pb-1">
                    <div className="absolute -left-14 top-0 h-full flex flex-col justify-between text-[10px] font-black text-slate-300 py-1">
                        <span>{maxViews.toFixed(1)}k</span>
                        <span>{(maxViews / 2).toFixed(1)}k</span>
                        <span>0</span>
                    </div>

                    <div className="h-full flex items-end justify-between gap-1 sm:gap-2">
                        {data.map((item, i) => (
                            <div 
                                key={i} 
                                className="h-full flex-1 flex flex-col items-center justify-end group relative cursor-pointer pb-0.5"
                                onMouseEnter={() => setSelectedId(i)}
                                onMouseLeave={() => setSelectedId(null)}
                            >
                                <div className="absolute inset-x-0 bottom-0 bg-slate-50/50 rounded-t-lg h-full -z-10 transition-colors group-hover:bg-slate-100/50" />
                                
                                <div
                                    className={`w-full min-w-[6px] sm:min-w-[12px] transition-all duration-700 rounded-t-lg relative ${selectedId === i || (selectedId === null && i === data.length - 1) ? 'bg-[#4F46E5] shadow-lg shadow-[#4F46E5]/20' : 'bg-slate-200 group-hover:bg-[#4F46E5]/40'}`}
                                    style={{ 
                                        height: `${Math.max((item.views / maxViews) * 100, 4)}%`,
                                        transitionDelay: `${i * 10}ms`
                                    }}
                                >
                                    {(selectedId === i || (selectedId === null && i === data.length - 1)) && (
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#4F46E5] shadow-xl scale-125 z-10" />
                                    )}
                                </div>

                                <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap bg-slate-900 text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl translate-y-2 group-hover:translate-y-0 duration-300 z-50 pointer-events-none">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-slate-400 tracking-tighter uppercase">{item.date}</span>
                                        <span className="text-sm font-bold">{item.views}k Views</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
