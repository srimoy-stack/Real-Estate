'use client';

import React from 'react';
import Link from 'next/link';
import {
  resolveStatus,
  resolvePrice,
  formatNumber,
  getFreshnessBadge,
  getFallbackImage,
  typography,
} from './design-tokens';
import { NormalizedProperty, autoNormalize } from './normalize-property';
import { SafeImage } from './SafeImage';

// ─── Props ───────────────────────────────────────────────────────
interface UnifiedPropertyCardProps {
  /** Raw listing data — any shape (Listing, MLSProperty, or NormalizedProperty) */
  listing: any;
  /** Stagger animation index */
  index?: number;
}

// ─── Icons ───────────────────────────────────────────────────────
const PinIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────
export function UnifiedPropertyCard({ listing, index = 0 }: UnifiedPropertyCardProps) {
  // ─── Normalize data ──
  const prop: NormalizedProperty = listing._normalized ? listing : autoNormalize(listing);

  // ─── Derived values ──
  const seed = prop.mlsNumber || prop.id || index;
  const imageUrl = prop.imageUrl || getFallbackImage(seed);
  const priceDisplay = resolvePrice(prop.price, prop.leaseAmount, prop.leaseRatePerSqft, prop.category);
  const status = resolveStatus(prop.status);
  const freshnessBadge = getFreshnessBadge(prop.modifiedAt, prop.createdAt);
  
  const displayTitle = prop.title && !prop.title.toLowerCase().startsWith('null')
    ? prop.title
    : `${prop.city || 'Property'} Listing`;

  // ─── Metadata Logic ──
  const renderMetadata = () => {
    if (prop.category === 'commercial') {
      const parts = [
        prop.propertySubType || 'Commercial',
        prop.sqft > 0 
          ? `${formatNumber(prop.sqft)} sqft` 
          : prop.lotSizeArea 
            ? `${prop.lotSizeArea} ${prop.lotSizeUnits || 'acres'}` 
            : null,
        prop.zoningDescription
      ].filter(Boolean);

      return (
        <div className="flex items-center gap-2 truncate text-[14px] font-medium text-[#4B5563]">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < parts.length - 1 && <span className="text-[#D1D5DB]">•</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (prop.category === 'lease') {
       const parts = [
        prop.propertySubType || 'Lease',
        prop.sqft > 0 ? `${formatNumber(prop.sqft)} sqft` : null
      ].filter(Boolean);

       return (
        <div className="flex items-center gap-2 text-[14px] font-medium text-[#4B5563]">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < parts.length - 1 && <span className="text-[#D1D5DB]">•</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // Default: Residential
    const parts = [
      prop.bedrooms > 0 ? `${prop.bedrooms} Beds` : null,
      prop.bathrooms > 0 ? `${prop.bathrooms} Baths` : null,
      prop.sqft > 0 ? `${formatNumber(prop.sqft)} sqft` : null
    ].filter(Boolean);

    return (
      <div className="flex items-center gap-2 text-[14px] font-medium text-[#4B5563]">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <span>{part}</span>
            {i < parts.length - 1 && <span className="text-[#D1D5DB]">•</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Link
      href={prop.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'pcFadeUp 0.4s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* ══════════════ IMAGE ══════════════ */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3F4F6]">
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <SafeImage 
          src={imageUrl} 
          alt={displayTitle} 
          seed={seed}
          fill
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        {/* ── Badges ── */}
        <div className="absolute inset-x-3 top-3 z-[3] flex items-start justify-between">
          {/* Freshness Badge (Top-Left) */}
          <div className="flex flex-col gap-2">
            {freshnessBadge && (
              <span 
                className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm ${
                  freshnessBadge.color === 'green' ? 'bg-[#16a34a]' : 'bg-[#2563eb]'
                }`}
              >
                {freshnessBadge.label}
              </span>
            )}
            {prop.isFeatured && (
               <span className="inline-flex rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                 Featured
               </span>
            )}
          </div>

          {/* MLS Badge (Top-Right) */}
          <div className="flex flex-col items-end gap-1.5">
             <div className="rounded-md bg-[#111827] px-2 py-1 shadow-md">
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">REALTOR® / MLS®</span>
             </div>
             {/* Status Badge */}
             <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm ${status.bg}`}>
                {status.label}
             </span>
          </div>
        </div>
      </div>

      {/* ══════════════ CONTENT ══════════════ */}
      <div className="flex flex-1 flex-col p-4">
        {/* Price Section */}
        <div className="mb-2 flex items-baseline gap-2">
          {priceDisplay.type === 'request' ? (
             <span className="inline-flex rounded-full bg-[#F3F4F6] px-3 py-1 text-[13px] font-bold text-[#4B5563] border border-[#E5E7EB]">
                {priceDisplay.text}
             </span>
          ) : (
            <span className={typography.card.price} suppressHydrationWarning>
              {priceDisplay.text}
            </span>
          )}
        </div>

        {/* Address/Title */}
        <h3 className="mb-1 line-clamp-1 text-[16px] font-semibold text-[#111827]">
          {displayTitle}
        </h3>

        {/* Metadata Row */}
        <div className="mb-3">
          {renderMetadata()}
        </div>

        {/* Location Section */}
        <div className="mt-auto flex items-center gap-1.5 border-t border-[#F3F4F6] pt-3 text-[13px] font-medium text-[#4B5563]">
          <span className="text-[#9CA3AF]">
            <PinIcon />
          </span>
          <span className="truncate">
            {prop.city}{prop.province ? `, ${prop.province}` : ''}
          </span>
        </div>
      </div>

      {/* Footer / Brokerage (Subtle) */}
      {prop.brokerageName && (
        <div className="bg-[#F9FAFB] px-4 py-2 border-t border-[#E5E7EB]">
           <span className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] truncate block">
             Listing courtesy of: {prop.brokerageName}
           </span>
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes pcFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Link>
  );
}

export default UnifiedPropertyCard;
