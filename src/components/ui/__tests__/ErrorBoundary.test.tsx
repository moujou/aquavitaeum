import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ProblemChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test Component Explosion');
  }
  return <div>Normal Content</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Hello Safe World</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Hello Safe World')).toBeDefined();
  });

  it('renders fallback UI when a child component throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong rendering this tasting card')).toBeDefined();
    expect(screen.getByText('Try Again')).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('renders custom fallback node when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom Error Alert</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Alert')).toBeDefined();

    consoleSpy.mockRestore();
  });
});
