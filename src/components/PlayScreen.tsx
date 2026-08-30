"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { Theme, Tile } from "@/domain/types";
import { GAME_MODES, progress } from "@/domain/win-conditions";
import { useGame } from "@/features/game/useGame";
import { CardGrid } from "./CardGrid";
import { CompletionOverlay } from "./CompletionOverlay";
import { OptionsScreen } from "./OptionsScreen";
import { TileDetail } from "./TileDetail";

const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(RM_QUERY).matches,
    () => false,
  );
}

export function PlayScreen({ theme }: { theme: Theme }) {
  const game = useGame(theme);
  const router = useRouter();
  const [detail, setDetail] = useState<Tile | null>(null);
  const [dismissedGameId, setDismissedGameId] = useState<string | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const reducedMotion = useReducedMotion();

  if (game.phase === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-muted font-bold">Loading…</p>
      </main>
    );
  }
  if (game.phase === "options" || !game.state) {
    return (
      <OptionsScreen theme={theme} onStart={game.start} error={game.error} />
    );
  }

  const { state } = game;
  const prog = progress(state.card);
  const respins = state.player.respinsRemaining;
  const modeLabel =
    state.game.gameMode === "full_card"
      ? (theme.fullCardLabel ?? GAME_MODES.full_card.label)
      : GAME_MODES.bingo.label;
  const completed = state.game.status === "completed";

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden px-3 pt-[calc(var(--safe-top)+8px)] pb-[calc(var(--safe-bottom)+12px)]">
      <header className="flex items-center justify-between px-1 py-2">
        <div>
          <h1 className="text-lg leading-tight font-black">{theme.name}</h1>
          <p className="text-muted text-xs font-bold">{modeLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="bg-surface rounded-full px-3 py-1.5 text-sm font-black shadow-[var(--shadow-tile)]"
            data-testid="progress"
          >
            {prog.found} / {prog.total}
          </div>
          <div
            className={[
              "rounded-full px-3 py-1.5 text-sm font-black shadow-[var(--shadow-tile)]",
              respins > 0
                ? "bg-accent text-white"
                : "bg-surface-muted text-muted",
            ].join(" ")}
            aria-live="polite"
            data-testid="respins"
          >
            Re-spins: {respins}
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 py-1">
        <CardGrid
          card={state.card}
          tilesById={game.tilesById}
          allTiles={theme.tiles}
          respinsRemaining={completed ? 0 : respins}
          onToggle={game.toggle}
          onInfo={setDetail}
          onReSpin={game.respin}
          reducedMotion={reducedMotion}
        />
      </div>

      <footer className="flex items-center justify-between px-1 pt-3">
        <Link
          href="/"
          className="text-muted min-h-[var(--touch-min)] py-2 text-sm font-bold"
        >
          ← Themes
        </Link>
        {confirmNew ? (
          <span className="flex items-center gap-2 text-sm font-bold">
            <span className="text-muted">Abandon card?</span>
            <button
              type="button"
              onClick={() => game.abandon()}
              className="min-h-[var(--touch-min)] px-2 text-red-700"
              data-testid="confirm-new-game"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirmNew(false)}
              className="text-muted min-h-[var(--touch-min)] px-2"
            >
              No
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmNew(true)}
            className="text-muted min-h-[var(--touch-min)] py-2 text-sm font-bold"
            data-testid="new-game"
          >
            New card
          </button>
        )}
      </footer>

      {game.error && (
        <p role="alert" className="px-1 pt-2 text-sm font-bold text-red-700">
          {game.error}
        </p>
      )}

      {detail && <TileDetail tile={detail} onClose={() => setDetail(null)} />}

      {completed && dismissedGameId !== state.game.id && (
        <CompletionOverlay
          mode={state.game.gameMode}
          found={prog.found}
          total={prog.total}
          elapsedMs={
            (state.completedAt ?? state.game.endedAt ?? 0) -
            (state.game.startedAt ?? state.game.createdAt)
          }
          respinsUsed={state.game.config.respins - respins}
          reducedMotion={reducedMotion}
          onPlayAgain={() => {
            setDismissedGameId(state.game.id);
            game.start(state.game.gameMode, state.game.config.freeCenter);
          }}
          onNewCard={() => {
            setDismissedGameId(state.game.id);
            game.abandon();
          }}
          onThemes={() => {
            setDismissedGameId(state.game.id);
            router.push("/");
          }}
        />
      )}
    </main>
  );
}
