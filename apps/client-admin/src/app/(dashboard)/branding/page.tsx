'use client';

import React, { useState } from 'react';
import { useNotificationStore } from '@repo/services';

interface BrandingFormState {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    companyName: string;
    tagline: string;
    headerFont: string;
    bodyFont: string;
    social: {
        facebook: string;
        instagram: string;
        twitter: string;
        linkedin: string;
    };
    officeLocations: {
        address: string;
        city: string;
        phone: string;
        email: string;
    }[];
}

export default function BrandingPage() {
    const [form, setForm] = useState<BrandingFormState>({
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        logoUrl: '',
        faviconUrl: '',
        companyName: 'Prestige Realty',
        tagline: 'Luxury Living, Redefined',
        headerFont: 'Inter',
        bodyFont: 'Inter',
        social: {
            facebook: 'https://facebook.com/prestigerealty',
            instagram: 'https://instagram.com/prestigerealty',
            twitter: 'https://twitter.com/prestigerealty',
            linkedin: 'https://linkedin.com/company/prestigerealty',
        },
        officeLocations: [
            {
                address: '123 Luxury Ave',
                city: 'Beverly Hills, CA',
                phone: '+1 (555) 123-4567',
                email: 'contact@prestigerealty.com'
            }
        ]
    });
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        // Validation
        if (!form.companyName.trim()) {
            setError('Company Name is required');
            return;
        }
        if (!form.primaryColor || !form.secondaryColor) {
            setError('Brand colors are required');
            return;
        }

        setError(null);
        setIsSaving(true);

        // Simulate API saving and public site invalidation
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);

            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Branding Saved',
                message: 'Your website branding has been updated and published.'
            });

            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="h-1 w-8 bg-indigo-600 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Brand Identity</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                    Website <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Branding</span>
                </h1>
                <p className="text-lg text-slate-600 font-medium max-w-2xl">
                    Customize how your public-facing real estate website looks and feels. Changes here will be reflected on your live site.
                </p>
            </div>

            {/* Live Preview Card */}
            <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Live Preview</h3>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-6 min-h-[180px]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: form.primaryColor }}>
                            {form.companyName.split(' ').map(w => w[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-lg" style={{ fontFamily: form.headerFont }}>{form.companyName}</p>
                            <p className="text-xs text-slate-500" style={{ fontFamily: form.bodyFont }}>{form.tagline}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <span className="px-5 py-2 rounded-xl text-slate-900 text-xs font-bold" style={{ backgroundColor: form.primaryColor }}>Primary CTA</span>
                        <span className="px-5 py-2 rounded-xl text-slate-900 text-xs font-bold" style={{ backgroundColor: form.secondaryColor }}>Secondary CTA</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Company Identity */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Company Identity</h3>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Company Name</span>
                            <input
                                type="text"
                                value={form.companyName}
                                onChange={e => setForm({ ...form, companyName: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tagline</span>
                            <input
                                type="text"
                                value={form.tagline}
                                onChange={e => setForm({ ...form, tagline: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </label>
                    </div>

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Logo URL</span>
                            <input
                                type="text"
                                value={form.logoUrl}
                                onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                                placeholder="https://example.com/logo.png"
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Favicon URL</span>
                            <input
                                type="text"
                                value={form.faviconUrl}
                                onChange={e => setForm({ ...form, faviconUrl: e.target.value })}
                                placeholder="https://example.com/favicon.ico"
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
                            />
                        </label>
                    </div>
                </div>

                {/* Colors & Typography */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Colors & Typography</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Primary Color</span>
                            <div className="mt-2 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={form.primaryColor}
                                    onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                                    className="h-10 w-14 rounded-lg cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={form.primaryColor}
                                    onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Secondary Color</span>
                            <div className="mt-2 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={form.secondaryColor}
                                    onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                                    className="h-10 w-14 rounded-lg cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={form.secondaryColor}
                                    onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Heading Font</span>
                            <select
                                value={form.headerFont}
                                onChange={e => setForm({ ...form, headerFont: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="Inter">Inter</option>
                                <option value="Outfit">Outfit</option>
                                <option value="Playfair Display">Playfair Display</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Montserrat">Montserrat</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Body Font</span>
                            <select
                                value={form.bodyFont}
                                onChange={e => setForm({ ...form, bodyFont: e.target.value })}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="Inter">Inter</option>
                                <option value="Outfit">Outfit</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Open Sans">Open Sans</option>
                                <option value="Lato">Lato</option>
                            </select>
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Social Links */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Social Links</h3>
                    <div className="space-y-4">
                        {['facebook', 'instagram', 'twitter', 'linkedin'].map((network) => (
                            <label key={network} className="block">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{network} URL</span>
                                <input
                                    type="url"
                                    value={form.social[network as keyof typeof form.social]}
                                    onChange={e => setForm({
                                        ...form,
                                        social: { ...form.social, [network]: e.target.value }
                                    })}
                                    placeholder={`https://${network}.com/yourpage`}
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Office Locations */}
                <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Office Locations</h3>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
                            + Add Office
                        </button>
                    </div>

                    <div className="space-y-6">
                        {form.officeLocations.map((office, idx) => (
                            <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 relative group">
                                <button className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Office Address & City</span>
                                        <input
                                            type="text"
                                            value={`${office.address}, ${office.city}`}
                                            onChange={() => { }}
                                            placeholder="123 Luxury Ave, Beverly Hills, CA"
                                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone</span>
                                            <input
                                                type="text"
                                                value={office.phone}
                                                onChange={() => { }}
                                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</span>
                                            <input
                                                type="email"
                                                value={office.email}
                                                onChange={() => { }}
                                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Action */}
            <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex-1 flex gap-4 items-center">
                    {/* Notice for Team Management since it was in PRD for Module 1 */}
                    <p className="text-sm font-medium text-slate-500 flex-1">
                        Looking for team management? <a href="/team" className="text-indigo-600 font-bold hover:underline">Manage your team members and roles here</a>.
                    </p>

                    {error && (
                        <span className="text-sm font-bold text-red-500 animate-in fade-in">
                            {error}
                        </span>
                    )}
                    {saved && (
                        <span className="text-sm font-bold text-emerald-500 animate-in fade-in">
                            ✓ Branding saved successfully & applied to live site
                        </span>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-2xl ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'} text-white font-bold text-sm transition-all flex items-center gap-2`}
                >
                    {isSaving ? 'Publishing...' : 'Publish Changes'}
                </button>
            </div>
        </div>
    );
}
