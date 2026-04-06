'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { listingService } from '@repo/services';
import { Listing, ListingSectionFilters, ListingSortOrder } from '@repo/types';
import { UnifiedPropertyCard } from '@/components/ui';
import { useAuth } from '@repo/auth';
import { LeadCaptureModal } from '@/components/auth/LeadCaptureModal';

// ─── Types ─────────────────────────────────────────────
export interface ListingsSectionConfig {
    type: 'listings';
    filters: ListingSectionFilters;
    limit: number;
    sort: ListingSortOrder;
}

export interface ListingsSectionProps {
    /** Filter configuration (city, propertyType, status, minPrice, maxPrice, bedrooms, bathrooms) */
    filters?: ListingSectionFilters;
    /** Max listings to display */
    limit?: number;
    /** Sort order: 'latest' | 'price_asc' | 'price_desc' */
    sort?: ListingSortOrder;
    /** Optional section title */
    title?: string;
    /** Optional section subtitle */
    subtitle?: string;
    /** Show the "View All" link */
    showViewAll?: boolean;
    /** Custom "View All" URL */
    viewAllHref?: string;
    /** Custom CSS class */
    className?: string;
    /** Name of a managed shortcode configuration */
    configName?: string;
}

// ─── Component ─────────────────────────────────────────
export const ListingsSection: React.FC<ListingsSectionProps> = ({
    filters = {},
    limit = 6,
    sort = 'latest',
    title = 'Featured Listings',
    subtitle = 'Explore properties curated to match your criteria.',
    showViewAll = true,
    viewAllHref = '/listings',
    className = '',
    configName,
}) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isListingsLoading, setIsListingsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated, hasHydrated } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleAuthRequired = () => {
        setIsLoginModalOpen(true);
    };

    const sectionRef = useRef<HTMLElement>(null);

    // Memoize filter key to avoid unnecessary refetches
    const filterKey = useMemo(() => JSON.stringify({ configName, filters, limit, sort }), [configName, filters, limit, sort]);

    // ─── Scroll-based Gating Trigger ─────────────
    useEffect(() => {
        if (!isAuthenticated && hasHydrated && sectionRef.current) {
            let timer: NodeJS.Timeout;

            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    // Slight delay before popup
                    timer = setTimeout(() => {
                        setIsLoginModalOpen(true);
                    }, 800);
                } else {
                    clearTimeout(timer);
                }
            }, { threshold: 0.2 });

            observer.observe(sectionRef.current);

            return () => {
                observer.disconnect();
                clearTimeout(timer);
            };
        }
    }, [isAuthenticated, hasHydrated]);

    useEffect(() => {
        let cancelled = false;

        const fetchListings = async () => {
            try {
                setIsListingsLoading(true);
                setError(null);

                let results: Listing[] = [];

                if (configName) {
                    // ── Branch A: Managed Shortcode Config ─────────────
                    const params = new URLSearchParams();
                    // Inline filters override config - pass them as query params
                    if (filters.city) params.set('city', filters.city);
                    if (filters.propertyType) params.set('propertyType', String(filters.propertyType));
                    if (filters.status) params.set('status', String(filters.status));
                    if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
                    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
                    if (filters.bedrooms) params.set('bedrooms', String(filters.bedrooms));
                    if (filters.bathrooms) params.set('bathrooms', String(filters.bathrooms));
                    if (filters.province) params.set('province', String(filters.province));
                    if (limit) params.set('limit', String(limit));
                    if (sort) params.set('sort', String(sort));

                    const response = await fetch(`/api/shortcode/${configName}?${params.toString()}`);
                    const data = await response.json();
                    if (data.success) {
                        results = data.listings;
                    } else {
                        throw new Error(data.message || 'Config not found');
                    }
                } else {
                    // ── Branch B: Standard Search (Inline Only) ────────
                    results = await listingService.getBySectionConfig(
                        filters,
                        limit || 6,
                        sort || 'latest'
                    );
                }

                if (!cancelled) {
                    setListings(results);
                    setTotalCount(results.length);
                }
            } catch (err: any) {
                console.error('[ListingsSection] Failed to fetch listings:', err);
                if (!cancelled) {
                    setError('Unable to load listings. Please try again later.');
                }
            } finally {
                if (!cancelled) {
                    setIsListingsLoading(false);
                }
            }
        };

        fetchListings();

        return () => {
            cancelled = true;
        };
    }, [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Loading State ─────────────────────────────────
    if (isListingsLoading) {
        return (
            <section className={`py-20 bg-white overflow-hidden ${className}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header skeleton */}
                    <div className="mb-16 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-8 bg-slate-200 rounded-full animate-pulse" />
                            <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-72 bg-slate-100 rounded-2xl animate-pulse" />
                        <div className="h-5 w-96 bg-slate-50 rounded-xl animate-pulse" />
                    </div>

                    {/* Card skeletons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
                        {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-slate-100 rounded-[32px] overflow-hidden">
                                    <div className="aspect-[16/10] sm:aspect-[4/5] bg-slate-200" />
                                    <div className="p-8 space-y-4">
                                        <div className="h-5 bg-slate-200 rounded w-3/4" />
                                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                                        <div className="flex gap-6 pt-6 border-t border-slate-50">
                                            <div className="h-10 w-12 bg-slate-100 rounded" />
                                            <div className="h-10 w-12 bg-slate-100 rounded" />
                                            <div className="h-10 w-16 bg-slate-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ─── Error State ───────────────────────────────────
    if (error) {
        return (
            <section className={`py-20 bg-white overflow-hidden ${className}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-medium text-lg">{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    // ─── Empty State ───────────────────────────────────
    if (listings.length === 0) {
        return (
            <section className={`py-20 bg-white overflow-hidden ${className}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No Properties Found</h3>
                        <p className="text-slate-400 max-w-sm">
                            No listings match the current criteria. Try adjusting your filters or check back soon.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // ─── Active filter badges ──────────────────────────
    const activeFilters: { label: string; value: string }[] = [];
    if (filters.city) activeFilters.push({ label: 'City', value: filters.city });
    if (filters.propertyType) activeFilters.push({ label: 'Type', value: String(filters.propertyType).replace(/_/g, ' ') });
    if (filters.status) activeFilters.push({ label: 'Status', value: String(filters.status).replace(/_/g, ' ') });
    if (filters.minPrice) activeFilters.push({ label: 'Min', value: `$${filters.minPrice.toLocaleString()}` });
    if (filters.maxPrice) activeFilters.push({ label: 'Max', value: `$${filters.maxPrice.toLocaleString()}` });
    if (filters.bedrooms) activeFilters.push({ label: 'Beds', value: `${filters.bedrooms}+` });
    if (filters.bathrooms) activeFilters.push({ label: 'Baths', value: `${filters.bathrooms}+` });
    if (filters.province) activeFilters.push({ label: 'Province', value: filters.province });

    // ─── Main Render ───────────────────────────────────
    return (
        <>
            <section 
                ref={sectionRef}
                className={`py-24 bg-white overflow-hidden ${className}`}
            >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ─── Section Header ───────────────────────── */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-8 bg-[#4F46E5] rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F46E5]">
                                Properties
                            </span>
                            {totalCount > 0 && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                                    {totalCount} found
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                            {title.split(' ').length > 1 ? (
                                <>
                                    {title.split(' ').slice(0, -1).join(' ')}{' '}
                                    <span className="text-[#4F46E5] italic">
                                        {title.split(' ').slice(-1)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[#4F46E5] italic">{title}</span>
                            )}
                        </h2>
                        <p className="text-slate-500 font-medium">{subtitle}</p>

                        {/* Active Filter Badges */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                {activeFilters.map((f, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 bg-indigo-50 text-[#4338CA] px-3 py-1.5 rounded-xl text-xs font-bold"
                                    >
                                        <span className="text-[#4F46E5]/60 text-[10px] uppercase tracking-wider">{f.label}:</span>
                                        {f.value}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {showViewAll && (
                        <a href={viewAllHref}>
                            <button className="h-14 px-10 bg-slate-900 hover:bg-[#4F46E5] text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-slate-200 whitespace-nowrap">
                                View All Listings
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </a>
                    )}
                </div>

                {/* ─── Listings Grid ────────────────────────── */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${limit > 9 ? 'xl:grid-cols-4' : ''} gap-8 lg:gap-10`}>
                    {listings.map((listing, index) => (
                        <div
                            key={listing.id}
                            className="opacity-0 animate-[fadeSlideUp_0.5s_ease-out_forwards]"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <UnifiedPropertyCard 
                                listing={listing} 
                                index={index} 
                                onAuthRequired={(!isAuthenticated && hasHydrated) ? handleAuthRequired : undefined}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Keyframe animation styles */}
            <style jsx>{`
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>

            <LeadCaptureModal 
                isOpen={isLoginModalOpen} 
                onSuccess={() => setIsLoginModalOpen(false)} 
            />
        </>
    );
};

export default ListingsSection;
