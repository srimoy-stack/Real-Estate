import React from 'react';
import { Card } from '@repo/ui';

interface SeoSerpPreviewProps {
    title: string;
    description: string;
    url?: string;
}

export const SeoSerpPreview: React.FC<SeoSerpPreviewProps> = ({
    title,
    description,
    url = 'https://prestigerealty.com'
}) => {
    return (
        <Card variant="dark" padding="md" className="space-y-6">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">SERP Preview Simulation</p>
            <div className="space-y-2">
                <p className="text-blue-400 text-xl font-medium cursor-pointer hover:underline truncate">
                    {title || 'Luxury Real Estate | Prestige Realty'}
                </p>
                <p className="text-emerald-500 text-sm italic">{url}</p>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                    {description || 'Discover high-end luxury real estate and exclusive property listings. Your gateway to extraordinary living and architectural masterpieces.'}
                </p>
            </div>
        </Card>
    );
};
