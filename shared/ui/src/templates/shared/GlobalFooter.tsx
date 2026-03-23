'use client';

import React from 'react';
import Link from 'next/link';
import { useTemplate } from '../TemplateContext';

interface FooterProps {
    isEditor?: boolean;
    props?: Record<string, any>;
}

export const GlobalFooter: React.FC<FooterProps> = ({ isEditor, props = {} }) => {
    const { navigation, onNavigate, organizationName } = useTemplate();
    const type = props.layout || 'footer-v1';

    const handleClick = (e: React.MouseEvent, slug: string) => {
        if (isEditor) {
            e.preventDefault();
            onNavigate?.(slug);
        }
    };

    const renderV1 = () => (
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                            {organizationName?.charAt(0) || 'M'}
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">{organizationName || 'ModernRealty'}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Redefining the real estate experience with modern technology and unparalleled service.
                    </p>
                </div>
                <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Quick Links</h4>
                    <ul className="space-y-4">
                        {navigation?.slice(0, 5).map((l: any) => (
                            <li key={l.slug}>
                                <Link
                                    href={l.slug}
                                    onClick={(e) => handleClick(e, l.slug)}
                                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                                >
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Discovery</h4>
                    <ul className="space-y-4">
                        {['New Listings', 'Luxury Collections', 'Market Reports', 'Neighborhoods'].map(item => (
                            <li key={item}>
                                <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6">Contact</h4>
                    <ul className="space-y-4">
                        <li className="text-sm text-slate-500 flex items-center gap-3">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            123 Realty Way, Suite 100
                        </li>
                        <li className="text-sm text-slate-500 flex items-center gap-3">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            hello@modernrealty.com
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 {organizationName}. All rights reserved.</p>
                <div className="flex gap-8">
                    {['Privacy', 'Terms', 'Sitemap'].map(item => (
                        <a key={item} href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">{item}</a>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderV2 = () => (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-8">
            <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white font-black text-[10px]">
                    {organizationName?.charAt(0) || 'M'}
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tighter uppercase">{organizationName}</span>
            </div>
            <div className="flex gap-6">
                {navigation?.slice(0, 4).map((l: any) => (
                    <Link
                        key={l.slug}
                        href={l.slug}
                        onClick={(e) => handleClick(e, l.slug)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600"
                    >
                        {l.label}
                    </Link>
                ))}
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">© 2026 {organizationName}</p>
        </div>
    );

    const renderV3 = () => (
        <div className="bg-[#0f1115] text-white">
            <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
                {/* Top Section: Area Lists */}
                <div className="mb-16">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">Area Collections</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-4">
                        {['Arvada Real Estate', 'Capitol Hill Real Estate', 'Central Park Real Estate', 'Cherry Creek Real Estate', 'Denver Real Estate', 'Bellarla Real Estate', 'Dwell Nona Real Estate', 'Carriage Hill Real Estate', 'Cloverlawn Real Estate', 'Forest Hills Real Estate', 'Fontana Real Estate', 'Isleworth Real Estate', 'Keenes Pointe Real Estate', 'Lakeshore Real Estate', 'Lakeview Park Real Estate'].map(item => (
                            <a key={item} href="#" className="text-[11px] text-white/50 hover:text-white flex items-center gap-2 transition-colors">
                                <span className="h-1 w-1 rounded-full bg-white/20" /> {item}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-12 border-t border-white/5">
                    <div className="space-y-6">
                        <h4 className="text-sm font-black tracking-tighter uppercase">{organizationName}</h4>
                        <p className="text-white/40 text-[11px] leading-relaxed max-w-xs">
                            Dedicated to delivering a high level of expertise, customer service, and attention to detail to the marketing and sales of luxury real estate and rental properties.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8">Contact Info</h4>
                        <div className="space-y-4 text-[11px] text-white/60">
                            <p className="flex items-start gap-3">
                                <svg className="w-3.5 h-3.5 mt-0.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                3755 Commercial St SE Salem, OR
                            </p>
                            <p className="flex items-center gap-3">
                                <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                (305) 555-4446
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8">Quick Links</h4>
                        <div className="flex flex-col gap-3 text-[11px] text-white/60">
                            {navigation?.map((l: any) => (
                                <Link key={l.slug} href={l.slug} onClick={(e) => handleClick(e, l.slug)} className="hover:text-white transition-colors">
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8">Social Connect</h4>
                        <div className="flex flex-wrap gap-2">
                            {['F', 'I', 'X', 'L', 'T'].map(icon => (
                                <div key={icon} className="h-8 w-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] font-black hover:bg-white hover:text-black transition-all cursor-pointer">
                                    {icon}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Bottom Bar */}
            <div className="border-t border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[9px] font-bold text-white/30 uppercase tracking-widest">
                    <p>Copyright © 2026 {organizationName}. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Documentation</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderV4 = () => (
        <div className="bg-[#050b1a] text-white">
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {/* Contact & Socials */}
                    <div className="space-y-8">
                        <h4 className="text-sm font-black uppercase tracking-widest">Contact Us</h4>
                        <div className="space-y-5 text-sm text-white/60 leading-relaxed font-medium">
                            <p className="flex items-start gap-4">
                                <svg className="w-5 h-5 mt-1 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                3755 Commercial St SE Salem, Corner with Sunny Boulevard, 3755 Commercial OR 97302
                            </p>
                            <p className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer">
                                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                (305) 555-4446
                            </p>
                            <p className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer text-indigo-400">
                                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                yourmails@gmail.com
                            </p>
                        </div>
                        <div className="flex gap-2.5">
                            {['f', 't', 'i', 'x', 'l'].map(s => (
                                <div key={s} className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 hover:-translate-y-1 transition-all cursor-pointer border border-white/5">
                                    <span className="uppercase font-black text-xs text-white/50">{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lists by Category */}
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest mb-10">Lists by Category</h4>
                        <div className="space-y-4">
                            {[
                                { name: 'Apartments', count: 17 },
                                { name: 'Condos', count: 8 },
                                { name: 'Houses', count: 5 },
                                { name: 'Industrial', count: 1 },
                                { name: 'Land', count: 1 },
                                { name: 'Offices', count: 2 },
                                { name: 'Retail', count: 4 },
                                { name: 'Villas', count: 4 }
                            ].map(cat => (
                                <div key={cat.name} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-3">
                                    <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{cat.name}</span>
                                    <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded text-white/40 group-hover:bg-indigo-600 group-hover:text-white transition-all">({cat.count})</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Latest Properties Grid */}
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest mb-10">Latest Properties</h4>
                        <div className="space-y-6">
                            {[
                                { title: 'Luxury House in Greenville', price: '$860,000', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=200' },
                                { title: 'Modern Condo for Sale', price: '$150,000', img: 'https://images.unsplash.com/photo-1600585154340-be6199f7e009?auto=format&fit=crop&q=80&w=200' },
                                { title: 'Apartment with Subunits', price: '$999 / month', img: 'https://images.unsplash.com/photo-1600607687940-47a0f925901e?auto=format&fit=crop&q=80&w=200' }
                            ].map((prop, i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="h-16 w-24 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                                        <img src={prop.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-[13px] font-bold text-white/80 leading-tight group-hover:text-white transition-colors">{prop.title}</h5>
                                        <p className="text-[11px] font-black text-indigo-400 mt-1">{prop.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    <p>© 2026 {organizationName}. All Rights Reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Sitemap</a>
                    </div>
                </div>
            </div>
        </div>
    );

    const getLayout = () => {
        switch (type) {
            case 'footer-v2': return renderV2();
            case 'footer-v3': return renderV3();
            case 'footer-v4': return renderV4();
            default: return renderV1();
        }
    };

    return (
        <footer
            className={`${type === 'footer-v3' ? 'bg-[#0f1115]' : type === 'footer-v4' ? 'bg-[#050b1a]' : 'bg-white'} border-t border-slate-100 cursor-pointer group/footer relative shadow-2xl`}
            onClick={() => {
                if (isEditor && (window as any).onFooterClick) {
                    (window as any).onFooterClick();
                }
            }}
        >
            {isEditor && (
                <div className="absolute inset-0 bg-emerald-500/0 group-hover/footer:bg-emerald-500/5 transition-colors pointer-events-none border-2 border-transparent group-hover/footer:border-emerald-500/20" />
            )}
            {getLayout()}
        </footer>
    );
};
