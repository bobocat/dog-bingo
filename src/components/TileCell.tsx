"use client";

import { useEffect, useRef, useState } from "react";
import type { CardSlot, Tile } from "@/domain/types";
import { TileArt } from "./TileArt";

export interface TileCellProps {
  slot: CardSlot;
  tile: Tile | null;
  canReSpin: boolean;
  /** Presentation-only candidates cycled during the re-spin animation. */
  spinCandidates: Tile[];
  onToggle(slotId: string): void;
  onInfo(tile: Tile): void;
  /** Must return the predetermined replacement synchronously (domain decides, UI animates). */
  onReSpin(slotId: string): { newTile: Tile } | null;
  reducedMotion: boolean;
}

const RARITY_LABEL: Record<Tile["rarityCategory"], string> = {
  common: "C",
  uncommon: "U",
  rare: "R",
};

export function TileCell(p: TileCellProps) {
  const { slot, tile } = p;
  const [spinning, setSpinning] = useState<Tile | null>(null); // currently shown candidate during spin
  const [settled, setSettled] = useState(false);
  const [popKey, setPopKey] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (slot.isFree) {
    return (
      <div
        className="bg-accent text-surface flex h-full w-full items-center justify-center rounded-[var(--radius-tile)] text-center text-[clamp(11px,3vw,16px)] font-black tracking-wide shadow-[var(--shadow-tile)]"
        aria-label="Free space"
      >
        FREE
      </div>
    );
  }
  if (!tile)
    return (
      <div className="bg-surface-muted h-full w-full rounded-[var(--radius-tile)]" />
    );

  const busy = spinning !== null;

  function handleReSpin(e: React.MouseEvent | React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (busy) return;
    const result = p.onReSpin(slot.id); // state updates now; we only animate toward it
    if (!result) return;
    if (p.reducedMotion) {
      setSettled(true);
      timers.current.push(window.setTimeout(() => setSettled(false), 400));
      return;
    }
    const seq = [...p.spinCandidates].filter((c) => c.id !== result.newTile.id);
    // ~1.5s total, accelerating gaps: 60,60,70,80,100,120,150,190,240,300
    const gaps = [60, 60, 70, 80, 100, 120, 150, 190, 240, 300];
    let t = 0;
    gaps.forEach((gap, i) => {
      t += gap;
      const candidate = seq[i % Math.max(seq.length, 1)] ?? result.newTile;
      timers.current.push(window.setTimeout(() => setSpinning(candidate), t));
    });
    timers.current.push(
      window.setTimeout(() => {
        setSpinning(null);
        setSettled(true);
        timers.current.push(window.setTimeout(() => setSettled(false), 400));
      }, t + 200),
    );
    setSpinning(seq[0] ?? result.newTile);
  }

  function handleTap() {
    if (busy) return;
    p.onToggle(slot.id);
    setPopKey((k) => k + 1);
  }

  const shown = spinning ?? tile;
  const showReSpin = p.canReSpin && !slot.isFound && !busy;
  const label = shown.shortName ?? shown.name;

  return (
    <div
      key={popKey}
      role="button"
      tabIndex={0}
      aria-pressed={slot.isFound}
      aria-label={`${tile.name}${slot.isFound ? ", found" : ""}`}
      onClick={handleTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTap();
        }
      }}
      data-testid={`slot-${slot.position}`}
      data-found={slot.isFound}
      className={[
        "bg-surface relative h-full w-full overflow-hidden rounded-[var(--radius-tile)] shadow-[var(--shadow-tile)] select-none",
        "outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]",
        popKey ? "anim-pop" : "",
        settled ? "anim-settle" : "",
        busy ? "ring-4 ring-[var(--accent)]" : "",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 transition-[filter,opacity]",
          slot.isFound ? "opacity-60 saturate-50" : "",
        ].join(" ")}
      >
        <TileArt tile={shown} />
      </div>

      {/* label */}
      <div
        className={[
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-4 pb-1 pl-1",
          showReSpin ? "pr-6" : "pr-1",
        ].join(" ")}
      >
        <p className="line-clamp-2 text-center text-[clamp(9px,2.6vw,13px)] leading-tight font-bold text-white drop-shadow">
          {label}
        </p>
      </div>

      {/* rarity pip */}
      <span
        aria-label={`Rarity: ${shown.rarityCategory}`}
        className={[
          "absolute top-1 left-1 rounded-full px-1.5 text-[9px] font-black text-white",
          shown.rarityCategory === "rare"
            ? "bg-rare"
            : shown.rarityCategory === "uncommon"
              ? "bg-uncommon"
              : "bg-common",
        ].join(" ")}
      >
        {RARITY_LABEL[shown.rarityCategory]}
      </span>

      {/* found stamp */}
      {slot.isFound && (
        <div className="anim-stamp pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-found flex h-[52%] w-[52%] items-center justify-center rounded-full border-4 border-white shadow-[var(--shadow-pop)]">
            <svg
              viewBox="0 0 24 24"
              className="h-[65%] w-[65%]"
              fill="none"
              stroke="white"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12l5 5L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* info */}
      {!slot.isFound && (
        <button
          type="button"
          aria-label={`About ${tile.name}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!busy) p.onInfo(tile);
          }}
          className="absolute top-0 right-0 flex h-[min(max(30%,28px),42%)] w-[min(max(30%,28px),42%)] items-start justify-end p-1"
        >
          <span className="bg-surface/90 text-foreground flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black shadow">
            i
          </span>
        </button>
      )}

      {/* re-spin */}
      {showReSpin && (
        <button
          type="button"
          aria-label="Re-spin this tile"
          data-testid={`respin-${slot.position}`}
          onClick={handleReSpin}
          className="absolute right-0 bottom-0 flex h-[min(max(32%,30px),44%)] w-[min(max(32%,30px),44%)] items-end justify-end p-1"
        >
          <span className="bg-accent flex h-[22px] w-[22px] items-center justify-center rounded-full text-white shadow">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 12a9 9 0 1 1-2.6-6.4" />
              <path d="M21 3v6h-6" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
