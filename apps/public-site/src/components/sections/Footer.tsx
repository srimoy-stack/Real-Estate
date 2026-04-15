import React from 'react';
import Link from 'next/link';
import { getWebsiteFromHeaders } from '../../lib/tenant/getWebsiteFromHeaders';

export const Footer = () => {
    const website = getWebsiteFromHeaders() as any;
    const brandName = website?.brandName || 'SquareFT';

    const cityGroups = [
        { name: 'Toronto, ON', slug: 'toronto' },
        { name: 'Vancouver, BC', slug: 'vancouver' },
        { name: 'Montreal, QC', slug: 'montreal' },
        { name: 'Calgary, AB', slug: 'calgary' },
        { name: 'Ottawa, ON', slug: 'ottawa' },
        { name: 'Mississauga, ON', slug: 'mississauga' },
        { name: 'Brampton, ON', slug: 'brampton' },
        { name: 'Hamilton, ON', slug: 'hamilton' },
        { name: 'Winnipeg, MB', slug: 'winnipeg' },
        { name: 'Edmonton, AB', slug: 'edmonton' },
    ];

    const pages = [
        { label: 'Buy a Home', href: '/listings' },
        { label: 'Sell Property', href: '/sell' },
        { label: 'Market Search', href: '/search' },
        { label: 'Map Explorer', href: '/map-search' },
        { label: 'News & Insights', href: '/blog' },
        { label: 'Get in Touch', href: '/contact' },
    ];

    return (
        <footer className="relative bg-white pt-16 pb-12 border-t border-slate-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="space-y-4">
                            <Link href="/" className="inline-block group">
                                <div className="h-10 flex items-center">
                                    <img
                                        src="/logo.png"
                                        alt={brandName}
                                        className="h-full w-auto object-contain transition-all duration-500"
                                    />
                                </div>
                            </Link>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
                                Redefining the Canadian real estate experience through elite brokerage services, live market intelligence, and uncompromising local expertise.
                            </p>
                        </div>

                        {/* Social Links - Fixed Row */}
                        <div className="flex items-center gap-3">
                            {[
                                { id: 'fb', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                                { id: 'tw', path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' },
                                { id: 'ig', path: 'M16 3H8C5.24 3 3 5.24 3 8v8c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5V8c0-2.76-2.24-5-5-5zm-4 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm5-7.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z' },
                                { id: 'ln', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4' }
                            ].map((social) => (
                                <a 
                                    key={social.id} 
                                    href="#" 
                                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-red hover:border-brand-red hover:bg-brand-red/5 transition-all duration-300"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={social.path}></path>
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
                        
                        {/* Communities */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Locations</h4>
                            <ul className="grid grid-cols-1 gap-3">
                                {cityGroups.slice(0, 6).map((city) => (
                                    <li key={city.slug}>
                                        <Link 
                                            href={`/communities/${city.slug}`} 
                                            className="text-slate-600 hover:text-brand-red text-sm font-semibold transition-all duration-200"
                                        >
                                            {city.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Navigation */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Company</h4>
                            <ul className="space-y-3">
                                {pages.map((page) => (
                                    <li key={page.href}>
                                        <Link 
                                            href={page.href} 
                                            className="text-slate-600 hover:text-brand-red text-sm font-semibold transition-all duration-200"
                                        >
                                            {page.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Concierge Card - Clean & Organized */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Support</h4>
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Direct Line</p>
                                    <a href="tel:+18005550199" className="text-slate-900 text-sm font-black hover:text-brand-red transition-colors">
                                        1-800-555-0199
                                    </a>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                    <a href="mailto:hello@squareft.ca" className="text-slate-900 text-sm font-black hover:text-brand-red transition-colors">
                                        hello@squareft.ca
                                    </a>
                                </div>
                                <button className="w-full py-3 bg-slate-900 hover:bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                                    Send Inquiry
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
};
