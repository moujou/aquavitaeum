import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarVerdictRoleSelector, getRoleEmoji } from '../BarVerdictRoleSelector';

describe('BarVerdictRoleSelector', () => {
  it('maps all roles to their signature emojis', () => {
    expect(getRoleEmoji('Beginner Friendly')).toBe('🌱');
    expect(getRoleEmoji('Connoisseur Choice')).toBe('🧐');
    expect(getRoleEmoji('Daily Sipper')).toBe('🥃');
    expect(getRoleEmoji('Showcase Bottle')).toBe('👑');
    expect(getRoleEmoji('Buy Again')).toBe('🛒');
    expect(getRoleEmoji('Great Value')).toBe('💎');
    expect(getRoleEmoji('Guest Favorite')).toBe('👥');
    expect(getRoleEmoji('Gift Idea')).toBe('🎁');
    expect(getRoleEmoji('Unknown')).toBe('✨');
  });

  it('renders all bar roles in German and English and toggles selection', () => {
    const onToggleRole = vi.fn();
    const { rerender } = render(
      <BarVerdictRoleSelector
        activeRoles={['Beginner Friendly']}
        onToggleRole={onToggleRole}
        language="DE"
      />
    );

    expect(screen.getByText(/Einsteiger/)).toBeDefined();
    expect(screen.getByText(/Kenner-Wahl/)).toBeDefined();

    const connoisseurBtn = screen.getByRole('button', { name: /Kenner-Wahl/ });
    fireEvent.click(connoisseurBtn);
    expect(onToggleRole).toHaveBeenCalledWith('Connoisseur Choice');

    rerender(
      <BarVerdictRoleSelector
        activeRoles={['Beginner Friendly']}
        onToggleRole={onToggleRole}
        language="EN"
      />
    );

    expect(screen.getByText(/Beginner/)).toBeDefined();
    expect(screen.getByText(/Connoisseur/)).toBeDefined();
  });
});
