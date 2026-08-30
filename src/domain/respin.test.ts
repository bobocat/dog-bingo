import { describe, expect, it } from "vitest";
import { generateCard } from "./card-generation";
import { seededRandom } from "./random";
import {
  ReSpinError,
  canReSpin,
  chooseReplacement,
  eligibleReplacements,
  reSpin,
} from "./respin";
import { DEFAULT_TEST_CONFIG, makeTiles } from "./test-fixtures";
import type { Card } from "./types";

const POOL = makeTiles({ common: 25, uncommon: 20, rare: 15 });
const byId = new Map(POOL.map((t) => [t.id, t]));

function freshCard(seed = 1): Card {
  return generateCard({
    tiles: POOL,
    config: DEFAULT_TEST_CONFIG,
    gameId: "g",
    playerId: "p",
    rng: seededRandom(seed),
  });
}

function playableSlot(card: Card, index = 0) {
  return card.slots.filter((s) => !s.isFree)[index];
}

describe("canReSpin", () => {
  it("only allows unfound, non-free slots while re-spins remain", () => {
    const card = freshCard();
    const slot = playableSlot(card);
    expect(canReSpin(slot, 3)).toBe(true);
    expect(canReSpin(slot, 0)).toBe(false);
    expect(canReSpin({ ...slot, isFound: true }, 3)).toBe(false);
    expect(canReSpin(card.slots[12], 3)).toBe(false);
  });
});

describe("reSpin", () => {
  it("replaces the tile with a unique one and decrements the counter", () => {
    const card = freshCard();
    const slot = playableSlot(card);
    const res = reSpin({
      card,
      slotId: slot.id,
      tiles: POOL,
      respinsRemaining: 3,
      respinsTotal: 3,
      playerId: "p",
      rng: seededRandom(9),
    });
    expect(res.respinsRemaining).toBe(2);
    expect(res.event.respinNumber).toBe(1);
    const newSlot = res.card.slots.find((s) => s.id === slot.id)!;
    expect(newSlot.tileId).not.toBe(slot.tileId);
    expect(newSlot.version).toBe(slot.version + 1);
    const ids = res.card.slots.filter((s) => !s.isFree).map((s) => s.tileId);
    expect(new Set(ids).size).toBe(24);
    // input not mutated
    expect(card.slots.find((s) => s.id === slot.id)!.tileId).toBe(slot.tileId);
  });

  it("refuses when no re-spins remain / slot found / slot free", () => {
    const card = freshCard();
    const slot = playableSlot(card);
    const base = { card, tiles: POOL, respinsTotal: 3, playerId: "p" };
    expect(() =>
      reSpin({ ...base, slotId: slot.id, respinsRemaining: 0 }),
    ).toThrowError(ReSpinError);
    const foundCard = {
      ...card,
      slots: card.slots.map((s) =>
        s.id === slot.id ? { ...s, isFound: true } : s,
      ),
    };
    expect(() =>
      reSpin({
        ...base,
        card: foundCard,
        slotId: slot.id,
        respinsRemaining: 3,
      }),
    ).toThrow(/Found slot/);
    expect(() =>
      reSpin({ ...base, slotId: card.slots[12].id, respinsRemaining: 3 }),
    ).toThrow(/Free slot/);
  });

  it("never introduces a duplicate across 100,000 re-spins", () => {
    const rng = seededRandom(123);
    let card = freshCard(3);
    for (let i = 0; i < 100_000; i++) {
      const slot = playableSlot(card, i % 24);
      const res = reSpin({
        card,
        slotId: slot.id,
        tiles: POOL,
        respinsRemaining: 3,
        respinsTotal: 3,
        playerId: "p",
        rng,
      });
      card = res.card;
    }
    const ids = card.slots.filter((s) => !s.isFree).map((s) => s.tileId);
    expect(new Set(ids).size).toBe(24);
  });

  it("selects each rarity with ~1/3 probability when all pools are available", () => {
    const rng = seededRandom(555);
    const card = freshCard(4);
    const slot = playableSlot(card);
    const counts = { common: 0, uncommon: 0, rare: 0 };
    const N = 100_000;
    for (let i = 0; i < N; i++) {
      const res = reSpin({
        card,
        slotId: slot.id,
        tiles: POOL,
        respinsRemaining: 3,
        respinsTotal: 3,
        playerId: "p",
        rng,
      });
      counts[byId.get(res.event.newTileId)!.rarityCategory]++;
      expect(res.event.usedFallbackPool).toBe(false);
    }
    for (const c of Object.values(counts)) {
      expect(c / N).toBeGreaterThan(0.32);
      expect(c / N).toBeLessThan(0.3467);
    }
  });

  it("falls back to other pools when the chosen rarity is exhausted", () => {
    // Pool has exactly 4 rare tiles: all end up on the card, so rare pool is empty for re-spins.
    const pool = makeTiles({ common: 20, uncommon: 12, rare: 4 });
    const card = generateCard({
      tiles: pool,
      config: DEFAULT_TEST_CONFIG,
      gameId: "g",
      playerId: "p",
      rng: seededRandom(1),
    });
    const eligible = eligibleReplacements(card, pool);
    expect(eligible.some((t) => t.rarityCategory === "rare")).toBe(false);
    const rng = seededRandom(77);
    let sawFallback = false;
    for (let i = 0; i < 1000; i++) {
      const { tile, usedFallbackPool } = chooseReplacement(eligible, rng);
      expect(tile.rarityCategory).not.toBe("rare");
      if (usedFallbackPool) sawFallback = true;
    }
    expect(sawFallback).toBe(true);
  });

  it("throws when nothing at all can replace", () => {
    expect(() => chooseReplacement([], seededRandom(1))).toThrow(
      /No eligible replacement/,
    );
  });
});
