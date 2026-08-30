"use client";

import Link from "next/link";
import { useState } from "react";
import type { GameModeId, Theme } from "@/domain/types";
import { GAME_MODES } from "@/domain/win-conditions";

export function OptionsScreen({
  theme,
  onStart,
  error,
}: {
  theme: Theme;
  onStart(mode: GameModeId, freeCenter: boolean): void;
  error: string | null;
}) {
  const [mode, setMode] = useState<GameModeId>(theme.defaultGameMode);
  const [freeCenter, setFreeCenter] = useState(theme.config.freeCenter);
  const columns = theme.defaultCardColumns;
  const rows = theme.defaultCardRows;
  // A free centre needs a true centre cell (both dimensions odd).
  const hasCenter = columns % 2 === 1 && rows % 2 === 1;

  const modes: Array<{ id: GameModeId; label: string; blurb: string }> = [
    {
      id: "full_card",
      label: theme.fullCardLabel ?? GAME_MODES.full_card.label,
      blurb: "Find every tile on the card. Best for a long walk.",
    },
    {
      id: "bingo",
      label: GAME_MODES.bingo.label,
      blurb: "Any full row, column, or diagonal wins. Quick game.",
    },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[calc(var(--safe-top)+16px)] pb-[calc(var(--safe-bottom)+24px)]">
      <Link
        href="/"
        className="text-muted min-h-[var(--touch-min)] py-2 font-bold"
      >
        ← Themes
      </Link>
      <h1 className="pt-2 text-4xl font-black tracking-tight">{theme.name}</h1>
      <p className="text-muted pt-1">{theme.description}</p>

      <h2 className="pt-8 text-sm font-black tracking-wide uppercase">
        Game mode
      </h2>
      <div
        className="flex flex-col gap-3 pt-3"
        role="radiogroup"
        aria-label="Game mode"
      >
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => setMode(m.id)}
            data-testid={`mode-${m.id}`}
            className={[
              "bg-surface rounded-[var(--radius-tile)] border-4 p-4 text-left shadow-[var(--shadow-tile)] active:scale-[0.98]",
              mode === m.id ? "border-[var(--accent)]" : "border-transparent",
            ].join(" ")}
          >
            <span className="block text-xl font-black">{m.label}</span>
            <span className="text-muted block pt-1">{m.blurb}</span>
          </button>
        ))}
      </div>

      {hasCenter && (
        <label className="bg-surface mt-6 flex min-h-[var(--touch-min)] items-center justify-between rounded-[var(--radius-tile)] p-4 shadow-[var(--shadow-tile)]">
          <span>
            <span className="block font-black">Free center space</span>
            <span className="text-muted block text-sm">
              {columns}×{rows} card, {columns * rows - (freeCenter ? 1 : 0)}{" "}
              tiles to find
            </span>
          </span>
          <input
            type="checkbox"
            checked={freeCenter}
            onChange={(e) => setFreeCenter(e.target.checked)}
            className="accent-accent h-7 w-7"
          />
        </label>
      )}

      {error && (
        <p role="alert" className="pt-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <div className="flex-1" />
      <button
        type="button"
        onClick={() => onStart(mode, freeCenter)}
        data-testid="start-game"
        className="bg-accent mt-8 min-h-14 rounded-full py-4 text-xl font-black text-white shadow-[var(--shadow-pop)] active:scale-95 disabled:opacity-40"
      >
        Deal my card
      </button>
    </main>
  );
}
