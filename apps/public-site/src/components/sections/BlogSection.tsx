'use client';

import React from 'react';
import Link from 'next/link';

const BLOG_POSTS = [
    {
        title: 'How to Prepare Your Home for a Spring Sale',
        date: 'March 14, 2026',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
        excerpt: 'Maximize your property value with these essential staging and renovation tips from our top-performing agents.'
    },
    {
        title: 'Current Trends in the Luxury Condo Market',
        date: 'March 10, 2026',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
        excerpt: 'We analyze the shift in urban living preferences and what investors need to watch for in the coming months.'
    },
    {
        title: 'Sustainable Architecture: The Future of Luxury',
        date: 'March 05, 2026',
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800',
        excerpt: 'Discover how modern eco-friendly designs are redefining exclusivity and comfort in high-end real estate.'
    }
];

export const BlogSection = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
                    <div className="max-w-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Our Journal</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                            Industry <span className="text-indigo-600 italic">Insights</span>
                        </h2>
                        <p className="text-slate-500 font-medium">
                            Stay informed with the latest market analysis, lifestyle trends, and expert real estate advice.
                        </p>
                    </div>
                    <Link href="/blog" className="h-14 px-10 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 border border-slate-200">
                        Read All Posts
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post, i) => (
                        <article key={i} className="group flex flex-col space-y-6">
                            <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                                        Lifestyle
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 px-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{post.date}</p>
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-slate-500 font-medium line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <Link href={`/blog/${i}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    Read Full Story
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
