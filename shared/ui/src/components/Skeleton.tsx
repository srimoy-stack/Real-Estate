import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular'
}) => {
    const baseClasses = 'animate-pulse bg-slate-800/50';

    const variantClasses = {
        text: 'h-4 w-full rounded',
        circular: 'h-12 w-12 rounded-full',
        rectangular: 'h-32 w-full',
        rounded: 'h-32 w-full rounded-2xl',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        />
    );
};
