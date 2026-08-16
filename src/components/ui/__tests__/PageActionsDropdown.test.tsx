import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PageActionsDropdown, DropdownActionItem } from '../PageActionsDropdown';
import { Upload, Download, Trash2 } from 'lucide-react';

describe('PageActionsDropdown Component', () => {
  const mockAction1 = vi.fn();
  const mockAction2 = vi.fn();
  const mockDestructive = vi.fn();

  const sampleItems: DropdownActionItem[] = [
    {
      id: 'import',
      label: 'Import Journal',
      icon: <Upload size={16} data-testid="upload-icon" />,
      onClick: mockAction1,
    },
    {
      id: 'export',
      label: 'Export Journal',
      icon: <Download size={16} data-testid="download-icon" />,
      onClick: mockAction2,
    },
    {
      id: 'delete',
      label: 'Delete All',
      icon: <Trash2 size={16} data-testid="delete-icon" />,
      onClick: mockDestructive,
      destructive: true,
    },
  ];

  it('renders trigger button and does not show menu initially', () => {
    render(<PageActionsDropdown items={sampleItems} title="Custom Actions" />);

    const triggerBtn = screen.getByRole('button', { name: /custom actions/i });
    expect(triggerBtn).toBeDefined();
    expect(screen.queryByText('Import Journal')).toBeNull();
  });

  it('opens and closes menu on trigger button clicks', () => {
    render(<PageActionsDropdown items={sampleItems} title="Actions" />);

    const triggerBtn = screen.getByRole('button', { name: /actions/i });

    // Open
    fireEvent.click(triggerBtn);
    expect(screen.getByText('Import Journal')).toBeDefined();
    expect(screen.getByText('Export Journal')).toBeDefined();
    expect(screen.getByText('Delete All')).toBeDefined();

    // Close
    fireEvent.click(triggerBtn);
    expect(screen.queryByText('Import Journal')).toBeNull();
  });

  it('triggers item onClick and closes menu when an item is selected', () => {
    render(<PageActionsDropdown items={sampleItems} title="Actions" />);

    const triggerBtn = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(triggerBtn);

    const importItem = screen.getByText('Import Journal');
    fireEvent.click(importItem);

    expect(mockAction1).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Import Journal')).toBeNull();
  });

  it('closes menu when pressing Escape key', () => {
    render(<PageActionsDropdown items={sampleItems} title="Actions" />);

    const triggerBtn = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(triggerBtn);
    expect(screen.getByText('Import Journal')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Import Journal')).toBeNull();
  });

  it('closes menu on outside click', () => {
    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <PageActionsDropdown items={sampleItems} title="Actions" />
      </div>
    );

    const triggerBtn = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(triggerBtn);
    expect(screen.getByText('Import Journal')).toBeDefined();

    fireEvent.mouseDown(screen.getByTestId('outside-area'));
    expect(screen.queryByText('Import Journal')).toBeNull();
  });

  it('disables item and prevents click when disabled: true', () => {
    const disabledAction = vi.fn();
    const itemsWithDisabled: DropdownActionItem[] = [
      {
        id: 'disabled-item',
        label: 'Disabled Action',
        icon: <Upload size={16} />,
        onClick: disabledAction,
        disabled: true,
      },
    ];

    render(<PageActionsDropdown items={itemsWithDisabled} title="Actions" />);

    fireEvent.click(screen.getByRole('button', { name: /actions/i }));

    const disabledBtn = screen.getByText('Disabled Action').closest('button');
    expect(disabledBtn?.hasAttribute('disabled')).toBe(true);

    if (disabledBtn) fireEvent.click(disabledBtn);
    expect(disabledAction).not.toHaveBeenCalled();
  });
});
