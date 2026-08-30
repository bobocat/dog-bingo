"use client";

import { memo, useMemo } from "react";
import { canReSpin as canReSpinSlot } from "@/domain/respin";
import type { Card, Tile } from "@/domain/types";
import { TileCell } from "./TileCell";

export interface CardGridProps {
  card: Card;
  tilesById: Map<string, Tile>;
  allTiles: readonly Tile[];
  respinsRemaining: number;
  onToggle(slotId: string): void;
  onInfo(tile: Tile): void;
  onReSpin(slotId: string): { newTile: Tile } | null;
  reducedMotion: boolean;
}

function CardGridInner(p: CardGridProps) {
  // Presentation-only candidates for the slot-machine animation (§16.5).
  const spinCandidates = useMemo(() => {
    const onCard = new Set(p.card.slots.map((s) => s.tileId));
    return p.allTiles.filter((t) => t.active && !onCard.has(t.id)).slice(0, 12);
  }, [p.allTiles, p.card.slots]);

  return (
    <div
      className="grid h-full w-full gap-[var(--tile-gap)]"
      style={{
        gridTemplateColumns: `repeat(${p.card.size}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${p.card.size}, minmax(0, 1fr))`,
      }}
      role="grid"
      aria-label="Bingo card"
    >
      {p.card.slots.map((slot) => (
        <TileCell
          key={slot.id}
          slot={slot}
          tile={slot.tileId ? (p.tilesById.get(slot.tileId) ?? null) : null}
          canReSpin={canReSpinSlot(slot, p.respinsRemaining)}
          spinCandidates={spinCandidates}
          onToggle={p.onToggle}
          onInfo={p.onInfo}
          onReSpin={p.onReSpin}
          reducedMotion={p.reducedMotion}
        />
      ))}
    </div>
  );
}

export const CardGrid = memo(CardGridInner);
