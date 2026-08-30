import type { GameConfig, RarityCategory, Tile } from "./types";
import { rarityScoreFor } from "./rarity";

/** Synthetic theme pool for tests: `counts` tiles per rarity, categories cycled. */
export function makeTiles(
  counts: Record<RarityCategory, number>,
  categories: string[] = ["breed", "behavior", "clothing"],
): Tile[] {
  const tiles: Tile[] = [];
  let i = 0;
  for (const cat of ["common", "uncommon", "rare"] as const) {
    for (let k = 0; k < counts[cat]; k++, i++) {
      tiles.push({
        id: `t${i}`,
        themeId: "test",
        slug: `t${i}`,
        name: `Tile ${i}`,
        category: categories[i % categories.length],
        rarityScore: rarityScoreFor(cat),
        rarityCategory: cat,
        active: true,
      });
    }
  }
  return tiles;
}

export const DEFAULT_TEST_CONFIG: GameConfig = {
  cardColumns: 5,
  cardRows: 5,
  freeCenter: true,
  respins: 3,
  rarityQuota: { common: 12, uncommon: 8, rare: 4 },
};
