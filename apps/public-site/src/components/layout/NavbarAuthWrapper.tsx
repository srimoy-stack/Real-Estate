'use client';

import React, { useState } from 'react';
import { Navbar, Button } from '@repo/ui';
import { useAuth } from '@repo/auth';
import { AuthModal } from './AuthModal';

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
                    <span className="text-sm font-bold text-slate-700 hidden lg:inline">
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
