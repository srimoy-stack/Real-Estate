import React from 'react';

export type BadgeType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusBadgeProps {
    label: string;
    type: BadgeType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, type }) => {
    const styles = {
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        error: 'bg-rose-50 text-rose-600 border-rose-100',
        info: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        neutral: 'bg-slate-50 text-slate-600 border-slate-100',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${styles[type]} uppercase tracking-widest leading-none`}>
            {label}
        </span>
    );
};
