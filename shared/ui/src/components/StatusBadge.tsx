import React from 'react';

export type BadgeType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusBadgeProps {
    label: string;
    type: BadgeType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, type }) => {
    const styles = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[type]} uppercase tracking-wider`}>
            {label}
        </span>
    );
};
