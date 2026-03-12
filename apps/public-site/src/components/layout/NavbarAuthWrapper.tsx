'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Button, AuthModal } from '@repo/ui';
import { useAuth } from '@repo/auth';

interface NavbarAuthWrapperProps {
    brand: string;
    items: { label: string; href: string }[];
}

export const NavbarAuthWrapper: React.FC<NavbarAuthWrapperProps> = ({ brand, items }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    const openLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    };

    const openRegister = () => {
        setAuthMode('register');
        setIsAuthModalOpen(true);
    };

    const rightContent = (
        <div className="flex items-center gap-3">
            {isAuthenticated ? (
                <>
                    <Link href="/dashboard" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all px-4">
                        Dashboard
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 hidden lg:inline border-l border-slate-200 pl-4 py-1">
                        Hi, {user?.name.split(' ')[0]}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => logout()}>
                        Sign Out
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="ghost" size="sm" onClick={openLogin}>
                        Sign In
                    </Button>
                    <Button variant="primary" size="sm" onClick={openRegister}>
                        Get Started
                    </Button>
                </>
            )}
        </div>
    );

    return (
        <>
            <Navbar brand={brand} items={items} rightContent={rightContent} />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </>
    );
};
