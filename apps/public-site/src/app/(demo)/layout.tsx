import React from 'react';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="demo-mode min-h-screen bg-white">
            {children}
        </div>
    );
}
