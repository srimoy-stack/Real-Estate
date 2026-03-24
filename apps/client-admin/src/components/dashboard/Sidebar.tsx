'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
}

const SidebarItem = ({ href, label, icon, active, collapsed }: SidebarItemProps & { collapsed?: boolean }) => (
    <Link
        href={href as any}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
            : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
            } ${collapsed ? 'justify-center px-0' : ''}`}
        title={collapsed ? label : ''}
    >
        <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
            {icon}
        </span>
        {!collapsed && <span className="font-semibold text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>}
        {collapsed && active && (
            <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
        )}
    </Link>
);

export const Sidebar = ({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) => {
    const pathname = usePathname();

    const items = [
        {
            label: 'Overview',
            href: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            label: 'Branding',
            href: '/branding',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            )
        },
        {
            label: 'Leads',
            href: '/leads',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            label: 'MLS / DDF Settings',
            href: '/settings/ddf',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l0 3m0 0l-1-1m1 1l1-1" />
                </svg>
            )
        },
        {
            label: 'Listings',
            href: '/listings-settings',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            label: 'Templates',
            href: '/templates',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            )
        },
        {
            label: 'Shortcodes',
            href: '/shortcodes',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            )
        },
    ];

    const teamItems = [
        {
            label: 'Roster Review',
            href: '/team',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            label: 'Agent Profiles',
            href: '/team/agents',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        }
    ];

    const websiteItems = [
        {
            label: 'Organization Website',
            href: '/organization-website',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            label: 'Blog',
            href: '/blog',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6l-2 3-2 3" />
                </svg>
            )
        }
    ];


    return (
        <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
            {/* Collapse Toggle */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-10 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm z-50"
            >
                <svg className={`w-3 h-3 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Logo */}
            <div className={`p-8 ${collapsed ? 'p-4' : ''}`}>
                <Link href={'/dashboard' as any} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
                        RE
                    </div>
                    {!collapsed && <span className="text-xl font-black tracking-tight text-slate-900 uppercase whitespace-nowrap animate-in fade-in duration-300">Client Admin</span>}
                </Link>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 px-4 space-y-2 overflow-y-auto pt-4 shadow-inner ${collapsed ? 'px-2' : ''}`}>
                {!collapsed && <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 mt-6">Core Management</p>}
                {items.map((item) => (
                    <SidebarItem
                        key={item.href}
                        {...item}
                        active={pathname === item.href}
                        collapsed={collapsed}
                    />
                ))}

                {!collapsed && <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 mt-8">Team Presence</p>}
                {teamItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        {...item}
                        active={pathname === item.href}
                        collapsed={collapsed}
                    />
                ))}

                {!collapsed && <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 mt-8">Digital Ecosystem</p>}
                {websiteItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        {...item}
                        active={pathname === item.href}
                        collapsed={collapsed}
                    />
                ))}

                {!collapsed && <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 mt-8">Brokerage Site Architect</p>}
                <SidebarItem
                    href="/website-builder"
                    label="Website Builder"
                    active={pathname === '/website-builder'}
                    collapsed={collapsed}
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                />
                <SidebarItem
                    href="/website-builder/seo"
                    label="SEO & Meta"
                    active={pathname === '/website-builder/seo'}
                    collapsed={collapsed}
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                />
            </nav>

            {/* Footer / User */}
            <div className={`p-4 mt-auto ${collapsed ? 'p-2' : ''}`}>
                <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 transition-all ${collapsed ? 'p-2 justify-center' : ''}`}>
                    <div className="h-10 w-10 min-w-[40px] rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                        JD
                    </div>
                    {!collapsed && (
                        <div className="flex-1 overflow-hidden animate-in fade-in duration-300">
                            <p className="text-xs font-bold text-slate-900 truncate">John Doe</p>
                            <p className="text-[10px] text-slate-500 truncate">Brokerage Admin</p>
                        </div>
                    )}
                    {!collapsed && (
                        <Link href={'/settings' as any} className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        </aside>
    );
};
