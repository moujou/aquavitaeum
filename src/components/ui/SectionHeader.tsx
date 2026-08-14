'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3' | 'h4' | 'span';
}

export function SectionHeader({
  children,
  className,
  as: Component = 'h3',
  ...props
}: SectionHeaderProps) {
  return (
    <Component
      className={cn(
        'text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--sepia-light)] font-body select-none block',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
