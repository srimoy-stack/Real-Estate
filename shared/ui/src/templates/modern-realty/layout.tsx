import React from 'react';
import Link from 'next/link';
import { useTemplate } from '../TemplateContext';

export const Header: React.FC = () => {
    const { navigation, onNavigate, organizationName, currentPageSlug } = useTemplate();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [mobileExpandedIdx, setMobileExpandedIdx] = React.useState<number | null>(null);

    const handleClick = (e: React.MouseEvent, slug: string) => {
        if (onNavigate) {
            e.preventDefault();
            onNavigate(slug);
        }
        setMobileOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" onClick={(e) => handleClick(e, '/')} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-black text-lg">{organizationName?.charAt(0) || 'M'}</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">
                        {organizationName || 'ModernRealty'}
                    </span>
                </Link>

                {/* ─── Desktop Navigation ─── */}
                <nav className="hidden md:flex items-center gap-8">
                    {navigation?.map((l: any, idx: number) => {
                        const children = l.children as { label: string; slug: string }[] | undefined;
                        const hasChildren = children && children.length > 0;

                        if (!hasChildren) {
                            // Normal link — unchanged from original behavior
                            return (
                                <Link
                                    key={l.slug + idx}
                                    href={l.slug}
                                    onClick={(e) => handleClick(e, l.slug)}
                                    className={`text-sm font-semibold transition-colors ${currentPageSlug === l.slug ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                                >
                                    {l.label}
                                </Link>
                            );
                        }

                        // Dropdown parent
                        return (
                            <div key={l.slug + idx} className="relative group">
                                <Link
                                    href={l.slug}
                                    onClick={(e) => handleClick(e, l.slug)}
                                    className={`text-sm font-semibold transition-colors flex items-center gap-1 ${currentPageSlug === l.slug ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                                >
                                    {l.label}
                                    <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-all group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </Link>
                                {/* Dropdown */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out">
                                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 py-2 min-w-[200px] overflow-hidden">
                                        {children!.map((child, ci) => (
                                            <Link
                                                key={child.slug + ci}
                                                href={child.slug}
                                                onClick={(e) => handleClick(e, child.slug)}
                                                className="block px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-4">
                    <button className="hidden md:block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200 text-nowrap">Get Started</button>
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* ─── Mobile Navigation ─── */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-1 shadow-lg">
                    {navigation?.map((l: any, idx: number) => {
                        const children = l.children as { label: string; slug: string }[] | undefined;
                        const hasChildren = children && children.length > 0;
                        const isExpanded = mobileExpandedIdx === idx;

                        return (
                            <div key={l.slug + idx}>
                                <div className="flex items-center justify-between">
                                    <Link
                                        href={l.slug}
                                        onClick={(e) => handleClick(e, l.slug)}
                                        className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${currentPageSlug === l.slug ? 'text-indigo-600' : 'text-slate-700'}`}
                                    >
                                        {l.label}
                                    </Link>
                                    {hasChildren && (
                                        <button
                                            onClick={() => setMobileExpandedIdx(isExpanded ? null : idx)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                    )}
                                </div>
                                {hasChildren && isExpanded && (
                                    <div className="pl-4 border-l-2 border-indigo-100 ml-2 mb-2 space-y-0.5">
                                        {children!.map((child, ci) => (
                                            <Link
                                                key={child.slug + ci}
                                                href={child.slug}
                                                onClick={(e) => handleClick(e, child.slug)}
                                                className="block py-2 pl-3 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="pt-3 border-t border-slate-100">
                        <button className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200">Get Started</button>
                    </div>
                </div>
            )}
        </header>
    );
};

export const Footer: React.FC = () => (
    <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div>
                    <span className="text-2xl font-black tracking-tighter">Modern<span className="text-indigo-400">Realty</span></span>
                    <p className="text-slate-400 text-sm mt-4 leading-relaxed">Transforming the way you discover and experience real estate.</p>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Company</h4>
                    <div className="space-y-3">{['About Us', 'Careers', 'Press'].map(i => <a key={i} href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">{i}</a>)}</div>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Properties</h4>
                    <div className="space-y-3">{['Buy', 'Sell', 'Rent', 'New Developments'].map(i => <a key={i} href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">{i}</a>)}</div>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Contact</h4>
                    <p className="text-sm text-slate-400">100 King St W, Toronto</p>
                    <p className="text-sm text-slate-400 mt-2">(416) 555-0100</p>
                    <p className="text-sm text-slate-400 mt-2">hello@modernrealty.ca</p>
                </div>
            </div>
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-xs">© 2026 ModernRealty. All rights reserved.</p>
                <div className="flex gap-6">{['Privacy', 'Terms', 'Cookies'].map(i => <a key={i} href="#" className="text-slate-500 hover:text-white text-xs transition-colors">{i}</a>)}</div>
            </div>
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
