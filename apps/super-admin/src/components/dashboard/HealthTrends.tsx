'use client';

import React from 'react';
import { DashboardMetrics } from '@repo/services';

export default function HealthTrends({ metrics }: { metrics: DashboardMetrics }) {
    return (
        <div className="h-64 flex items-end justify-between gap-2 px-2">
            {metrics.leadsTrend.map((point, i) => {
                const height = (point.value / 100) * 100;
                return (
                    <div key={i} className="flex-1 group relative">
                        <div
                            className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-lg transition-all duration-300"
                            style={{ height: `${height}%` }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {point.value}
                            </div>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 text-center truncate select-none">
                            {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
