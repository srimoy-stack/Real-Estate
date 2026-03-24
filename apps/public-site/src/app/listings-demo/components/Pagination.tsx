'use client';

import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function Pagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    isLoading,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxPagesToShow - 1);

            if (end === totalPages) {
                start = Math.max(1, end - maxPagesToShow + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <nav className="mt-12 flex items-center justify-center gap-1 sm:gap-2 px-4 py-3" aria-label="Pagination">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 border border-gray-100 shadow-sm transition-all hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed group"
            >
                <span className="sr-only">Previous Page</span>
                <svg className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 sm:gap-2">
                {pages[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={isLoading}
                            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-gray-600 border border-gray-100 transition-all hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                        >
                            1
                        </button>
                        {pages[0] > 2 && <span className="hidden sm:inline text-gray-400 px-1">...</span>}
                    </>
                )}

                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        disabled={isLoading}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage === page
                                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-emerald-200 scale-105'
                                : 'bg-white text-gray-600 border border-gray-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {pages[pages.length - 1] < totalPages && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && <span className="hidden sm:inline text-gray-400 px-1">...</span>}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={isLoading}
                            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-gray-600 border border-gray-100 transition-all hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 border border-gray-100 shadow-sm transition-all hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed group"
            >
                <span className="sr-only">Next Page</span>
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </nav>
    );
}
