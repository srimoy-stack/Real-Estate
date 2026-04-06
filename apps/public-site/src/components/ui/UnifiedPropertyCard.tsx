'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  resolveStatus,
  resolvePrice,
  formatNumber,
  getFreshnessBadge,
  typography,
  PLACEHOLDER_IMAGE,
} from './design-tokens';
import { NormalizedProperty, autoNormalize } from './normalize-property';
import { SafeImage } from './SafeImage';
import { resolveListingUrl } from '@/lib/resolve-listing-url';


// ─── Props ───────────────────────────────────────────────────────
interface UnifiedPropertyCardProps {
  /** Raw listing data — any shape (Listing, MLSProperty, or NormalizedProperty) */
  listing: any;
  /** Stagger animation index */
  index?: number;
  /** Callback when auth is required (user not logged in). If set, card click is gated. */
  onAuthRequired?: () => void;
}

// ─── Icons ───────────────────────────────────────────────────────
const PinIcon = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────
export function UnifiedPropertyCard({ listing, index = 0, onAuthRequired }: UnifiedPropertyCardProps) {
  // ─── Normalize data ──
  const prop: NormalizedProperty = listing._normalized ? listing : autoNormalize(listing);

  // Failsafe: resolve URL from both normalized and raw data
  const externalUrl = prop.moreInformationLink || resolveListingUrl(listing);

  // ─── Derived values ──
  const seed = prop.mlsNumber || prop.id || index;
  const isPlaceholder = !prop.imageUrl || prop.imageUrl === PLACEHOLDER_IMAGE || (typeof prop.imageUrl === 'string' && prop.imageUrl.includes('placeholder'));
  const imageUrl = isPlaceholder ? PLACEHOLDER_IMAGE : prop.imageUrl;
  const priceDisplay = resolvePrice(prop.price, prop.leaseAmount, prop.leaseRatePerSqft, prop.category);
  const status = resolveStatus(prop.status);
  const freshnessBadge = getFreshnessBadge(prop.modifiedAt, prop.createdAt);
  
  const displayTitle = prop.title && !prop.title.toLowerCase().startsWith('null')
    ? prop.title
    : `${prop.city || 'Property'} Listing`;

  // ─── Location display — never empty ──
  const locationParts = [prop.city, prop.province].filter(Boolean);
  const locationDisplay = locationParts.length > 0 ? locationParts.join(', ') : 'Location not available';

  // ─── Metadata Logic — hide missing, never show N/A ──
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

      if (parts.length === 0) return null;

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

      if (parts.length === 0) return null;

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

    // Default: Residential — only show stats that have values
    const parts = [
      prop.bedrooms > 0 ? `${prop.bedrooms} Beds` : null,
      prop.bathrooms > 0 ? `${prop.bathrooms} Baths` : null,
      prop.sqft > 0 ? `${formatNumber(prop.sqft)} sqft` : null
    ].filter(Boolean);

    if (parts.length === 0) return null;

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

  const metadata = renderMetadata();

  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if user clicked the external link
    if ((e.target as HTMLElement).closest('[data-external-link]')) return;
    // Gate navigation behind auth if callback provided
    if (onAuthRequired) {
      e.preventDefault();
      onAuthRequired();
      return;
    }
    router.push(prop.href);
  };

  return (
    <div
      role="article"
      onClick={handleCardClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] cursor-pointer"
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
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out 
            ${onAuthRequired ? 'blur-[8px] brightness-75 group-hover:blur-[4px] grayscale-[0.5]' : 'group-hover:scale-[1.04]'} 
            ${isPlaceholder ? 'opacity-40 grayscale' : ''}`}
        />

        {isPlaceholder && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center">
             <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full border border-white/10">
                  Image not available
                </span>
             </div>
          </div>
        )}

        {/* ── Badges ── */}
        <div className="absolute inset-x-3 top-3 z-[3] flex items-start justify-between">
          {/* Freshness Badge (Top-Left) */}
          <div className="flex flex-col gap-2">
            {freshnessBadge && (
              <span 
                className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm ${
                  freshnessBadge.color === 'green' ? 'bg-[#16a34a]' : freshnessBadge.color === 'blue' ? 'bg-[#2563eb]' : 'bg-[#6B7280]'
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

          {/* MLS Badge (Top-Right) — always visible */}
          <div className="flex flex-col items-end gap-1.5">
             <div className="rounded-md bg-[#111827] px-2 py-1 shadow-md">
                <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">Verified Listing</span>
             </div>
             {/* Status Badge */}
             <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm ${status.bg}`}>
                {status.label}
             </span>
          </div>
        </div>

        {/* Auth-required hover overlay — subtle hint for unauthenticated users */}
        {onAuthRequired && (
          <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
            <div className="flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-4 py-2 shadow-2xl border border-white/10">
              <svg className="h-3.5 w-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Sign in for details</span>
            </div>
          </div>
        )}
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

        {/* Metadata Row — only show if we have data */}
        {metadata && (
          <div className="mb-3">
            {metadata}
          </div>
        )}

        {/* Location Section — always has content */}
        <div className="mt-auto flex items-center gap-1.5 border-t border-[#F3F4F6] pt-3 text-[13px] font-medium text-[#4B5563]">
          <span className="text-[#9CA3AF]">
            <PinIcon />
          </span>
          <span className="truncate">
            {locationDisplay}
          </span>
        </div>
      </div>

      {/* ══════════════ REALTOR.ca More Info Strip ══════════════ */}
      {externalUrl && (
        <div
          data-external-link
          className="border-t border-[#E5E7EB] bg-[#FFF8F8] px-4 py-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-external-link
            className="flex items-center justify-between group/ext"
            aria-label="View property details"
          >
            {/* Left: Info Indicator */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#cc0000] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">
                Property Source
              </span>
            </div>

            {/* Right: CTA */}
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#cc0000] group-hover/ext:underline underline-offset-2 transition-all">
              More Info
              <svg className="h-3 w-3 transition-transform group-hover/ext:translate-x-0.5 group-hover/ext:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </a>
        </div>
      )}

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
    </div>
  );
}

export default UnifiedPropertyCard;
