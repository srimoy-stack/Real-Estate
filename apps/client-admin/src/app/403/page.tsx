'use client';

import React from 'react';
import { useAuthStore } from '@repo/auth';

export default function ForbiddenPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
            <h1 className="text-6xl font-bold text-red-500">403</h1>
            <h2 className="mt-4 text-2xl font-semibold">Access Denied</h2>
            <p className="mt-2 text-slate-600 text-center max-w-md">
                This area is reserved for brokerage and agent administrators. Please sign in with an authorized account.
            </p>
            <button
                onClick={() => {
                    useAuthStore.getState().logout();
                    window.location.href = '/login';
                }}
                className="mt-8 rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
            >
                Sign Out & Re-Authenticate
            </button>
        </div>
    );
}
