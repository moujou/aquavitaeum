import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BarVerdictRoleSelector } from '../BarVerdictRoleSelector';

describe('BarVerdictRoleSelector Component', () => {
  it('renders all bar roles and toggles selection on click', () => {
    const toggleFn = vi.fn();
    const mockT = (k: string) => k;

    render(
      <BarVerdictRoleSelector
        activeRoles={['Daily Sipper']}
        onToggleRole={toggleFn}
        language="EN"
        t={mockT}
      />
    );

    expect(screen.getByText(/Daily Sipper/i)).toBeDefined();
    expect(screen.getByText(/Showcase Bottle/i)).toBeDefined();
    expect(screen.getByText(/Buy Again/i)).toBeDefined();
    expect(screen.getByText(/Great Value/i)).toBeDefined();

    const showcaseBtn = screen.getByRole('button', { name: /Showcase Bottle/i });
    fireEvent.click(showcaseBtn);
    expect(toggleFn).toHaveBeenCalledWith('Showcase Bottle');
  });
});
