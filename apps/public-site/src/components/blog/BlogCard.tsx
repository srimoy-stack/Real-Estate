import React from 'react';
import { BlogPost } from '@repo/mock-api';
import Link from 'next/link';

interface BlogCardProps {
    post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {post.category}
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{post.date}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span>{post.readTime}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">
                            {post.title}
                        </h3>
                        <p className="text-slate-500 font-medium line-clamp-3 leading-relaxed">
                            {post.excerpt}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={post.authorImage} alt={post.author} className="h-8 w-8 rounded-full border border-slate-100 shadow-sm" />
                            <span className="text-xs font-black text-slate-900">{post.author}</span>
                        </div>
                        <div className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                            Read More
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
