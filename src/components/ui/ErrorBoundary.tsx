'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Aqua Vitaeum Error Boundary caught an exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] w-full parchment p-6 rounded-md flex flex-col items-center justify-center text-center gap-4 my-6">
          <div className="text-3xl">🥃⚠️</div>
          <h3 className="font-display font-bold text-lg text-[var(--sepia-text)]">
            Something went wrong rendering this tasting card
          </h3>
          <p className="font-body text-xs sm:text-sm text-[var(--sepia-muted)] max-w-md">
            An unexpected error occurred. You can reload the page or click below to recover.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[var(--brass-accent)] text-[var(--sepia-text)] font-body font-bold text-xs rounded-sm hover:bg-[var(--brass-light)] transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
