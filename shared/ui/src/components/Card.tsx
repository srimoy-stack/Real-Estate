import React from 'react';

type CardVariant = 'standard' | 'flat' | 'dark' | 'glass';
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
    variant?: CardVariant;
    padding?: CardPadding;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    variant = 'standard',
    padding = 'lg',
    children,
    className = '',
    onClick,
}) => {
    const baseStyles = 'rounded-[48px] border transition-all';

    const variants = {
        standard: 'bg-white border-slate-200 shadow-sm hover:shadow-md',
        flat: 'bg-slate-50 border-slate-100 shadow-none',
        dark: 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-indigo-500/10',
        glass: 'bg-white/70 backdrop-blur-xl border-white/20 shadow-xl',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-10',
        xl: 'p-12',
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
