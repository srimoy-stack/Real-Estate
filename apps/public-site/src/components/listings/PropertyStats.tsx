'use client';

import React, { useState } from 'react';

export const PropertyStats = () => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [timeRange, setTimeRange] = useState<'7' | '30'>('30');

    // Analytics mock data
    const overviewStats = [
        { label: 'Total Views', value: '1,284', trend: '+12%', color: 'text-indigo-600' },
        { label: 'Saves', value: '48', trend: '+5%', color: 'text-rose-500' },
        { label: 'Inquiries', value: '12', trend: '+22%', color: 'text-emerald-600' },
        { label: 'Avg. Stay', value: '2m 14s', trend: '-2%', color: 'text-amber-500' },
    ];

    const allData = [
        { date: 'Feb 15', views: 0.4 }, { date: 'Feb 17', views: 0.6 },
        { date: 'Feb 19', views: 0.5 }, { date: 'Feb 21', views: 0.7 },
        { date: 'Feb 23', views: 0.4 }, { date: 'Feb 25', views: 0.8 },
        { date: 'Feb 26', views: 0.8 }, { date: 'Feb 27', views: 1.1 },
        { date: 'Mar 1', views: 1.2 }, { date: 'Mar 2', views: 0.9 },
        { date: 'Mar 3', views: 1.5 }, { date: 'Mar 4', views: 1.3 },
        { date: 'Mar 5', views: 1.8 }, { date: 'Mar 6', views: 1.4 },
        { date: 'Mar 7', views: 2.0 }, { date: 'Mar 8', views: 1.7 },
        { date: 'Mar 9', views: 1.6 }, { date: 'Mar 10', views: 1.9 },
        { date: 'Mar 11', views: 1.4 }, { date: 'Mar 12', views: 1.5 },
        { date: 'Mar 13', views: 1.7 }, { date: 'Mar 14', views: 1.6 },
        { date: 'Mar 15', views: 1.9 }, { date: 'Mar 16', views: 2.1 },
        { date: 'Mar 17', views: 2.3 }, { date: 'Mar 18', views: 1.8 },
        { date: 'Mar 19', views: 2.5 },
    ];

    const data = timeRange === '7' ? allData.slice(-7) : allData;
    const maxViews = 2.5;

    return (
        <section id="statistics" className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-sm space-y-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Market Insights</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                         {['7', '30'].map((range) => (
                             <button
                                key={range}
                                onClick={() => setTimeRange(range as any)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                                 {range} Days
                             </button>
                         ))}
                     </div>
                     <span className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100/50 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                     </span>
                </div>
            </div>

            {/* Overview Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {overviewStats.map((stat, i) => (
                    <div key={i} className="space-y-3 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group cursor-default">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            <span className={`text-[10px] font-black pb-1 ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-indigo-600 rounded-sm" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-100 rounded-sm" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg</span>
                        </div>
                    </div>
                    {selectedId !== null && (
                         <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{data[selectedId].date}</span>
                            <span className="text-sm font-black text-indigo-600">{data[selectedId].views}k Interactions</span>
                         </div>
                    )}
                </div>

                <div className="relative h-72 border-l border-b border-slate-100 px-2 pb-1">
                    <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-[10px] font-black text-slate-300 py-1">
                        <span>2.5k</span>
                        <span>1.2k</span>
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
                                {/* Active Selection Background Tracking */}
                                <div className="absolute inset-x-0 bottom-0 bg-slate-50/50 rounded-t-lg h-full -z-10 transition-colors group-hover:bg-slate-100/50" />
                                
                                {/* The Bar */}
                                <div
                                    className={`w-full min-w-[6px] sm:min-w-[12px] transition-all duration-700 rounded-t-lg relative ${selectedId === i || (selectedId === null && i === data.length - 1) ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-200 group-hover:bg-indigo-300'}`}
                                    style={{ 
                                        height: `${Math.max((item.views / maxViews) * 100, 4)}%`,
                                        transitionDelay: `${i * 10}ms`
                                    }}
                                >
                                    {/* Indicator Dot for Active/Selected */}
                                    {(selectedId === i || (selectedId === null && i === data.length - 1)) && (
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-indigo-600 shadow-xl scale-125 z-10" />
                                    )}
                                </div>

                                {/* Tooltip */}
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
