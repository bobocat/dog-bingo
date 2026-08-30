"use client";

import type { GameModeId } from "@/domain/types";

export interface CompletionOverlayProps {
  mode: GameModeId;
  found: number;
  total: number;
  elapsedMs: number;
  respinsUsed: number;
  onPlayAgain(): void;
  onNewCard(): void;
  onThemes(): void;
  reducedMotion: boolean;
}

function fmt(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

const PIECES = Array.from({ length: 36 }, (_, i) => i);
const COLORS = ["#e8743b", "#4caf7d", "#8a5cf6", "#3b82f6", "#fbbf24"];

export function CompletionOverlay(p: CompletionOverlayProps) {
  const headline = p.mode === "bingo" ? "BINGO!" : "CARD COMPLETE!";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      role="dialog"
      aria-modal="true"
      aria-label={headline}
      data-testid="completion"
      style={{
        animation: p.reducedMotion
          ? undefined
          : "rise 300ms ease-out 450ms both",
      }}
    >
      {!p.reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          {PIECES.map((i) => (
            <span
              key={i}
              className="absolute top-0 block h-3 w-2 rounded-sm"
              style={{
                left: `${(i * 37) % 100}%`,
                background: COLORS[i % COLORS.length],
                animation: `confetti-fall ${2.2 + (i % 5) * 0.3}s linear ${(i % 7) * 0.15}s both`,
              }}
            />
          ))}
        </div>
      )}
      <div className="bg-surface anim-rise w-full max-w-sm rounded-[var(--radius-card)] p-6 text-center shadow-[var(--shadow-pop)]">
        <p className="text-6xl" aria-hidden>
          🎉
        </p>
        <h2 className="text-accent-strong pt-2 text-4xl font-black tracking-tight">
          {headline}
        </h2>
        <p className="text-muted pt-2">
          {p.found} / {p.total} found · {fmt(p.elapsedMs)} · {p.respinsUsed}{" "}
          re-spin{p.respinsUsed === 1 ? "" : "s"} used
        </p>
        <div className="flex flex-col gap-2 pt-6">
          <button
            type="button"
            onClick={p.onPlayAgain}
            className="bg-accent min-h-[var(--touch-min)] rounded-full py-3 text-lg font-black text-white active:scale-95"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={p.onNewCard}
            className="bg-surface-muted min-h-[var(--touch-min)] rounded-full py-3 text-lg font-bold active:scale-95"
          >
            Change game options
          </button>
          <button
            type="button"
            onClick={p.onThemes}
            className="text-muted min-h-[var(--touch-min)] py-2 font-bold"
          >
            Back to themes
          </button>
        </div>
      </div>
    </div>
  );
}
