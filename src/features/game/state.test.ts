import { describe, expect, it } from "vitest";
import { seededRandom } from "@/domain/random";
import { DOG_THEME } from "@/themes/dog";
import {
  migrateGameState,
  newGame,
  reSpinSlot,
  toggleSlot,
  validateRestoredState,
} from "./state";
import { memoryStorage } from "./storage";

const tilesById = new Map(DOG_THEME.tiles.map((t) => [t.id, t]));

describe("newGame", () => {
  it("creates an active game with 3 re-spins and a balanced card", () => {
    const s = newGame({
      theme: DOG_THEME,
      mode: "bingo",
      rng: seededRandom(1),
      now: 1000,
    });
    expect(s.game.status).toBe("active");
    expect(s.player.respinsRemaining).toBe(3);
    expect(s.card.rarityScore).toBe(27); // 8 + 5*2 + 3*3 on the 4x4 card
    expect(s.game.winCondition).toEqual({ type: "any_line" });
  });
});

describe("toggleSlot", () => {
  it("toggles found and undoes", () => {
    const s0 = newGame({
      theme: DOG_THEME,
      mode: "bingo",
      rng: seededRandom(1),
    });
    const slot = s0.card.slots[0];
    const { state: s1 } = toggleSlot(s0, slot.id, 5);
    expect(s1.card.slots[0].isFound).toBe(true);
    expect(s1.card.slots[0].foundAt).toBe(5);
    const { state: s2 } = toggleSlot(s1, slot.id);
    expect(s2.card.slots[0].isFound).toBe(false);
    expect(s2.card.slots[0].foundAt).toBeUndefined();
  });

  it("deals no free slot on the 4x4 Loteria card", () => {
    const s0 = newGame({
      theme: DOG_THEME,
      mode: "bingo",
      rng: seededRandom(1),
    });
    expect(s0.card.slots.some((x) => x.isFree)).toBe(false);
    expect(s0.card.slots).toHaveLength(16);
  });

  it("ignores a free slot when one exists", () => {
    const s0 = newGame({
      theme: { ...DOG_THEME, defaultCardColumns: 5, defaultCardRows: 3 },
      mode: "bingo",
      freeCenter: true,
      rng: seededRandom(1),
    });
    const free = s0.card.slots.find((x) => x.isFree)!;
    const { state } = toggleSlot(s0, free.id);
    expect(state).toBe(s0);
  });

  it("fires completion exactly once on the completing transition", () => {
    let s = newGame({ theme: DOG_THEME, mode: "bingo", rng: seededRandom(1) });
    const results: boolean[] = [];
    for (const pos of [0, 1, 2]) {
      const r = toggleSlot(s, s.card.slots[pos].id);
      s = r.state;
      results.push(r.justCompleted);
    }
    expect(results).toEqual([false, false, false]);
    const r = toggleSlot(s, s.card.slots[3].id, 99); // completes row 0
    expect(r.justCompleted).toBe(true);
    expect(r.state.game.status).toBe("completed");
    expect(r.state.completedAt).toBe(99);
    // further toggles never re-fire and game is frozen
    const again = toggleSlot(r.state, r.state.card.slots[5].id);
    expect(again.justCompleted).toBe(false);
    expect(again.state).toBe(r.state);
  });
});

describe("reSpinSlot", () => {
  it("consumes exactly one re-spin and records history", () => {
    const s0 = newGame({
      theme: DOG_THEME,
      mode: "full_card",
      rng: seededRandom(2),
    });
    const r = reSpinSlot(
      s0,
      s0.card.slots[0].id,
      DOG_THEME.tiles,
      seededRandom(3),
    );
    expect(r.state.player.respinsRemaining).toBe(2);
    expect(r.state.respinHistory).toHaveLength(1);
    expect(r.state.card.slots[0].tileId).toBe(r.newTile.id);
  });

  it("stops at zero", () => {
    let s = newGame({
      theme: DOG_THEME,
      mode: "full_card",
      rng: seededRandom(2),
    });
    const rng = seededRandom(4);
    for (let i = 0; i < 3; i++)
      s = reSpinSlot(s, s.card.slots[i].id, DOG_THEME.tiles, rng).state;
    expect(s.player.respinsRemaining).toBe(0);
    expect(() =>
      reSpinSlot(s, s.card.slots[5].id, DOG_THEME.tiles, rng),
    ).toThrow(/No re-spins/);
  });
});

describe("migrateGameState", () => {
  it("migrates a legacy size-based save and it validates", () => {
    const modern = newGame({
      theme: DOG_THEME,
      mode: "bingo",
      rng: seededRandom(9),
    });
    const legacy = structuredClone(modern) as unknown as Record<
      string,
      unknown
    >;
    const card = legacy.card as Record<string, unknown>;
    card.size = card.columns;
    delete card.columns;
    delete card.rows;
    const cfg = (legacy.game as { config: Record<string, unknown> }).config;
    cfg.cardSize = cfg.cardColumns;
    delete cfg.cardColumns;
    delete cfg.cardRows;

    const migrated = migrateGameState(legacy)!;
    expect(migrated).not.toBeNull();
    expect(migrated.card.columns).toBe(4);
    expect(migrated.card.rows).toBe(4);
    expect(migrated.game.config.cardColumns).toBe(4);
    expect(validateRestoredState(migrated, tilesById)).toBe(true);
  });

  it("passes modern saves through unchanged and rejects junk", () => {
    const modern = newGame({
      theme: DOG_THEME,
      mode: "bingo",
      rng: seededRandom(9),
    });
    expect(migrateGameState(structuredClone(modern))).toEqual(modern);
    expect(migrateGameState(null)).toBeNull();
    expect(migrateGameState({ schemaVersion: 99 })).toBeNull();
  });
});

describe("persistence round trip", () => {
  it("restores identical state through storage", async () => {
    const store = memoryStorage();
    let s = newGame({ theme: DOG_THEME, mode: "bingo", rng: seededRandom(5) });
    s = toggleSlot(s, s.card.slots[3].id).state;
    s = reSpinSlot(
      s,
      s.card.slots[8].id,
      DOG_THEME.tiles,
      seededRandom(6),
    ).state;
    await store.save(s);
    store.setCurrentGameId(s.game.id);
    const loaded = await store.load(store.getCurrentGameId()!);
    expect(loaded).toEqual(s);
    expect(validateRestoredState(loaded, tilesById)).toBe(true);
  });

  it("rejects corrupted state with duplicate tiles", () => {
    const s = newGame({
      theme: DOG_THEME,
      mode: "bingo",
      rng: seededRandom(5),
    });
    const bad = {
      ...s,
      card: {
        ...s.card,
        slots: s.card.slots.map((x, i) =>
          i === 1 ? { ...x, tileId: s.card.slots[0].tileId } : x,
        ),
      },
    };
    expect(validateRestoredState(bad, tilesById)).toBe(false);
    expect(validateRestoredState(null, tilesById)).toBe(false);
    expect(validateRestoredState({ schemaVersion: 2 }, tilesById)).toBe(false);
  });
});
