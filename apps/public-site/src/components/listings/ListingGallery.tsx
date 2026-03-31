'use client';

import React, { useState, useCallback } from 'react';
import { SafeImage } from '@/components/ui';

interface ListingGalleryProps {
    images: string[];
    title: string;
    virtualTourUrl?: string;
}

export const ListingGallery: React.FC<ListingGalleryProps> = ({ images, title, virtualTourUrl }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [imgLoaded, setImgLoaded] = useState<Record<number, boolean>>({});

    const nextImage = useCallback(() => {
        if (!images || images.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images]);

    const prevImage = useCallback(() => {
        if (!images || images.length === 0) return;
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'Escape') setLightboxOpen(false);
    }, [nextImage, prevImage]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[16/9] bg-slate-100 rounded-[40px] flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">No images available for this listing</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Main Gallery */}
            <div
                className="relative w-full rounded-[40px] overflow-hidden group shadow-2xl isolate bg-slate-900 cursor-pointer"
                onClick={() => setLightboxOpen(true)}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="img"
                aria-label={`Image gallery for ${title}`}
            >
                <div className="aspect-[16/9] relative md:aspect-[21/9]">
                    <SafeImage
                        src={images[currentIndex]}
                        alt={`${title} - image ${currentIndex + 1}`}
                        fill
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                        priority={currentIndex === 0}
                        onLoad={() => setImgLoaded(prev => ({ ...prev, [currentIndex]: true }))}
                        seed={`gallery-main-${currentIndex}-${images[currentIndex]}`}
                    />

                    {/* Loading skeleton */}
                    {!imgLoaded[currentIndex] && (
                        <div className="absolute inset-0 bg-slate-800 animate-pulse" />
                    )}

                    {/* Gradient overlay for UI elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {images.length > 1 && (
                    <>
                        {/* Navigation Buttons */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/30 pointer-events-auto transition-all focus:outline-none border border-white/10 shadow-2xl"
                                aria-label="Previous image"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/30 pointer-events-auto transition-all focus:outline-none border border-white/10 shadow-2xl"
                                aria-label="Next image"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        {/* Image Counter Badge */}
                        <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl z-20 border border-white/10">
                            {currentIndex + 1} / {images.length}
                        </div>

                        {/* View Photos CTA on hover */}
                        <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 backdrop-blur-xl text-slate-900 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl border border-white/20 shadow-2xl flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                View All {images.length} Photos
                            </div>
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="absolute bottom-6 left-6 right-40 overflow-x-auto flex gap-2 pb-2 z-20 no-scrollbar opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {images.slice(0, 8).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                    className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-white shadow-lg scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <SafeImage 
                                        src={img} 
                                        alt={`thumbnail ${idx + 1}`} 
                                        fill 
                                        className="w-full h-full object-cover" 
                                        seed={`gallery-thumb-${idx}-${img}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Virtual Tour Badge */}
                {virtualTourUrl && (
                    <a
                        href={virtualTourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-6 left-6 bg-indigo-600/90 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl z-20 border border-indigo-400/30 hover:bg-indigo-500 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        3D Virtual Tour
                    </a>
                )}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center animate-in fade-in duration-300"
                    onClick={() => setLightboxOpen(false)}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="dialog"
                    aria-label="Image lightbox"
                >
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-8 right-8 w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center z-30 hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {/* Counter */}
                    <div className="absolute top-8 left-8 text-white/70 text-sm font-bold z-30">
                        {currentIndex + 1} of {images.length}
                    </div>

                    {/* Image */}
                    <div className="relative max-w-6xl w-full h-[85vh] mx-auto px-20" onClick={(e) => e.stopPropagation()}>
                        <SafeImage
                            src={images[currentIndex]}
                            alt={`${title} - image ${currentIndex + 1}`}
                            fill
                            className="object-contain rounded-2xl"
                            seed={`gallery-lightbox-${currentIndex}-${images[currentIndex]}`}
                        />
                    </div>

                    {/* Nav arrows */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-white/10 text-white flex items-center justify-center z-30 hover:bg-white/20 transition-colors"
                            >
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-white/10 text-white flex items-center justify-center z-30 hover:bg-white/20 transition-colors"
                            >
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </>
                    )}

                    {/* Thumbnail strip at bottom */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-30">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all relative ${idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-40 hover:opacity-80'}`}
                            >
                                <SafeImage 
                                    src={img} 
                                    alt="" 
                                    fill 
                                    className="w-full h-full object-cover" 
                                    seed={`gallery-lightbox-thumb-${idx}-${img}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
