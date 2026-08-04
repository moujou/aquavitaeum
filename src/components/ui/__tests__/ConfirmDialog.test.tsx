import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText('Delete Item')).toBeNull();
  });

  it('renders modal content in portal when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Tasting Note?"
        subtitle="Cannot be undone"
        message="Are you sure you want to delete this note?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Delete Tasting Note?')).toBeDefined();
    expect(screen.getByText('Cannot be undone')).toBeDefined();
    expect(screen.getByText('Are you sure you want to delete this note?')).toBeDefined();
    expect(screen.getByText('Yes, Delete')).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: /Yes, Delete/i });
    fireEvent.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
