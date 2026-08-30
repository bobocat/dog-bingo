import {
  RARITY_CATEGORIES,
  RARITY_SCORES,
  type RarityCategory,
  type RarityQuota,
  type RarityScore,
} from "./types";

const SCORE_BY_CATEGORY: Record<RarityCategory, RarityScore> = {
  common: 1,
  uncommon: 2,
  rare: 3,
};

const CATEGORY_BY_SCORE: Record<RarityScore, RarityCategory> = {
  1: "common",
  2: "uncommon",
  3: "rare",
};

export function isRarityScore(value: unknown): value is RarityScore {
  return (RARITY_SCORES as readonly unknown[]).includes(value);
}

export function isRarityCategory(value: unknown): value is RarityCategory {
  return (RARITY_CATEGORIES as readonly unknown[]).includes(value);
}

export function rarityScoreFor(category: RarityCategory): RarityScore {
  return SCORE_BY_CATEGORY[category];
}

export function rarityCategoryFor(score: RarityScore): RarityCategory {
  return CATEGORY_BY_SCORE[score];
}

/** Throws if score and category disagree or are out of range. */
export function assertRarityConsistent(
  score: unknown,
  category: unknown,
): void {
  if (!isRarityScore(score))
    throw new Error(`Invalid rarity score: ${String(score)}`);
  if (!isRarityCategory(category))
    throw new Error(`Invalid rarity category: ${String(category)}`);
  if (rarityCategoryFor(score) !== category) {
    throw new Error(`Rarity mismatch: score ${score} is not "${category}"`);
  }
}

export function quotaTotal(quota: RarityQuota): number {
  return quota.common + quota.uncommon + quota.rare;
}

/** Sum of rarity scores a card must have to satisfy the quota. */
export function quotaScore(quota: RarityQuota): number {
  return quota.common * 1 + quota.uncommon * 2 + quota.rare * 3;
}

/** Default 24-slot quota from design doc §12.2. Total score 40. */
export const DEFAULT_RARITY_QUOTA_24: RarityQuota = {
  common: 12,
  uncommon: 8,
  rare: 4,
};
