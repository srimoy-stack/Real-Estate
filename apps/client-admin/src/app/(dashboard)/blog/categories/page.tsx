'use client';

import React, { useState, useEffect } from 'react';
import { BlogCategory } from '@repo/types';
import { blogService, useNotificationStore } from '@repo/services';
import Link from 'next/link';

export default function BlogCategoriesPage() {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await blogService.getCategories('org-1');
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setSaving(true);
        try {
            await blogService.createCategory({
                name: newCategoryName,
                slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
                tenantId: 'org-1'
            });
            setNewCategoryName('');
            fetchCategories();
            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Category Created',
                message: `"${newCategoryName}" has been added.`
            });
        } catch (error) {
            console.error('Create failed:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-12 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Link href="/blog" className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Taxonomy</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                        Blog <span className="text-indigo-600 italic">Categories</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Create New */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-indigo-200/40 space-y-6">
                        <h3 className="text-xl font-black text-white tracking-tight">Add New <span className="text-indigo-400 italic">Category</span></h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Category Name</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white placeholder:text-white/20 outline-none focus:bg-white/20 transition-all font-bold"
                                    placeholder="e.g. Market Trends"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full h-14 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl disabled:opacity-50"
                            >
                                {saving ? 'Adding...' : 'Add Category'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={2} className="px-8 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="px-8 py-12 text-center text-slate-400 font-medium">No categories created.</td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="group hover:bg-slate-50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                                    <span className="text-sm font-black text-slate-900">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-600 transition-colors">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
