'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTemplate } from '../TemplateContext';

interface HeaderProps {
    isEditor?: boolean;
    props?: Record<string, any>;
}

export const GlobalHeader: React.FC<HeaderProps> = ({ isEditor, props = {} }) => {
    const { navigation, currentPageSlug, onNavigate, organizationName, branding } = useTemplate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleClick = (e: React.MouseEvent, slug: string) => {
        if (onNavigate) {
            e.preventDefault();
            onNavigate(slug);
        }
    };

    const type = branding?.headerLayout || 'logo-left';
    const layout = (props.layout || type) as string;

    const style: string =
        (layout === 'header-v2') ? 'logo-center' :
            (layout === 'header-v3') ? 'minimal' :
                (layout === 'logo-center' ? 'logo-center' : (layout === 'minimal' ? 'minimal' : layout));

    const showHeaderButton = branding?.showHeaderButton !== false;
    const brandingExt = branding as Record<string, any> | undefined;
    const agentImage = props.agentImage || brandingExt?.agentImage;
    const phoneNumber = props.phoneNumber || brandingExt?.phoneNumber || '+1 206-741-0034';
    const emailAddress = props.emailAddress || brandingExt?.emailAddress || 'info@agency.com';

    // ─── Logo ───
    const Logo = ({ textColor = 'text-slate-900' }: { textColor?: string }) => (
        <Link href="/" onClick={(e) => handleClick(e, '/')} data-craft-handlers-skip className="flex items-center gap-3 flex-shrink-0">
            {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt={organizationName} data-craft-handlers-skip className="h-10 w-auto object-contain" />
            ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                    <span className="text-white font-black text-lg">{organizationName?.charAt(0) || 'M'}</span>
                </div>
            )}
            <span className={`text-xl font-black ${textColor} tracking-tighter`}>
                {organizationName || 'ModernRealty'}
            </span>
        </Link>
    );

    // ─── Inline Nav Links ───
    const NavLinks = ({ linkColor = 'text-slate-600', activeColor = 'text-indigo-600', hoverColor = 'hover:text-indigo-600' }: {
        linkColor?: string; activeColor?: string; hoverColor?: string;
    }) => (
        <nav className="hidden md:flex items-center gap-1">
            {navigation?.map((l: any, idx: number) => (
                <Link
                    key={l.slug + idx}
                    href={l.slug}
                    onClick={(e) => handleClick(e, l.slug)}
                    data-craft-handlers-skip
                    className={`px-4 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all ${currentPageSlug === l.slug
                        ? `${activeColor} bg-indigo-50`
                        : `${linkColor} ${hoverColor} hover:bg-slate-50`
                        }`}
                >
                    {l.label}
                </Link>
            ))}
        </nav>
    );

    // ─── Mobile Toggle ───
    const MobileToggle = ({ className = 'text-slate-600' }: { className?: string }) => (
        <button
            className={`md:hidden p-2 ${className}`}
            onClick={(e) => { e.stopPropagation(); setMobileOpen(!mobileOpen); }}
        >
            {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
        </button>
    );

    // ─── Mobile Dropdown Nav ───
    const MobileNav = ({ linkColor = 'text-slate-600', activeColor = 'text-indigo-600', bgColor = 'bg-white', borderColor = 'border-slate-100' }: any) => (
        mobileOpen ? (
            <div className={`md:hidden ${bgColor} border-t ${borderColor} py-4 animate-in slide-in-from-top-4 duration-300`}>
                <nav className="flex flex-col px-6 space-y-1">
                    {navigation?.map((l: any, idx: number) => (
                        <Link
                            key={l.slug + idx}
                            href={l.slug}
                            onClick={(e) => { setMobileOpen(false); handleClick(e, l.slug); }}
                            data-craft-handlers-skip
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${currentPageSlug === l.slug ? `${activeColor} bg-indigo-50` : `${linkColor}`}`}
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </div>
        ) : null
    );

    // ─── Editor hover overlay ───
    const EditorOverlay = () => isEditor ? (
        <div className="absolute inset-0 bg-indigo-500/0 group-hover/header:bg-indigo-500/5 transition-colors pointer-events-none border-2 border-transparent group-hover/header:border-indigo-500/20" />
    ) : null;

    const headerClick = () => { if (isEditor && (window as any).onHeaderClick) { (window as any).onHeaderClick(); } };

    // ════════════════════════════════════════════════════════════
    // VARIANT: top-bar
    // ════════════════════════════════════════════════════════════
    if (style === 'top-bar') {
        return (
            <header className="relative z-50">
                {/* Top info bar */}
                <div className="bg-slate-900 py-2 border-b border-white/5 hidden md:block">
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-4">
                            <span>{emailAddress}</span>
                            <span>{phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {['f', 't', 'in'].map(s => <span key={s} className="hover:text-white transition-colors cursor-pointer uppercase">{s}</span>)}
                        </div>
                    </div>
                </div>
                {/* Main nav bar */}
                <div
                    className="bg-white py-4 border-b border-slate-100 relative group/header transition-all shadow-sm"
                    onClick={headerClick}
                >
                    <EditorOverlay />
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                        <Logo />
                        <NavLinks />
                        <div className="flex items-center gap-4">
                            <span className="hidden lg:block text-[11px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-tighter border border-indigo-100/50">
                                Call: {phoneNumber}
                            </span>
                            <MobileToggle />
                        </div>
                    </div>
                </div>
                <MobileNav />
            </header>
        );
    }

    // ════════════════════════════════════════════════════════════
    // VARIANT: transparent (over hero)
    // ════════════════════════════════════════════════════════════
    if (style === 'transparent') {
        return (
            <header
                className="absolute top-0 left-0 right-0 z-50 transition-all cursor-pointer group/header h-24 flex items-center"
                onClick={headerClick}
            >
                <EditorOverlay />
                <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
                    <Logo textColor="text-white" />
                    <NavLinks linkColor="text-white/70" activeColor="text-white" hoverColor="hover:text-white" />
                    <div className="flex items-center gap-4">
                        <span className="hidden md:block text-sm font-medium text-white drop-shadow-md">{phoneNumber}</span>
                        {showHeaderButton && (
                            <button className="hidden md:block px-5 py-2 bg-white/15 backdrop-blur-sm text-white font-bold text-sm rounded-xl border border-white/20 hover:bg-white/25 transition-all">
                                {branding?.headerButtonText || 'Get Started'}
                            </button>
                        )}
                        <MobileToggle className="text-white" />
                    </div>
                </div>
                <MobileNav bgColor="bg-slate-900/90 backdrop-blur-xl" borderColor="border-white/10" linkColor="text-white/60" activeColor="text-white" />
            </header>
        );
    }

    // ════════════════════════════════════════════════════════════
    // VARIANT: sidebar (vertical nav panel)
    // ════════════════════════════════════════════════════════════
    if (style === 'sidebar') {
        // In editor: relative + in-flow so flex-row works. On live site: fixed full-height panel.
        const sidebarClasses = isEditor
            ? "relative flex-shrink-0 w-[220px] min-h-full z-40 bg-white border-r border-slate-100 py-10 flex flex-col items-center shadow-2xl"
            : "fixed top-0 bottom-0 left-0 w-[240px] z-50 bg-white border-r border-slate-100 py-10 flex flex-col items-center shadow-2xl";

        return (
            <>
                <aside
                    className={`${isEditor ? 'flex' : 'hidden lg:flex'} ${sidebarClasses} group/header transition-all`}
                    onClick={headerClick}
                >
                    <EditorOverlay />
                    <div className="mb-12 w-full px-8">
                        <Logo />
                    </div>

                    <div className="w-28 h-28 rounded-3xl bg-slate-50 overflow-hidden mb-10 shadow-xl border border-slate-100 group/photo relative flex-shrink-0">
                        {agentImage ? (
                            <img src={agentImage} alt={organizationName} className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                        )}
                    </div>

                    <nav className="flex flex-col items-center gap-2 w-full px-6 flex-1 overflow-y-auto custom-scrollbar">
                        {navigation?.map((l: any, idx: number) => (
                            <Link key={l.slug + idx} href={l.slug} onClick={(e) => handleClick(e, l.slug)}
                                className={`text-[12px] font-black uppercase tracking-widest py-3 px-6 w-full text-center transition-all rounded-2xl ${currentPageSlug === l.slug ? 'text-indigo-600 bg-indigo-50 border border-indigo-100/50' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto w-full px-8 text-center pt-8">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Inquiries</p>
                        <p className="text-sm text-indigo-800 font-black">{phoneNumber}</p>
                    </div>
                </aside>

                <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-100 h-20 flex items-center justify-between px-6">
                    <Logo />
                    <MobileToggle />
                </header>
                <MobileNav />
            </>
        );
    }

    // ════════════════════════════════════════════════════════════
    // VARIANT: clean-split
    // ════════════════════════════════════════════════════════════
    if (style === 'clean-split') {
        return (
            <header
                className={`${isEditor ? 'sticky top-0 shadow-sm' : 'sticky top-0'} z-50 bg-white border-b border-slate-100 transition-all cursor-pointer group/header`}
                onClick={headerClick}
            >
                <EditorOverlay />
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo />
                    <NavLinks />
                    <div className="flex items-center gap-4">
                        <span className="hidden md:block font-black text-indigo-600 tracking-tight text-sm">{phoneNumber}</span>
                        {showHeaderButton && (
                            <button className="hidden md:block px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                {branding?.headerButtonText || 'Get Started'}
                            </button>
                        )}
                        <MobileToggle />
                    </div>
                </div>
                <MobileNav />
            </header>
        );
    }

    // ════════════════════════════════════════════════════════════
    // VARIANT: nature-bar
    // ════════════════════════════════════════════════════════════
    if (style === 'nature-bar') {
        return (
            <header
                className={`${isEditor ? 'sticky top-0 shadow-sm' : 'sticky top-0'} z-50 bg-white/95 backdrop-blur-xl border-b border-emerald-100/60 transition-all cursor-pointer group/header`}
                onClick={headerClick}
            >
                <EditorOverlay />
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo />
                    <NavLinks linkColor="text-emerald-800/60" activeColor="text-emerald-700" hoverColor="hover:text-emerald-700" />
                    <div className="flex items-center justify-end gap-4">
                        <span className="hidden lg:block text-xs font-black text-emerald-700 uppercase tracking-widest">{phoneNumber}</span>
                        <button className="hidden sm:flex px-6 py-2.5 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.1em] rounded-full shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95">
                            Inquire
                        </button>
                        <MobileToggle className="text-emerald-700" />
                    </div>
                </div>
                <MobileNav bgColor="bg-emerald-50/95 backdrop-blur-xl" borderColor="border-emerald-100" linkColor="text-emerald-800/60" activeColor="text-emerald-700" />
            </header>
        );
    }

    // ════════════════════════════════════════════════════════════
    // DEFAULT: logo-left / logo-center / minimal
    // ════════════════════════════════════════════════════════════
    const normalizedStyle: 'logo-left' | 'logo-center' | 'minimal' =
        style === 'logo-center' ? 'logo-center' : (style === 'minimal' ? 'minimal' : 'logo-left');

    return (
        <header
            className={`${isEditor ? 'sticky top-0 shadow-xl' : 'sticky top-0'} z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all cursor-pointer group/header`}
            onClick={headerClick}
        >
            <EditorOverlay />
            <div className={`max-w-7xl mx-auto px-6 ${normalizedStyle === 'logo-center' ? 'py-4 flex flex-col items-center gap-4' : 'h-20 flex items-center justify-between'}`}>
                {normalizedStyle === 'logo-center' ? (
                    <>
                        <Logo />
                        <NavLinks />
                    </>
                ) : (
                    <>
                        <Logo />
                        <NavLinks />
                        <div className="flex items-center gap-3">
                            {showHeaderButton && (
                                <button className="hidden md:block px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-indigo-100 hover:bg-indigo-700">
                                    {branding?.headerButtonText || 'Get Started'}
                                </button>
                            )}
                            <MobileToggle />
                        </div>
                    </>
                )}
            </div>
            <MobileNav />
        </header>
    );
};
