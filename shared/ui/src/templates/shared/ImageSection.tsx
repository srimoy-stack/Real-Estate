import React from 'react';

export interface ImageSectionProps {
    url?: string;
    caption?: string;
    fullWidth?: boolean;
}

export const ImageSection: React.FC<ImageSectionProps & { id?: string }> = ({
    url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    caption,
    fullWidth = false,
    id
}) => {
    return (
        <section id={id} className={`py-12 ${fullWidth ? '' : 'px-6'} bg-white`}>
            <div className={`${fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}`}>
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                    <img
                        src={url}
                        alt={caption || 'Section image'}
                        className="w-full h-full object-cover"
                    />
                </div>
                {caption && (
                    <p className="mt-4 text-center text-sm font-medium text-slate-500 italic">
                        {caption}
                    </p>
                )}
            </div>
        </section>
    );
};
