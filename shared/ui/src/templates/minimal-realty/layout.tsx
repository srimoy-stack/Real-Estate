import React from 'react';
import Link from 'next/link';
import { useTemplate } from '../TemplateContext';

export const Header: React.FC = () => {
    const { navigation, onNavigate, organizationName, currentPageSlug } = useTemplate();

    const handleClick = (e: React.MouseEvent, slug: string) => {
        if (onNavigate) {
            e.preventDefault();
            onNavigate(slug);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white">
            <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" onClick={(e) => handleClick(e, '/')} className="text-lg font-light text-slate-900 tracking-wide">
                    {organizationName?.toLowerCase() || 'minimal'}<span className="font-bold">realty</span>
                </Link>
                <nav className="hidden md:flex items-center gap-8">
                    {navigation?.map((l: any, idx) => (
                        <Link
                            key={l.slug + idx}
                            href={l.slug}
                            onClick={(e) => handleClick(e, l.slug)}
                            className={`text-sm transition-colors ${currentPageSlug === l.slug ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="h-px bg-slate-100" />
        </header>
    );
};

export const Footer: React.FC = () => (
    <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                <div>
                    <span className="text-lg font-light text-slate-900 tracking-wide">minimal<span className="font-bold">realty</span></span>
                    <p className="text-slate-400 text-sm mt-4 leading-relaxed">Simple. Elegant. Effective. A different approach to real estate.</p>
                </div>
                <div>
                    <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4">Navigation</h4>
                    <div className="space-y-2">{['Properties', 'About', 'Contact', 'Journal'].map(l => <a key={l} href="#" className="block text-sm text-slate-500 hover:text-slate-900 transition-colors">{l}</a>)}</div>
                </div>
                <div>
                    <h4 className="text-xs text-slate-400 uppercase tracking-widest mb-4">Contact</h4>
                    <p className="text-sm text-slate-500">hello@minimalrealty.ca</p>
                    <p className="text-sm text-slate-500 mt-2">(416) 555-0200</p>
                </div>
            </div>
            <div className="h-px bg-slate-100 mb-8" />
            <p className="text-slate-300 text-xs text-center">© 2026 MinimalRealty</p>
        </div>
    </footer>
);

export const TemplateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
);
