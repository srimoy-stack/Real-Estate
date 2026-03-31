'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useMemo, useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────
const LOCAL_PLACEHOLDER = '/images/property-placeholder.svg';
const NON_IMAGE = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i;

/**
 * Validates whether a URL is likely to resolve to an image.
 * Returns false instantly for null, empty, non-image extensions, or malformed URLs.
 */
function isValidImageSrc(src: any): boolean {
  if (!src || typeof src !== 'string') return false;
  if (src.length < 10) return false;
  if (NON_IMAGE.test(src)) return false;
  try {
    const u = new URL(src);
    if (u.pathname === '/' || u.pathname === '') return false;
  } catch {
    // Relative URLs are fine (e.g. /images/...)
    if (!src.startsWith('/')) return false;
  }
  return true;
}

// ─── Props ───────────────────────────────────────────────────────
interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Image source — can be null/undefined safely */
  src?: string | null;
  alt: string;
  /** Seed for deterministic placeholder selection */
  seed?: string | number;
  /** Custom fallback URL */
  fallbackUrl?: string;
  /** next/image compatibility: use fill layout */
  fill?: boolean;
  /** next/image compatibility: priority loading */
  priority?: boolean;
  /** Callback when image loads successfully */
  onLoad?: () => void;
}

/**
 * SafeImage — Production-grade image component with global fallback.
 *
 * - Uses native <img> to bypass Next.js image optimization proxy
 * - Validates URL before attempting load
 * - Falls back to local SVG placeholder on any error
 * - Never blocks rendering
 * - Supports lazy loading by default
 */
export const SafeImage = ({
  src,
  alt,
  seed,
  fallbackUrl,
  fill,
  priority,
  onLoad,
  className = '',
  style,
  ...props
}: SafeImageProps) => {
  const srcInvalid = useMemo(() => !isValidImageSrc(src), [src]);
  const [hasError, setHasError] = useState(srcInvalid);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const finalSrc = hasError
    ? (fallbackUrl || LOCAL_PLACEHOLDER)
    : (src as string);

  // Fill mode: absolute positioning to match next/image fill behavior
  const fillStyles: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
    : { ...style };

  return (
    <img
      {...props}
      src={finalSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      style={fillStyles}
      onError={handleError}
      onLoad={hasError ? undefined : onLoad}
    />
  );
};
