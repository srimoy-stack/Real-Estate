'use client';

import React from 'react';

export const PropertyStats = () => {
    // Mock data for the bar chart
    const data = [
        { date: 'Feb 26', views: 0.8 },
        { date: 'Feb 27', views: 0.9 },
        { date: 'Mar 1', views: 1.2 },
        { date: 'Mar 3', views: 1.5 },
        { date: 'Mar 5', views: 1.8 },
        { date: 'Mar 7', views: 2.0 },
        { date: 'Mar 9', views: 1.6 },
        { date: 'Mar 11', views: 1.4 },
        { date: 'Mar 13', views: 1.7 },
        { date: 'Mar 15', views: 1.9 },
    ];

    const maxViews = 2.0;

    return (
        <section id="statistics" className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-sm space-y-12">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Statistics</h2>
                <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-100 rounded-sm" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Views</span>
                    </div>
                </div>

                <div className="relative h-64 border-l border-b border-slate-100">
                    {/* Y-Axis Labels */}
                    <div className="absolute -left-10 top-0 h-full flex flex-col justify-between text-[10px] font-black text-slate-300 py-1">
                        <span>2.00</span>
                        <span>1.90</span>
                        <span>1.80</span>
                        <span>1.70</span>
                        <span>1.60</span>
                        <span>1.50</span>
                        <span>1.40</span>
                        <span>1.30</span>
                        <span>1.20</span>
                        <span>1.10</span>
                        <span>1.00</span>
                    </div>

                    {/* Bars */}
                    <div className="h-full flex items-end justify-between px-4 pb-1">
                        {data.map((item, i) => (
                            <div key={i} className="flex flex-col items-center group relative cursor-pointer">
                                <div
                                    className="w-8 sm:w-12 bg-slate-100 hover:bg-indigo-600 transition-all duration-500 rounded-t-lg"
                                    style={{ height: `${(item.views / maxViews) * 100}%` }}
                                />
                                <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 duration-300">
                                    {item.views}k Views
                                </div>
                                <span className="absolute top-full mt-4 text-[9px] font-bold text-slate-300 rotate-45 origin-left">{item.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
