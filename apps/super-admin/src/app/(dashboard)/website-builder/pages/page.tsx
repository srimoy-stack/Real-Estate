'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { CustomPage } from '@repo/types';

const mockPages: CustomPage[] = [
    { id: 'pg-001', title: 'About Our Team', slug: 'about-us', isPublished: true, tenantId: 't-1', blocks: [], seo: { title: 'About Our Team', description: 'Learn about our team.' }, sortOrder: 0, createdAt: '', updatedAt: '' },
    { id: 'pg-002', title: 'Sustainable Housing', slug: 'sustainability', isPublished: false, tenantId: 't-1', blocks: [], seo: { title: 'Sustainable Housing', description: 'Our sustainability initiatives.' }, sortOrder: 1, createdAt: '', updatedAt: '' },
];

export default function PagesManager() {
    const router = useRouter();
    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Content Studio</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                        Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 italic">Pages</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Create dedicated landing pages for neighborhoods, specialized services, or market reports.
                    </p>
                </div>
                <button className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-indigo-600 transition-all shadow-xl flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    New Custom Page
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mockPages.map(page => (
                    <div key={page.id} className="group p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-2xl transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${page.isPublished ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}>
                                {page.isPublished ? 'Live' : 'Draft'}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all sm:block hidden">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 uppercase tracking-tight">{page.title}</h3>
                        <p className="text-sm font-bold text-slate-400 mb-8 italic">URL: /pages/{page.slug}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/website-builder/pages/${page.id}` as Route)}
                                className="flex-1 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all font-inter"
                            >
                                Edit Builder
                            </button>
                            <button className="px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
