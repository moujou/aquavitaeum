'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  stars: number;
  maxStars?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  stars,
  maxStars = 5,
  size = 24,
  showValue = false,
  className,
}: RatingStarsProps) {
  const starArray = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      aria-label={`Star rating: ${stars} of ${maxStars}`}
    >
      {starArray.map((s) => (
        <Star
          key={s}
          size={size}
          className={cn(
            'transition-colors drop-shadow-xs',
            stars >= s
              ? 'fill-[#C59B27] text-[#C59B27]'
              : stars >= s - 0.5
              ? 'fill-[#C59B27]/50 text-[#C59B27]'
              : 'fill-none text-[#C4A87A]',
          )}
        />
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-[#5c3d22] font-body font-bold">
          {stars.toFixed(1)} / {maxStars}
        </span>
      )}
    </div>
  );
}
