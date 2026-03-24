'use client';

import React from 'react';

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            {/* Icon */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner">
                <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                </svg>
            </div>

            {/* Text */}
            <h3 className="mb-2 text-xl font-bold text-gray-800">No Listings Found</h3>
            <p className="mb-6 max-w-sm text-center text-sm text-gray-500 leading-relaxed">
                We couldn&apos;t find any properties matching your criteria. Try adjusting your filters or search for a different location.
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-gray-400">Try:</span>
                {['Toronto', 'Vancouver', 'Calgary', 'Ottawa'].map((city) => (
                    <span
                        key={city}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 cursor-default"
                    >
                        {city}
                    </span>
                ))}
            </div>
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
                <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">Something went wrong</h3>
            <p className="mb-6 max-w-sm text-center text-sm text-gray-500">{message}</p>
            <button
                onClick={onRetry}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            >
                Try Again
            </button>
        </div>
    );
}
