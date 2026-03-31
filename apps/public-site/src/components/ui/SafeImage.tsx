'use client';

import React, { useState, useMemo } from 'react';
import Image, { ImageProps } from 'next/image';
import { getFallbackImage } from './design-tokens';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  seed?: string | number;
  fallbackUrl?: string;
}

const NON_IMAGE = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i;

export const SafeImage = ({ src, alt, seed, fallbackUrl, ...props }: SafeImageProps) => {
  const isInvalid = useMemo(() => {
    if (!src) return true;
    if (typeof src === 'string' && NON_IMAGE.test(src)) return true;
    return false;
  }, [src]);

  const [error, setError] = useState(isInvalid);

  const handleError = () => {
    setError(true);
  };

  const finalSrc = error 
    ? (fallbackUrl || getFallbackImage(seed || String(src))) 
    : src;

  return (
    <Image
      {...props}
      src={finalSrc as string} // Final source is either original or fallback string
      alt={alt}
      onError={handleError}
    />
  );
};
