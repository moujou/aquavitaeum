/**
 * Validates whether an Alcohol By Volume (ABV) percentage is within standard range (0% to 100%).
 */
export function isValidAbv(abv: number): boolean {
  return typeof abv === 'number' && !isNaN(abv) && abv >= 0 && abv <= 100;
}

/**
 * Maps a 1-100 rating score to a human-readable quality category.
 */
export function calculateRatingCategory(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Below Average';
}

/**
 * Trims whitespace, removes empty entries, and deduplicates flavor wheel tags.
 */
export function deduplicateTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  const cleanedTags = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(cleanedTags));
}
