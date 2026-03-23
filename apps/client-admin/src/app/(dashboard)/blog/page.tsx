'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost, BlogPostStatus } from '@repo/types';
import { blogService, useNotificationStore } from '@repo/services';

const STATUS_THEMES: Record<BlogPostStatus, { bg: string; text: string; dot: string }> = {
    Draft: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
    Published: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const PostStatusBadge = ({ status }: { status: BlogPostStatus }) => {
    const theme = STATUS_THEMES[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent transition-all ${theme.bg} ${theme.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} ${status === 'Published' ? 'animate-pulse' : ''}`} />
            {status}
        </span>
    );
};

export default function BlogManagementPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                // Use default tenant ID for now, will be dynamic in production
                const data = await blogService.getPosts('org-1');
                setPosts(data);
            } catch (error) {
                console.error('Failed to load blog posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await blogService.deletePost(id);
            setPosts(prev => prev.filter(p => p.id !== id));
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Post Deleted',
                message: 'The blog post has been removed.'
            });
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handlePublish = async (post: BlogPost) => {
        try {
            const updated = await blogService.updatePost(post.id, {
                status: 'Published',
                publishedAt: new Date().toISOString()
            });
            setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Post Published',
                message: 'Your story is now live.'
            });
        } catch (error) {
            console.error('Publish failed:', error);
        }
    };

    return (
        <div className="space-y-8 pb-32">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Content Management</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Our <span className="text-indigo-600 italic">Journal</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500">Create compelling stories to engage your local audience and boost SEO performance.</p>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm hidden lg:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Published Count</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">{posts.filter(p => p.status === 'Published').length}</p>
                    </div>
                    <Link href="/blog/categories">
                        <button className="h-16 px-8 bg-white border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-[24px] transition-all hover:bg-slate-50 flex items-center justify-center gap-3">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Categories
                        </button>
                    </Link>
                    <Link href="/blog/new">
                        <button className="h-16 px-10 bg-indigo-600 hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[24px] transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Post
                        </button>
                    </Link>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Blog Title / Slug</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Author</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Published Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-[20px] mx-auto flex items-center justify-center">
                                                <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6l-2 3-2 3" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-black text-slate-900 tracking-tight italic">No posts found</p>
                                            <p className="text-sm font-medium text-slate-400">Start by creating your first blog post to share insights with your audience.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className="group hover:bg-slate-50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                {post.featuredImage ? (
                                                    <img src={post.featuredImage} className="w-12 h-12 rounded-xl object-cover shadow-md" alt="" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{post.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">/{post.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-slate-700">{post.author}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <PostStatusBadge status={post.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {post.publishedAt ? (
                                                <>
                                                    <p className="text-xs font-black text-slate-900">
                                                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                        {new Date(post.publishedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {post.status === 'Draft' && (
                                                    <button
                                                        onClick={() => handlePublish(post)}
                                                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                                                        title="Publish Now"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <Link href={`/blog/edit/${post.id}`}>
                                                    <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
