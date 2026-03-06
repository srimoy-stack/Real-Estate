import React from 'react';
import { PageBlock, BlockType } from '@repo/types';

const TextBlock = ({ content }: { content: any }) => (
    <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-xl text-slate-700 leading-relaxed font-medium">
                {content.text || 'Enter your text content here...'}
            </p>
        </div>
    </div>
);

const ImageBlock = ({ content }: { content: any }) => (
    <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="rounded-[40px] overflow-hidden shadow-2xl border border-slate-100">
            {content.url ? (
                <img src={content.url} alt={content.caption || 'Page image'} className="w-full h-auto" />
            ) : (
                <div className="aspect-video bg-slate-100 flex items-center justify-center italic text-slate-400 font-bold">
                    Image Placeholder
                </div>
            )}
        </div>
        {content.caption && (
            <p className="mt-6 text-center text-sm font-bold text-slate-400 uppercase tracking-widest italic">
                {content.caption}
            </p>
        )}
    </div>
);

const TextImageBlock = ({ content }: { content: any }) => (
    <div className="max-w-6xl mx-auto py-20 px-6">
        <div className={`flex flex-col md:flex-row items-center gap-16 ${content.layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1 space-y-8">
                <h2 className="text-4xl font-black text-slate-900 leading-tight">
                    Premium <span className="text-indigo-600">Architectural</span> Narratives
                </h2>
                <p className="text-lg text-slate-600 font-medium leading-relaxed italic">
                    {content.text || 'Elevating real estate through narrative-driven design and strategic placement.'}
                </p>
            </div>
            <div className="flex-1 w-full">
                <div className="rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 aspect-square md:aspect-video lg:aspect-square">
                    {content.url ? (
                        <img src={content.url} alt="Text+Image" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center italic text-slate-400 font-bold">
                            Visual Asset
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const CTABlock = ({ content }: { content: any }) => (
    <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="bg-slate-900 rounded-[48px] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
                <h3 className="text-3xl font-black text-white mb-10 leading-tight uppercase tracking-tight">
                    {content.label || 'Reserve Your Consultation'}
                </h3>
                <button className="px-12 py-5 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl text-sm uppercase tracking-widest">
                    {content.label || 'Get Started'}
                </button>
            </div>
        </div>
    </div>
);

const GalleryBlock = ({ content }: { content: any }) => (
    <div className="max-w-7xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(content.images || [1, 2, 3, 4, 5, 6]).map((img: any, i: number) => (
                <div key={i} className="aspect-square rounded-[32px] bg-slate-100 border border-slate-100 shadow-sm overflow-hidden hover:scale-[1.02] transition-all cursor-pointer">
                    {img.url ? (
                        <img src={img.url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">
                            Portfolio Asset {i + 1}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const VideoBlock = ({ content }: { content: any }) => (
    <div className="max-w-6xl mx-auto py-20 px-6 font-inter">
        <div className="aspect-video rounded-[48px] bg-black overflow-hidden shadow-2xl border-4 border-slate-900 flex items-center justify-center relative group">
            {content.url ? (
                <iframe
                    src={content.url}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Player"
                />
            ) : (
                <div className="text-center">
                    <div className="h-20 w-20 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform bg-white/5">
                        <div className="w-0 h-0 border-l-[15px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-2" />
                    </div>
                    <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Cinematic Narrative Embed</p>
                </div>
            )}
        </div>
    </div>
);

const BLOCK_COMPONENTS: Record<BlockType, React.FC<{ content: any }>> = {
    text: TextBlock,
    image: ImageBlock,
    text_image: TextImageBlock,
    cta: CTABlock,
    gallery: GalleryBlock,
    video: VideoBlock
};

export const PageBlockRenderer: React.FC<{ blocks: PageBlock[] }> = ({ blocks }) => {
    return (
        <div className="w-full bg-white">
            {blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => {
                    const Component = BLOCK_COMPONENTS[block.type];
                    return Component ? <Component key={block.id} content={block.content} /> : null;
                })}
        </div>
    );
};
