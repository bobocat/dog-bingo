"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameModeId, SlotId, Theme, Tile } from "@/domain/types";
import {
  migrateGameState,
  newGame,
  reSpinSlot,
  toggleSlot,
  validateRestoredState,
  type GameState,
} from "./state";
import {
  indexedDbStorage,
  setCurrentThemeSlug,
  type GameStorage,
} from "./storage";

export type GamePhase = "loading" | "options" | "playing";

export interface UseGame {
  phase: GamePhase;
  state: GameState | null;
  tilesById: Map<string, Tile>;
  /** True for one render cycle after the completing transition; consumer clears it. */
  justCompleted: boolean;
  clearJustCompleted(): void;
  start(mode: GameModeId, freeCenter: boolean): void;
  toggle(slotId: SlotId): void;
  respin(slotId: SlotId): { newTile: Tile } | null;
  abandon(): void;
  error: string | null;
}

/**
 * Wires pure game state to React + persistence. Persists after every mutation.
 * Restores the current game for this theme on mount.
 */
export function useGame(
  theme: Theme,
  storage: GameStorage = indexedDbStorage,
): UseGame {
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [state, setState] = useState<GameState | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef<GameState | null>(null);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const tilesById = useMemo(
    () => new Map(theme.tiles.map((t) => [t.id, t])),
    [theme],
  );

  // Restore on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = storage.getCurrentGameId();
      if (!id) return setPhase("options");
      try {
        const raw = await storage.load(id);
        if (cancelled) return;
        const loaded = raw ? migrateGameState(raw) : null;
        if (
          loaded &&
          loaded.game.themeId === theme.id &&
          validateRestoredState(loaded, tilesById)
        ) {
          setState(loaded);
          setPhase("playing");
          // Persist the migrated shape so future loads skip migration.
          storage.save(loaded).catch(() => {});
        } else {
          console.warn(
            "dog-bingo: save could not be restored; starting fresh",
            id,
          );
          storage.setCurrentGameId(null);
          setCurrentThemeSlug(null);
          setPhase("options");
        }
      } catch {
        if (!cancelled) setPhase("options");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [theme.id, tilesById, storage]);

  const persist = useCallback(
    (next: GameState) => {
      setState(next);
      storage.save(next).catch((e) => setError(String(e)));
    },
    [storage],
  );

  const start = useCallback(
    (mode: GameModeId, freeCenter: boolean) => {
      try {
        const s = newGame({ theme, mode, freeCenter });
        storage.setCurrentGameId(s.game.id);
        setCurrentThemeSlug(theme.slug);
        // Ask the browser not to evict our IndexedDB under storage pressure.
        try {
          void navigator.storage?.persist?.();
        } catch {
          /* unsupported */
        }
        persist(s);
        setJustCompleted(false);
        setPhase("playing");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [theme, storage, persist],
  );

  const toggle = useCallback(
    (slotId: SlotId) => {
      const cur = stateRef.current;
      if (!cur) return;
      const r = toggleSlot(cur, slotId);
      if (r.state !== cur) persist(r.state);
      if (r.justCompleted) setJustCompleted(true);
    },
    [persist],
  );

  const respin = useCallback(
    (slotId: SlotId) => {
      const cur = stateRef.current;
      if (!cur) return null;
      try {
        const r = reSpinSlot(cur, slotId, theme.tiles);
        persist(r.state);
        return { newTile: r.newTile };
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      }
    },
    [theme.tiles, persist],
  );

  // Re-save when the app is backgrounded or the page is going away, so an
  // OS killing the tab right after a tap cannot lose the last mutation.
  useEffect(() => {
    const flush = () => {
      const cur = stateRef.current;
      if (cur) storage.save(cur).catch(() => {});
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [storage]);

  const abandon = useCallback(() => {
    const cur = stateRef.current;
    if (cur) storage.remove(cur.game.id).catch(() => {});
    storage.setCurrentGameId(null);
    setCurrentThemeSlug(null);
    setState(null);
    setJustCompleted(false);
    setPhase("options");
  }, [storage]);

  return {
    phase,
    state,
    tilesById,
    justCompleted,
    clearJustCompleted: () => setJustCompleted(false),
    start,
    toggle,
    respin,
    abandon,
    error,
  };
}
