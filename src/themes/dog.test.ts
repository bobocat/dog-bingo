import { describe, expect, it } from "vitest";
import {
  generateCard,
  groupByRarity,
  validatePool,
} from "@/domain/card-generation";
import { assertRarityConsistent } from "@/domain/rarity";
import { seededRandom } from "@/domain/random";
import { DOG_THEME, DOG_TILES } from "./dog";

describe("dog theme content", () => {
  it("has a 50–75 tile library", () => {
    expect(DOG_TILES.length).toBeGreaterThanOrEqual(50);
    expect(DOG_TILES.length).toBeLessThanOrEqual(75);
  });

  it("has unique ids and slugs", () => {
    expect(new Set(DOG_TILES.map((t) => t.id)).size).toBe(DOG_TILES.length);
    expect(new Set(DOG_TILES.map((t) => t.slug)).size).toBe(DOG_TILES.length);
  });

  it("every tile has consistent rarity, a category, and identification tips", () => {
    for (const t of DOG_TILES) {
      assertRarityConsistent(t.rarityScore, t.rarityCategory);
      expect(t.category).toBeTruthy();
      expect(t.identificationTips).toBeTruthy();
    }
  });

  it("can satisfy the default quota with headroom for re-spins", () => {
    expect(validatePool(DOG_TILES, DOG_THEME.config.rarityQuota)).toEqual([]);
    const pools = groupByRarity(DOG_TILES);
    // At least one spare per rarity so a re-spin can land on any rarity.
    expect(pools.common.length).toBeGreaterThan(
      DOG_THEME.config.rarityQuota.common,
    );
    expect(pools.uncommon.length).toBeGreaterThan(
      DOG_THEME.config.rarityQuota.uncommon,
    );
    expect(pools.rare.length).toBeGreaterThan(
      DOG_THEME.config.rarityQuota.rare,
    );
  });

  it("generates 1,000 valid cards with its own category rules", () => {
    const rng = seededRandom(2026);
    const config = {
      cardColumns: DOG_THEME.defaultCardColumns,
      cardRows: DOG_THEME.defaultCardRows,
      freeCenter: DOG_THEME.config.freeCenter,
      respins: DOG_THEME.config.defaultRespins,
      rarityQuota: DOG_THEME.config.rarityQuota,
      categoryRules: DOG_THEME.config.categoryRules,
    };
    for (let i = 0; i < 1000; i++) {
      const card = generateCard({
        tiles: DOG_TILES,
        config,
        gameId: "g",
        playerId: "p",
        rng,
      });
      expect(card.rarityScore).toBe(23);
    }
  });
});
