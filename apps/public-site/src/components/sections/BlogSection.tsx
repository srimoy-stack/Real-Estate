'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogService } from '@repo/services';
import { BlogPost } from '@repo/types';

export const BlogSection = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await blogService.getPosts('org-1');
                setPosts(data.filter(p => p.status === 'Published').slice(0, 3));
            } catch (error) {
                console.error('Failed to fetch blog posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return null;

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
                    {posts.map((post) => (
                        <article key={post.id} className="group flex flex-col space-y-6">
                            <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] rounded-[32px] overflow-hidden block">
                                <Image
                                    src={post.featuredImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                                        {post.category}
                                    </span>
                                </div>
                            </Link>

                            <div className="space-y-4 px-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                                </p>
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </h3>
                                <p className="text-slate-500 font-medium line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 group-hover:text-indigo-600 transition-colors">
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

