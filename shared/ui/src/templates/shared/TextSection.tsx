import React from 'react';

export interface TextSectionProps {
    text?: string;
    align?: 'left' | 'center' | 'right';
    content?: {
        text?: string;
    };
}

export const TextSection: React.FC<TextSectionProps> = ({
    text = '',
    align = 'left',
    content
}) => {
    const displayText = content?.text || text;

    return (
        <section className="py-12 bg-white">
            <div className={`max-w-4xl mx-auto px-6 text-${align}`}>
                <div
                    className="prose prose-slate max-w-none text-lg text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: displayText }}
                />
            </div>
        </section>
    );
};
