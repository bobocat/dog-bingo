import type {
  Card,
  CardSlot,
  GameMode,
  GameModeId,
  WinCondition,
} from "./types";

/** Default game modes (§5). Labels are defaults; themes may override presentation. */
export const GAME_MODES: Record<GameModeId, GameMode> = {
  bingo: { id: "bingo", label: "Bingo", winCondition: { type: "any_line" } },
  full_card: {
    id: "full_card",
    label: "Full Card",
    winCondition: { type: "full_card" },
  },
};

/** A slot counts as satisfied if it is found or a free space. */
function satisfied(slot: CardSlot): boolean {
  return slot.isFree || slot.isFound;
}

function slotsByPosition(card: Card): CardSlot[] {
  return [...card.slots].sort((a, b) => a.position - b.position);
}

export type Line = {
  kind: "row" | "column" | "diagonal";
  index: number;
  positions: number[];
};

/**
 * Enumerate all rows, columns and (for square cards only) both diagonals
 * as position lists.
 */
export function allLines(columns: number, rows: number): Line[] {
  const lines: Line[] = [];
  for (let r = 0; r < rows; r++) {
    lines.push({
      kind: "row",
      index: r,
      positions: Array.from({ length: columns }, (_, c) => r * columns + c),
    });
  }
  for (let c = 0; c < columns; c++) {
    lines.push({
      kind: "column",
      index: c,
      positions: Array.from({ length: rows }, (_, r) => r * columns + c),
    });
  }
  if (columns === rows) {
    lines.push({
      kind: "diagonal",
      index: 0,
      positions: Array.from({ length: columns }, (_, i) => i * columns + i),
    });
    lines.push({
      kind: "diagonal",
      index: 1,
      positions: Array.from({ length: columns }, (_, i) => i * columns + (columns - 1 - i)),
    });
  }
  return lines;
}

/** Lines that are fully satisfied on this card. */
export function completedLines(card: Card): Line[] {
  const flat = slotsByPosition(card);
  return allLines(card.columns, card.rows).filter((line) =>
    line.positions.every((p) => satisfied(flat[p])),
  );
}

export function isCardComplete(card: Card): boolean {
  return card.slots.every(satisfied);
}

export function fourCornersComplete(card: Card): boolean {
  const flat = slotsByPosition(card);
  const c = card.columns;
  const r = card.rows;
  return [0, c - 1, c * (r - 1), c * r - 1].every((p) => satisfied(flat[p]));
}

/**
 * Evaluate a win condition against a card. Pure; safe to call on every state
 * change. Callers are responsible for firing completion exactly once
 * (compare previous vs. next result).
 */
export function isWinSatisfied(card: Card, condition: WinCondition): boolean {
  switch (condition.type) {
    case "full_card":
      return isCardComplete(card);
    case "four_corners":
      return fourCornersComplete(card);
    case "any_line":
      return completedLines(card).length > 0;
    case "row":
      return completedLines(card).some((l) => l.kind === "row");
    case "column":
      return completedLines(card).some((l) => l.kind === "column");
    case "diagonal":
      return completedLines(card).some((l) => l.kind === "diagonal");
    case "lines":
      return completedLines(card).length >= condition.count;
  }
}

/** Count of found (non-free) slots vs. playable slots, e.g. "14 / 24". */
export function progress(card: Card): { found: number; total: number } {
  const playable = card.slots.filter((s) => !s.isFree);
  return {
    found: playable.filter((s) => s.isFound).length,
    total: playable.length,
  };
}
