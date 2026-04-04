'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UnifiedPropertyCard } from '@/components/ui';

interface SimilarListingsProps {
  listingKey: string;
  city?: string;
  limit?: number;
  /** Server-rendered fallback listings (from getRelatedListingsDirect) */
  fallbackListings?: any[];
}

export function SimilarListings({ 
  listingKey, 
  city = 'your area',
  limit = 8,
  fallbackListings = [],
}: SimilarListingsProps) {
  const [listings, setListings] = useState<any[]>(fallbackListings);
  const [loading, setLoading] = useState(fallbackListings.length === 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we already have server-rendered fallback listings, try to enhance them
    // with the recommendation engine via the API
    const fetchSimilar = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/similar-listings?listingKey=${encodeURIComponent(listingKey)}&limit=${limit}`,
          { cache: 'no-store' }
        );

        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();
        if (data.similar && data.similar.length > 0) {
          setListings(data.similar);
        }
        // If API returns empty but we have fallback, keep fallback
      } catch (err) {
        console.warn('[SimilarListings] API fetch failed, using fallback:', err);
        setError(true);
        // Keep fallback listings
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [listingKey, limit]);

  // Show skeleton if loading and no fallback
  if (loading && listings.length === 0) {
    return (
      <section id="related-listings" className="space-y-12 pt-24">
        <div className="flex items-end justify-between">
          <div className="space-y-3">
            <h2 className="text-4xl font-black italic tracking-tight text-slate-900">
              Similar Listings
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Finding the best matches for you...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[4/3] rounded-3xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-4 w-2/3 rounded-lg bg-slate-100" />
                <div className="h-3 w-1/3 rounded-lg bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (listings.length === 0) return null;

  return (
    <section id="related-listings" className="space-y-12 pt-24">
      <div className="flex items-end justify-between">
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic tracking-tight text-slate-900 leading-tight">
            Hand-picked for you in <span className="text-indigo-600 block sm:inline">{city}</span>
          </h2>
          <div className="flex items-center gap-3">
            {!error && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-600">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI-Powered Recommendations
              </span>
            )}
          </div>
        </div>
        <Link
          href="/search"
          className="hidden items-center gap-3 text-xs font-black uppercase tracking-widest text-indigo-600 transition-all hover:gap-5 sm:flex"
        >
          View all
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {listings.map((l) => (
          <UnifiedPropertyCard key={l.id || l.mlsNumber || l.listingKey} listing={l} />
        ))}
      </div>
    </section>
  );
}
