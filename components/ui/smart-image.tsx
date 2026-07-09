'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Archive } from 'lucide-react';

interface SmartImageProps extends Omit<ImageProps, 'src'> {
  src?: string | string[] | null;
  fallbackType?: 'luxury' | 'modern' | 'vintage' | 'generic';
}

const FALLBACKS = {
  luxury: '/luxury_watch_placeholder.png',
  modern: '/fallback-modern.png',
  vintage: '/fallback-vintage.png',
  generic: '/featured-watch.png'
};

export function SmartImage({ src, fallbackType = 'luxury', alt, className, ...props }: SmartImageProps) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  
  // Reset error state when src changes
  React.useEffect(() => {
    setError(false);
    setFallbackError(false);
  }, [src]);
  
  // Handle array of images or single string
  const initialSrc = Array.isArray(src) ? src[0] : src;
  const currentSrc = error || !initialSrc ? FALLBACKS[fallbackType] : initialSrc;

  if ((error && !FALLBACKS[fallbackType]) || fallbackError) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 border border-zinc-800 ${className || ''}`}>
        <Archive size={Math.min(48, props.width ? Number(props.width) / 2 : 48)} className="text-zinc-700" />
      </div>
    );
  }

  return (
    <Image
      key={currentSrc}
      {...props}
      src={currentSrc}
      alt={alt || 'Luxury Timepiece'}
      className={className}
      onError={() => {
        if (!error) {
          setError(true);
        } else {
          setFallbackError(true);
        }
      }}
    />
  );
}
