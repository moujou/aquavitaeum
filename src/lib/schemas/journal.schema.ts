import { Journal } from '@/types/spirit.types';

export interface JournalValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a Journal object against domain business rules.
 */
export function validateJournal(raw: unknown): JournalValidationResult {
  const errors: Record<string, string> = {};

  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: { _global: 'Journal must be an object.' } };
  }

  const j = raw as Partial<Journal>;

  if (!j.id || typeof j.id !== 'string' || j.id.trim() === '') {
    errors.id = 'Journal ID is required.';
  } else if (j.id.length > 150) {
    errors.id = 'Journal ID cannot exceed 150 characters.';
  }

  if (!j.name || typeof j.name !== 'string' || j.name.trim() === '') {
    errors.name = 'Journal name is required.';
  } else if (j.name.length > 150) {
    errors.name = 'Journal name cannot exceed 150 characters.';
  }

  if (j.description !== undefined && j.description !== null) {
    if (typeof j.description !== 'string') {
      errors.description = 'Journal description must be a string.';
    } else if (j.description.length > 1000) {
      errors.description = 'Journal description cannot exceed 1000 characters.';
    }
  }

  if (j.coverImage !== undefined && j.coverImage !== null) {
    if (typeof j.coverImage !== 'string') {
      errors.coverImage = 'Cover image must be a string.';
    }
  }

  if (j.createdAt !== undefined && typeof j.createdAt !== 'string') {
    errors.createdAt = 'Created date must be a valid date string.';
  }

  if (j.updatedAt !== undefined && typeof j.updatedAt !== 'string') {
    errors.updatedAt = 'Updated date must be a valid date string.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Type-guard verifying that raw data is a valid Journal record.
 */
export function isValidJournalData(raw: unknown): raw is Journal {
  return validateJournal(raw).valid;
}
