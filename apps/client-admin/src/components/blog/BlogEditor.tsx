import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BlogPost, BlogCategory } from '@repo/types';
import { blogService, useNotificationStore } from '@repo/services';
import dynamic from 'next/dynamic';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-[32px]" />
});
import 'react-quill/dist/quill.snow.css';

interface BlogEditorProps {
    postId?: string;
}

export const BlogEditor = ({ postId }: BlogEditorProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(postId ? true : false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<BlogCategory[]>([]);

    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        author: 'John Doe',
        status: 'Draft',
        tags: [],
        featuredImage: '',
        seo: {
            metaTitle: '',
            metaDescription: '',
        }
    });

    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    }), []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cats = await blogService.getCategories('org-1');
                setCategories(cats);

                if (postId) {
                    const post = await blogService.getPostById(postId);
                    if (post) {
                        setFormData(post);
                    }
                }
            } catch (error) {
                console.error('Failed to load editor data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [postId]);

    const handleSave = async () => {
        if (!formData.title) return;
        setSaving(true);
        try {
            if (postId) {
                await blogService.updatePost(postId, formData);
            } else {
                await blogService.createPost({
                    ...formData,
                    tenantId: 'org-1',
                });
            }
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: postId ? 'Post Updated' : 'Post Created',
                message: 'Your changes have been saved.'
            });
            router.push('/blog');
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const generateSlug = () => {
        if (!formData.title) return;
        const slug = formData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setFormData({ ...formData, slug });
    };

    if (loading) {
        return <div className="p-8 animate-pulse text-slate-400">Loading editor...</div>;
    }

    return (
        <div className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            {postId ? 'Edit Entry' : 'New Story'}
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        {postId ? 'Refine' : 'Compose'} <span className="text-indigo-600 italic">Content</span>
                    </h1>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="h-16 px-8 bg-white border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-[24px] transition-all hover:bg-slate-50"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-16 px-10 bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[24px] transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : (postId ? 'Update Post' : 'Save as Draft')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/30 space-y-8">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Post Title</label>
                            <input
                                type="text"
                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[24px] text-xl font-black text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                placeholder="Enter a compelling title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                onBlur={generateSlug}
                            />
                        </div>

                        {/* Slug & Category ... (rest of the inputs) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">URL Slug</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs italic">/blog/</span>
                                    <input
                                        type="text"
                                        className="w-full pl-20 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-4 focus:ring-indigo-50 transition-all"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Short Excerpt</label>
                            <textarea
                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[24px] text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-50 transition-all outline-none min-h-[100px] resize-none"
                                placeholder="A brief summary for the blog grid..."
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            />
                        </div>

                        {/* Story Content - WYSIWYG */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Story Content</label>
                            <div className="quill-premium-wrapper">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                    modules={quillModules}
                                    className="bg-white rounded-[32px] overflow-hidden border border-slate-100"
                                />
                            </div>
                            <style jsx global>{`
                                .quill-premium-wrapper .ql-toolbar.ql-snow {
                                    border: none;
                                    background: #f8fafc;
                                    padding: 1rem 2rem;
                                    border-bottom: 1px solid #f1f5f9;
                                }
                                .quill-premium-wrapper .ql-container.ql-snow {
                                    border: none;
                                    min-height: 400px;
                                    font-family: inherit;
                                    font-size: 1rem;
                                }
                                .quill-premium-wrapper .ql-editor {
                                    padding: 2rem;
                                    color: #475569;
                                }
                                .quill-premium-wrapper .ql-editor.ql-blank::before {
                                    left: 2rem;
                                    color: #cbd5e1;
                                    font-style: normal;
                                }
                            `}</style>
                        </div>
                    </div>

                    {/* SEO Settings Integration */}
                    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/30 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Search Optimization</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Meta Title</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                    placeholder="SEO Title Override"
                                    value={formData.seo?.metaTitle}
                                    onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo!, metaTitle: e.target.value } })}
                                />
                                <p className="text-[10px] font-bold text-slate-400 px-1">{formData.seo?.metaTitle?.length || 0} / 60 characters</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Meta Description</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all outline-none min-h-[80px] resize-none"
                                    placeholder="The snippet shown in search results..."
                                    value={formData.seo?.metaDescription}
                                    onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo!, metaDescription: e.target.value } })}
                                />
                                <p className="text-[10px] font-bold text-slate-400 px-1">{formData.seo?.metaDescription?.length || 0} / 160 characters</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    {/* Publishing Card */}
                    <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-indigo-200/40 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Visibility Status</label>
                            <select
                                className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none cursor-pointer focus:bg-white/20 transition-all appearance-none"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="Draft" className="text-slate-900">Draft</option>
                                <option value="Published" className="text-slate-900">Published</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Featured Image URL</label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white placeholder:text-white/20 outline-none focus:bg-white/20 transition-all"
                                placeholder="Paste unsplash link..."
                                value={formData.featuredImage}
                                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                            />
                        </div>

                        {formData.featuredImage && (
                            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                                <img src={formData.featuredImage} className="w-full h-full object-cover" alt="Preview" />
                            </div>
                        )}
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Author Name</label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tags (Comma separated)</label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                placeholder="Market, Tips, Luxury..."
                                value={formData.tags?.join(', ')}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
