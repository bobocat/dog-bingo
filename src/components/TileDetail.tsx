"use client";

import { useEffect } from "react";
import type { Tile } from "@/domain/types";
import { TileArt } from "./TileArt";

/** Identification sheet (§15): "Does the dog I'm looking at match this tile?" */
export function TileDetail({ tile, onClose }: { tile: Tile; onClose(): void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const facts: Array<[string, string | undefined]> = [
    ["How to spot it", tile.identificationTips],
    ["Typical size", tile.sizeNotes],
    ["Coat & color", tile.coatNotes],
  ];

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tile-detail-title"
        data-testid="tile-detail"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface anim-rise max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[var(--radius-card)] pb-[calc(var(--safe-bottom)+16px)] shadow-[var(--shadow-pop)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 pt-3 pb-2">
          <span
            className={[
              "rounded-full px-2 py-0.5 text-xs font-black text-white uppercase",
              tile.rarityCategory === "rare"
                ? "bg-rare"
                : tile.rarityCategory === "uncommon"
                  ? "bg-uncommon"
                  : "bg-common",
            ].join(" ")}
          >
            {tile.rarityCategory}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="bg-surface-muted flex h-11 w-11 items-center justify-center rounded-full text-xl font-black"
          >
            ×
          </button>
        </div>

        <div className="mx-4 aspect-square overflow-hidden rounded-[var(--radius-card)]">
          <TileArt tile={tile} size="detail" />
        </div>

        <h2 id="tile-detail-title" className="px-4 pt-4 text-2xl font-black">
          {tile.name}
        </h2>
        {tile.description && (
          <p className="text-muted px-4 pt-1">{tile.description}</p>
        )}

        <dl className="px-4 pt-3">
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="py-2">
                <dt className="text-muted text-xs font-bold tracking-wide uppercase">
                  {k}
                </dt>
                <dd className="text-base leading-snug">{v}</dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}
