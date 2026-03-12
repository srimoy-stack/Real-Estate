'use client';

import React, { useState, useMemo } from 'react';
import { PLATFORM_TEMPLATES } from '@/data/templates';
import type { Template } from '@repo/types';
import { AssignTemplateModal } from '@/components/AssignTemplateModal';
import { TemplatePreviewPopup } from '@/components/TemplatePreviewPopup';


// ─── Section Badge Colors ──────────────────────────
const sectionColors: Record<string, string> = {
    hero: 'bg-violet-50 text-violet-700 border-violet-200',
    listings: 'bg-sky-50 text-sky-700 border-sky-200',
    about: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    communities: 'bg-amber-50 text-amber-700 border-amber-200',
    testimonials: 'bg-rose-50 text-rose-700 border-rose-200',
    blog: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    contact: 'bg-teal-50 text-teal-700 border-teal-200',
    footer: 'bg-slate-100 text-slate-600 border-slate-200',
};

// ─── Section Icons ─────────────────────────────────
const sectionIcons: Record<string, string> = {
    hero: '🏠',
    listings: '📋',
    about: 'ℹ️',
    communities: '🏘️',
    testimonials: '💬',
    blog: '📝',
    contact: '📞',
    footer: '🔗',
};

function TemplateCard({ template, onAssign, onPreview }: { template: Template; onAssign: (tpl: Template) => void, onPreview: (key: string) => void }) {

    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="group relative rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 overflow-hidden flex flex-col">
            {/* Preview Image Container */}
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                {/* Skeleton shimmer */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
                )}
                <img
                    src={template.previewImage}
                    alt={`${template.templateName} preview`}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Status badge */}
                <div className="absolute top-4 right-4">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${template.isActive
                        ? 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30'
                        : 'bg-rose-400/20 text-rose-100 border-rose-400/30'
                        }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${template.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        {template.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>

                {/* Hover Preview Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                        onClick={() => onPreview(template.templateKey)}
                        className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2.5 border border-white/20"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Quick Preview
                    </button>
                </div>
            </div>

            {/* Card Body */}
            <div className="flex-1 p-6 flex flex-col">
                {/* Template Name & Key */}
                <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {template.templateName}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 inline-block">
                        {template.templateKey}
                    </span>
                </div>

                {/* Sections */}
                <div className="mb-5 flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Sections</p>
                    <div className="flex flex-wrap gap-1.5">
                        {template.sections.map((section) => (
                            <span
                                key={section}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize border ${sectionColors[section] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
                            >
                                <span className="text-xs">{sectionIcons[section]}</span>
                                {section}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 mb-5">
                    <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Created</span>
                        <span className="text-xs font-semibold text-slate-600">{new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div>
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Updated</span>
                        <span className="text-xs font-semibold text-slate-600">{new Date(template.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-1 mt-auto">
                    <button
                        onClick={() => onPreview(template.templateKey)}
                        className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => onAssign(template)}
                        className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center transition-all duration-300 shadow-lg shadow-indigo-100/50 flex items-center justify-center gap-2"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        Assign
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function TemplatesPage() {
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [assigningTemplate, setAssigningTemplate] = useState<Template | null>(null);
    const [quickPreviewKey, setQuickPreviewKey] = useState<string | null>(null);


    const filteredTemplates = useMemo(() => {
        return PLATFORM_TEMPLATES.filter((tpl) => {
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && tpl.isActive) ||
                (filterStatus === 'inactive' && !tpl.isActive);
            const matchesSearch =
                searchQuery === '' ||
                tpl.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tpl.templateKey.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [filterStatus, searchQuery]);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Template <span className="text-indigo-600">Engine</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-sm ml-[52px]">
                        Pre-built website themes available across the platform. View and preview templates before assigning to organizations.
                    </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-8 bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm">
                        <div className="text-center">
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{PLATFORM_TEMPLATES.length}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-emerald-600 tracking-tighter">{PLATFORM_TEMPLATES.filter(t => t.isActive).length}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-rose-600 tracking-tighter">{PLATFORM_TEMPLATES.filter(t => !t.isActive).length}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inactive</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                {/* Search */}
                <div className="relative w-full sm:w-96">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                    {(['all', 'active', 'inactive'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${filterStatus === status
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No templates found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onAssign={setAssigningTemplate}
                            onPreview={setQuickPreviewKey}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {quickPreviewKey && (
                <TemplatePreviewPopup
                    templateKey={quickPreviewKey}
                    onClose={() => setQuickPreviewKey(null)}
                />
            )}

            {/* Modals */}
            {assigningTemplate && (
                <AssignTemplateModal
                    template={assigningTemplate}
                    onClose={() => setAssigningTemplate(null)}
                    onSuccess={() => {
                        setAssigningTemplate(null);
                        // In a real app we'd refresh the assignments or show a success toast
                    }}
                />
            )}
        </div>
    );
}
