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
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 p-6 transition-all hover:border-white/10 hover:bg-slate-900/80">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`} />

            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-400 capitalize">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-white tracking-tight">{value}</p>
                    {trend && (
                        <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${trend.type === 'positive' ? 'text-emerald-400' :
                                trend.type === 'negative' ? 'text-rose-400' : 'text-slate-400'
                            }`}>
                            {trend.type === 'positive' && (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            )}
                            {trend.type === 'negative' && (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            )}
                            {trend.value}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 text-white shadow-lg`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};
