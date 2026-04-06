import React from 'react';
import { BlogPost } from '@repo/types';
import Link from 'next/link';
import { SafeImage } from '@/components/ui';

interface BlogCardProps {
    post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    const formattedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Draft';

    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-red-100 shadow-sm hover:shadow-2xl hover:shadow-[#4F46E5]/10 transition-all duration-500">
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {post.featuredImage ? (
                        <SafeImage
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {post.category}
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{formattedDate}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span>{post.author}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-[#4F46E5] transition-colors">
                            {post.title}
                        </h3>
                        <p className="text-slate-500 font-medium line-clamp-3 leading-relaxed">
                            {post.excerpt}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="text-[#4F46E5] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                            Read More
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
