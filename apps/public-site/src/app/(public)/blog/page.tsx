'use client';

import React, { useEffect, useState } from 'react';
import { BlogPost } from '@repo/types';
import { blogService } from '@repo/services';
import { BlogCard } from '@/components/blog/BlogCard';

export default function BlogListingPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch only published posts for public site
                const allPosts = await blogService.getPosts('org-1');
                setPosts(allPosts.filter(p => p.status === 'Published'));
            } catch (error) {
                console.error('Failed to fetch blog posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-64 bg-slate-200 rounded-xl mx-auto" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-[32px] h-[450px]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="pt-32 pb-20 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#4F46E5]/[0.02] -skew-x-12 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-1 w-8 bg-[#4F46E5] rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4F46E5]">Company Journal</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-8">
                            Modern <span className="text-[#4F46E5] italic">Insights</span> <br />
                            & Market Analysis.
                        </h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            Stay ahead of the curve with our expert commentary on real estate trends,
                            investment strategies, and community highlights.
                        </p>
                    </div>
                </div>
            </header>

            {/* Grid */}
            <main className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {posts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-400 font-medium">No articles published yet. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {posts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
