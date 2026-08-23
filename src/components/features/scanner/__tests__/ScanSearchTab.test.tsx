import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanSearchTab } from '../subcomponents/ScanSearchTab';

describe('ScanSearchTab', () => {
  it('renders search input and example suggestions', () => {
    const onQueryChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ScanSearchTab
        language="DE"
        textQuery=""
        onQueryChange={onQueryChange}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText('Name der Brennerei & Abfüllung')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Suchen' })).toBeDefined();

    // Click an example suggestion
    const ardbegChip = screen.getByRole('button', { name: 'Ardbeg Uigeadail' });
    fireEvent.click(ardbegChip);
    expect(onQueryChange).toHaveBeenCalledWith('Ardbeg Uigeadail');
  });

  it('triggers onSubmit on form submission when query is non-empty', () => {
    const onSubmit = vi.fn((e) => e?.preventDefault());
    render(
      <ScanSearchTab
        language="EN"
        textQuery="Lagavulin 16"
        onQueryChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Search' });
    expect(submitBtn).toBeDefined();
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
  });
});
