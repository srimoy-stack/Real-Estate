'use client';

import React from 'react';
import { Header } from './header';
import { LuxuryFooter } from './footer';

// Re-export for TemplateRenderer compatibility
export { Header } from './header';
export const Footer = LuxuryFooter;

export const TemplateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <LuxuryFooter />
    </div>
);
