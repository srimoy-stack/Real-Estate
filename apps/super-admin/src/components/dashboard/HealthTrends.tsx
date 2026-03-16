'use client';

import React, { useState } from 'react';
import { DashboardMetrics } from '@repo/services';

export default function HealthTrends({ metrics }: { metrics: DashboardMetrics }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxVal = Math.max(...metrics.leadsTrend.map(p => p.value), 100);
    const width = 1000;
    const height = 400;
    const padding = 40;

    const points = metrics.leadsTrend.map((p, i) => ({
        x: (i / (metrics.leadsTrend.length - 1)) * (width - padding * 2) + padding,
        y: height - (p.value / maxVal) * (height - padding * 2) - padding,
        value: p.value,
        date: p.date
    }));

    // Generate SVG path for a smooth curve
    const generatePath = () => {
        if (points.length < 2) return '';
        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
            d += ` C ${cp1x},${points[i - 1].y} ${cp1x},${points[i].y} ${points[i].x},${points[i].y}`;
        }
        return d;
    };

    const areaPath = `${generatePath()} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

    return (
        <div className="relative w-full h-[400px] group/chart">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                    <line
                        key={tick}
                        x1={padding}
                        y1={padding + (height - padding * 2) * (1 - tick)}
                        x2={width - padding}
                        y2={padding + (height - padding * 2) * (1 - tick)}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                    />
                ))}

                {/* Area and Line */}
                <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-1000 ease-out" />
                <path
                    d={generatePath()}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-1000 ease-out"
                />

                {/* Data Points */}
                {points.map((p, i) => (
                    <g
                        key={i}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="cursor-pointer"
                    >
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredIndex === i ? "8" : "4"}
                            fill={hoveredIndex === i ? "#4f46e5" : "white"}
                            stroke="#4f46e5"
                            strokeWidth="3"
                            className="transition-all duration-200"
                        />
                        {/* Hover Overlay Line */}
                        {hoveredIndex === i && (
                            <line
                                x1={p.x}
                                y1={p.y}
                                x2={p.x}
                                y2={height - padding}
                                stroke="#4f46e5"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                className="animate-in fade-in"
                            />
                        )}
                    </g>
                ))}

                {/* X-Axis Labels */}
                {points.map((p, i) => (
                    <text
                        key={i}
                        x={p.x}
                        y={height - 10}
                        textAnchor="middle"
                        className="text-[12px] font-black fill-slate-400 uppercase tracking-tighter"
                    >
                        {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </text>
                ))}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredIndex !== null && (
                <div
                    className="absolute z-30 pointer-events-none bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200"
                    style={{
                        left: `${(points[hoveredIndex].x / width) * 100}%`,
                        top: `${(points[hoveredIndex].y / height) * 100 - 15}%`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aggregate Leads</span>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-black text-indigo-400 leading-none">{points[hoveredIndex].value}</span>
                            <span className="text-[10px] font-bold text-slate-500 mb-0.5">Units / Day</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800 text-[8px] font-bold text-slate-400">
                            {new Date(points[hoveredIndex].date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
