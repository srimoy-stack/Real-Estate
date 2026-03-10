'use client';

import React, { useState } from 'react';

interface ListingGalleryProps {
    images: string[];
    title: string;
}

export const ListingGallery: React.FC<ListingGalleryProps> = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[16/9] bg-slate-100 rounded-3xl flex items-center justify-center font-medium text-slate-400">
                No images available
            </div>
        );
    }

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

    return (
        <div className="relative w-full rounded-[40px] overflow-hidden group shadow-2xl isolate bg-slate-900">
            <div className="aspect-[16/9] relative md:aspect-[21/9]">
                <img
                    src={images[currentIndex]}
                    alt={`${title} - image ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
            </div>

            {images.length > 1 && (
                <>
                    {/* Navigation Buttons */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={(e) => { e.preventDefault(); prevImage(); }}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 pointer-events-auto transition-colors focus:outline-none"
                            aria-label="Previous image"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); nextImage(); }}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 pointer-events-auto transition-colors focus:outline-none"
                            aria-label="Next image"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl z-20">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="absolute bottom-6 left-6 right-24 overflow-x-auto flex gap-3 pb-2 z-20 no-scrollbar opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {images.slice(0, 10).map((img, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-amber-400 shadow-lg scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
