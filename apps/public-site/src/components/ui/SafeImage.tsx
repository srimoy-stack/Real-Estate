'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getFallbackImage } from './design-tokens';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  seed?: string | number;
  fallbackUrl?: string;
}

export const SafeImage = ({ src, alt, seed, fallbackUrl, ...props }: SafeImageProps) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    console.warn(`[SafeImage] Failed to load: ${src}`);
    setError(true);
  };

  const finalSrc = error 
    ? (fallbackUrl || getFallbackImage(seed || String(src))) 
    : src;

  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt}
      onError={handleError}
    />
  );
};
