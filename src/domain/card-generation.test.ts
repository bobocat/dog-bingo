import { describe, expect, it } from "vitest";
import {
  CardGenerationError,
  categoryRulesSatisfied,
  generateCard,
  playableSlotCount,
  validatePool,
} from "./card-generation";
import { seededRandom } from "./random";
import { DEFAULT_TEST_CONFIG, makeTiles } from "./test-fixtures";

const POOL = makeTiles({ common: 25, uncommon: 20, rare: 15 });

describe("playableSlotCount", () => {
  it("subtracts free center", () => {
    expect(
      playableSlotCount({ cardColumns: 5, cardRows: 5, freeCenter: true }),
    ).toBe(24);
    expect(
      playableSlotCount({ cardColumns: 5, cardRows: 3, freeCenter: true }),
    ).toBe(14);
    expect(
      playableSlotCount({ cardColumns: 5, cardRows: 5, freeCenter: false }),
    ).toBe(25);
  });
});

describe("generateCard", () => {
  it("produces 25 slots with a free center and 24 unique tiles", () => {
    const card = generateCard({
      tiles: POOL,
      config: DEFAULT_TEST_CONFIG,
      gameId: "g",
      playerId: "p",
      rng: seededRandom(1),
    });
    expect(card.slots).toHaveLength(25);
    expect(card.slots[12].isFree).toBe(true);
    expect(card.slots[12].tileId).toBeNull();
    const ids = card.slots.filter((s) => !s.isFree).map((s) => s.tileId);
    expect(new Set(ids).size).toBe(24);
    expect(card.rarityScore).toBe(40);
  });

  it("meets the rarity quota exactly", () => {
    const card = generateCard({
      tiles: POOL,
      config: DEFAULT_TEST_CONFIG,
      gameId: "g",
      playerId: "p",
      rng: seededRandom(2),
    });
    const byId = new Map(POOL.map((t) => [t.id, t]));
    const counts = { common: 0, uncommon: 0, rare: 0 };
    for (const s of card.slots)
      if (s.tileId) counts[byId.get(s.tileId)!.rarityCategory]++;
    expect(counts).toEqual({ common: 12, uncommon: 8, rare: 4 });
  });

  it("generates 10,000 cards with zero duplicates and constant score", () => {
    const rng = seededRandom(42);
    for (let i = 0; i < 10_000; i++) {
      const card = generateCard({
        tiles: POOL,
        config: DEFAULT_TEST_CONFIG,
        gameId: "g",
        playerId: "p",
        rng,
      });
      const ids = card.slots.filter((s) => !s.isFree).map((s) => s.tileId);
      if (new Set(ids).size !== 24)
        throw new Error(`duplicate at iteration ${i}`);
      if (card.rarityScore !== 40)
        throw new Error(`score ${card.rarityScore} at iteration ${i}`);
    }
  });

  it("fails clearly when a rarity pool is too small", () => {
    const small = makeTiles({ common: 12, uncommon: 8, rare: 3 });
    expect(validatePool(small, DEFAULT_TEST_CONFIG.rarityQuota)).toHaveLength(
      1,
    );
    expect(() =>
      generateCard({
        tiles: small,
        config: DEFAULT_TEST_CONFIG,
        gameId: "g",
        playerId: "p",
      }),
    ).toThrowError(CardGenerationError);
    try {
      generateCard({
        tiles: small,
        config: DEFAULT_TEST_CONFIG,
        gameId: "g",
        playerId: "p",
      });
    } catch (e) {
      expect((e as CardGenerationError).code).toBe("INSUFFICIENT_POOL");
    }
  });

  it("fails when quota does not match slot count", () => {
    const config = {
      ...DEFAULT_TEST_CONFIG,
      rarityQuota: { common: 12, uncommon: 8, rare: 3 },
    };
    try {
      generateCard({ tiles: POOL, config, gameId: "g", playerId: "p" });
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as CardGenerationError).code).toBe("QUOTA_SIZE_MISMATCH");
    }
  });

  it("ignores inactive tiles", () => {
    const pool = POOL.map((t, i) => (i < 20 ? { ...t, active: false } : t)); // kills 20 commons -> 5 left
    try {
      generateCard({
        tiles: pool,
        config: DEFAULT_TEST_CONFIG,
        gameId: "g",
        playerId: "p",
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as CardGenerationError).code).toBe("INSUFFICIENT_POOL");
    }
  });

  it("applies category rules with bounded retries", () => {
    const config = {
      ...DEFAULT_TEST_CONFIG,
      // Pool is 1/3 each category (expected ~8 per category on a 24-card).
      categoryRules: [
        { category: "clothing", max: 7 },
        { category: "behavior", min: 8 },
      ],
    };
    const rng = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const card = generateCard({
        tiles: POOL,
        config,
        gameId: "g",
        playerId: "p",
        rng,
        maxAttempts: 500,
      });
      const byId = new Map(POOL.map((t) => [t.id, t]));
      const chosen = card.slots
        .filter((s) => s.tileId)
        .map((s) => byId.get(s.tileId!)!);
      expect(categoryRulesSatisfied(chosen, config.categoryRules)).toBe(true);
    }
  });

  it("reports unsatisfiable category rules instead of looping forever", () => {
    const config = {
      ...DEFAULT_TEST_CONFIG,
      categoryRules: [{ category: "nonexistent", min: 1 }],
    };
    try {
      generateCard({
        tiles: POOL,
        config,
        gameId: "g",
        playerId: "p",
        maxAttempts: 5,
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as CardGenerationError).code).toBe("CATEGORY_UNSATISFIABLE");
    }
  });
});
