'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function FieldLabel({ children, htmlFor, className, ...props }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-xs font-bold uppercase tracking-wider text-[var(--sepia-light)] mb-1 font-body select-none',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
