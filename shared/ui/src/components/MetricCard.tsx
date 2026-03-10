import React from 'react';

export interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: {
        value: string | number;
        type: 'positive' | 'negative' | 'neutral';
    };
    icon?: React.ReactNode;
    color?: string; // from-indigo-500 to-blue-600 format
}

export const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    trend,
    icon,
    color = 'from-indigo-500 to-blue-600'
}) => {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-lg">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-5 blur-2xl transition-opacity group-hover:opacity-10`} />

            <div className="flex justify-between items-start">
                <div className="relative z-10">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900 tracking-tighter italic">{value}</p>
                    {trend && (
                        <p className={`mt-2 text-[10px] font-black flex items-center gap-1 uppercase tracking-widest ${trend.type === 'positive' ? 'text-emerald-600' :
                            trend.type === 'negative' ? 'text-rose-600' : 'text-slate-400'
                            }`}>
                            {trend.type === 'positive' && (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            )}
                            {trend.type === 'negative' && (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            )}
                            {trend.value}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg shadow-indigo-100 relative z-10`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};
