import { describe, expect, it } from "vitest";
import {
  DEFAULT_RARITY_QUOTA_24,
  assertRarityConsistent,
  isRarityCategory,
  isRarityScore,
  quotaScore,
  quotaTotal,
  rarityCategoryFor,
  rarityScoreFor,
} from "./rarity";

describe("rarity", () => {
  it("accepts only 1/2/3 as scores", () => {
    expect(isRarityScore(1)).toBe(true);
    expect(isRarityScore(3)).toBe(true);
    expect(isRarityScore(0)).toBe(false);
    expect(isRarityScore(4)).toBe(false);
    expect(isRarityScore("1")).toBe(false);
  });

  it("accepts only common/uncommon/rare as categories", () => {
    expect(isRarityCategory("common")).toBe(true);
    expect(isRarityCategory("legendary")).toBe(false);
    expect(isRarityCategory("ultra_rare")).toBe(false);
  });

  it("maps scores and categories both ways", () => {
    expect(rarityScoreFor("rare")).toBe(3);
    expect(rarityCategoryFor(2)).toBe("uncommon");
  });

  it("asserts consistency", () => {
    expect(() => assertRarityConsistent(1, "common")).not.toThrow();
    expect(() => assertRarityConsistent(1, "rare")).toThrow(/mismatch/);
    expect(() => assertRarityConsistent(5, "rare")).toThrow(
      /Invalid rarity score/,
    );
  });

  it("computes the default 24-slot quota to 40 points", () => {
    expect(quotaTotal(DEFAULT_RARITY_QUOTA_24)).toBe(24);
    expect(quotaScore(DEFAULT_RARITY_QUOTA_24)).toBe(40);
  });
});
