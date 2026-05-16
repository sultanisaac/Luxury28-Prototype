'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | string[] | null;
  fallbackSrc?: string;
}

export function SafeImage({ src, fallbackSrc = '/luxury_watch_placeholder.png', alt, ...props }: SafeImageProps) {
  // Handle array of images (take the first one)
  const initialSrc = Array.isArray(src) ? src[0] : src;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc || fallbackSrc);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || 'Product Image'}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
