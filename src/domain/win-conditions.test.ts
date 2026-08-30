import { describe, expect, it } from "vitest";
import type { Card, CardSlot } from "./types";
import {
  allLines,
  completedLines,
  isWinSatisfied,
  progress,
} from "./win-conditions";

function makeCard(
  size: number,
  opts: { freeCenter?: boolean; found?: number[] } = {},
): Card {
  const center = Math.floor((size * size) / 2);
  const found = new Set(opts.found ?? []);
  const slots: CardSlot[] = Array.from(
    { length: size * size },
    (_, position) => {
      const isFree = !!opts.freeCenter && position === center;
      return {
        id: `slot-${position}`,
        position,
        tileId: isFree ? null : `tile-${position}`,
        isFree,
        isFound: found.has(position),
        version: 0,
      };
    },
  );
  return {
    id: "c",
    gameId: "g",
    playerId: "p",
    size,
    slots,
    rarityScore: 0,
    createdAt: 0,
  };
}

describe("allLines", () => {
  it("enumerates 2n+2 lines for an n by n card", () => {
    expect(allLines(5)).toHaveLength(12);
    expect(allLines(3)).toHaveLength(8);
  });
});

describe("isWinSatisfied", () => {
  it("any_line: a full row wins", () => {
    const card = makeCard(5, { found: [0, 1, 2, 3, 4] });
    expect(isWinSatisfied(card, { type: "any_line" })).toBe(true);
    expect(isWinSatisfied(card, { type: "row" })).toBe(true);
    expect(isWinSatisfied(card, { type: "column" })).toBe(false);
  });

  it("any_line: free center counts toward the middle row", () => {
    const card = makeCard(5, { freeCenter: true, found: [10, 11, 13, 14] });
    expect(isWinSatisfied(card, { type: "any_line" })).toBe(true);
    const noFree = makeCard(5, { found: [10, 11, 13, 14] });
    expect(isWinSatisfied(noFree, { type: "any_line" })).toBe(false);
  });

  it("diagonal wins", () => {
    const card = makeCard(5, { freeCenter: true, found: [0, 6, 18, 24] });
    expect(isWinSatisfied(card, { type: "diagonal" })).toBe(true);
    expect(completedLines(card)).toHaveLength(1);
  });

  it("four corners", () => {
    const card = makeCard(5, { found: [0, 4, 20, 24] });
    expect(isWinSatisfied(card, { type: "four_corners" })).toBe(true);
    expect(isWinSatisfied(card, { type: "any_line" })).toBe(false);
  });

  it("lines: requires N completed lines", () => {
    const card = makeCard(5, { found: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
    expect(isWinSatisfied(card, { type: "lines", count: 2 })).toBe(true);
    expect(isWinSatisfied(card, { type: "lines", count: 3 })).toBe(false);
  });

  it("full_card: requires every playable slot", () => {
    const all = Array.from({ length: 25 }, (_, i) => i).filter((i) => i !== 12);
    const card = makeCard(5, { freeCenter: true, found: all });
    expect(isWinSatisfied(card, { type: "full_card" })).toBe(true);
    const almost = makeCard(5, { freeCenter: true, found: all.slice(1) });
    expect(isWinSatisfied(almost, { type: "full_card" })).toBe(false);
  });

  it("empty card satisfies nothing", () => {
    const card = makeCard(5, { freeCenter: true });
    for (const t of [
      "any_line",
      "full_card",
      "four_corners",
      "row",
      "column",
      "diagonal",
    ] as const) {
      expect(isWinSatisfied(card, { type: t })).toBe(false);
    }
  });
});

describe("progress", () => {
  it("excludes free slot from total", () => {
    const card = makeCard(5, { freeCenter: true, found: [0, 1] });
    expect(progress(card)).toEqual({ found: 2, total: 24 });
  });
});
