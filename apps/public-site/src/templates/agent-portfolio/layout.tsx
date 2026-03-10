'use client';

import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

// Re-export for TemplateRenderer compatibility
export { Header } from './header';
export { Footer } from './footer';

export const TemplateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-white antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
);
